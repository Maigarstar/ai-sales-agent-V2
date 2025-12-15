import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type LeadType = 'Hot' | 'Warm' | 'Cold'

type AIResponseShape = {
  reply: string
  metadata: {
    score: number
    lead_type: LeadType
    business_category: string | null
    location: string | null
    client_budget: string | null
    follow_up_next_step: string | null
  } | null
}

function jsonOk(payload: any) {
  return NextResponse.json(payload, { status: 200 })
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || ''

    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      ''

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ''

    let body: any = null
    try {
      body = await req.json()
    } catch {
      body = null
    }

    const messages = (body?.messages ?? []) as ChatMessage[]

    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonOk({
        reply:
          'Tell me a little about your wedding business, venue or brand so I can guide you.',
        metadata: null,
      })
    }

    const lastUser = [...messages].reverse().find((m) => m?.role === 'user')

    let replyText = 'I am here and ready to help with your wedding business.'
    let metadata: AIResponseShape['metadata'] = null

    if (!apiKey) {
      const lastText = lastUser?.content ?? 'your message'
      replyText =
        `Developer note, OPENAI_API_KEY is missing so I am running in test mode. ` +
        `I received: "${lastText}".`
    } else {
      const { default: OpenAI } = await import('openai')
      const openai = new OpenAI({ apiKey })

      const systemPrompt = `
You are the AI Vendor Qualification Assistant for 5 Star Weddings.

Return valid JSON in this exact shape only:

{
  "reply": "natural sentence the vendor reads",
  "metadata": {
    "score": number,
    "lead_type": "Hot" | "Warm" | "Cold",
    "business_category": string | null,
    "location": string | null,
    "client_budget": string | null,
    "follow_up_next_step": string | null
  }
}
`.trim()

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.4,
      })

      const rawContent = completion.choices[0]?.message?.content ?? '{}'

      let parsed: Partial<AIResponseShape> = {}
      try {
        parsed = JSON.parse(rawContent)
      } catch {
        parsed = {}
      }

      replyText =
        (typeof parsed.reply === 'string' && parsed.reply.trim()) ||
        'I am here and ready to help with your vendor onboarding.'

      metadata = parsed.metadata ?? null
    }

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })

      const rows: Array<{ role: string; content: string }> = []

      if (lastUser?.content) rows.push({ role: 'user', content: lastUser.content })
      rows.push({ role: 'assistant', content: replyText })

      const { error: chatError } = await supabase
        .from('vendor_chat_messages')
        .insert(rows)

      if (chatError) {
        console.error('Supabase insert error (vendor_chat_messages)', chatError)
      }

      if (metadata) {
        const leadType = metadata.lead_type ?? null
        const score = typeof metadata.score === 'number' ? metadata.score : null

        const shouldSave = leadType === 'Warm' || leadType === 'Hot'

        if (shouldSave) {
          const { error: leadError } = await supabase.from('vendor_leads').insert([
            {
              lead_type: leadType,
              score,
              business_category: metadata.business_category ?? null,
              location: metadata.location ?? null,
            },
          ])

          if (leadError) {
            console.error('Supabase insert error (vendor_leads)', leadError)
          }
        }
      }
    }

    return jsonOk({ reply: replyText, metadata })
  } catch (err: any) {
    console.error('VENDORS CHAT API ERROR:', err)

    return jsonOk({
      reply: `Developer error, ${err?.message || 'unknown error'}. Check the server console.`,
      metadata: null,
    })
  }
}
