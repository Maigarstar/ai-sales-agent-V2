import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

type UserType = 'vendor' | 'planning';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatRequestBody = {
  userType: UserType;
  conversationId?: string | null;
  messages: ChatMessage[];

  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompanyOrVenue?: string;
  weddingDate?: string;
  consentGiven?: boolean;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })
    : null;

function buildSystemPrompt(userType: UserType): string {
  if (userType === 'vendor') {
    return `
You are the AI concierge for 5 Star Weddings, speaking to wedding vendors and venues.

Tone: warm, clear, practical, discreet. You are a calm luxury assistant, not a pushy salesperson.

Your goals:
1) Understand what kind of vendor they are, where they are based, and what price level they work in.
2) Offer helpful guidance on attracting luxury couples, working with 5 Star Weddings, and next steps.
3) Keep replies short, clear, and human, usually 2 to 4 short paragraphs or bullet points.
`;
  }

  return `
You are the AI concierge for 5 Star Weddings, speaking to couples or planners who are planning a wedding.

Tone: encouraging, calm, helpful. You are a trusted guide for luxury weddings, not a chatbot.

Your goals:
1) Understand who the wedding is for, where they might like to marry, when, and roughly how many guests and what level of budget.
2) Offer ideas for locations, venue styles, and planning next steps, especially for luxury and destination weddings.
3) Keep replies short, clear, and human, usually 2 to 4 short paragraphs or bullet points.
`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;

    const {
      userType,
      conversationId: existingConversationId,
      messages = [],
      contactName,
      contactEmail,
      contactPhone,
      contactCompanyOrVenue,
      weddingDate,
    } = body;

    if (!userType || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request payload' },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(userType);

    const openAiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: openAiMessages,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      'I am here and ready to help with venues, vendors and planning questions.';

    // first user message and latest reply
    const firstUserMessage =
      messages.find((m) => m.role === 'user')?.content || null;
    const lastMessageContent = reply;

    let conversationId: string | null =
      existingConversationId || null;

    if (supabase) {
      if (!existingConversationId) {
        // create conversation row
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_type: userType,
            status: 'new',
            first_message: firstUserMessage,
            last_message: lastMessageContent,
            contact_name: contactName || null,
            contact_email: contactEmail || null,
            contact_phone: contactPhone || null,
            contact_company: contactCompanyOrVenue || null,
            wedding_date: weddingDate || null,
          })
          .select('id')
          .single();

        if (!error && data && data.id) {
          conversationId = data.id as string;
        } else if (error) {
          console.error('Error creating conversation row', error);
        }
      } else {
        // update existing conversation
        const updateFields: Record<string, any> = {
          last_message: lastMessageContent,
        };

        if (contactName) updateFields.contact_name = contactName;
        if (contactEmail) updateFields.contact_email = contactEmail;
        if (contactPhone) updateFields.contact_phone = contactPhone;
        if (contactCompanyOrVenue) {
          updateFields.contact_company = contactCompanyOrVenue;
        }
        if (weddingDate) updateFields.wedding_date = weddingDate;

        const { error } = await supabase
          .from('conversations')
          .update(updateFields)
          .eq('id', existingConversationId);

        if (error) {
          console.error('Error updating conversation row', error);
        }

        conversationId = existingConversationId;
      }
    }

    return NextResponse.json({
      ok: true,
      reply,
      conversationId,
    });
  } catch (error) {
    console.error('Error in /api/chat', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Chat concierge failed on the server.',
      },
      { status: 500 }
    );
  }
}
