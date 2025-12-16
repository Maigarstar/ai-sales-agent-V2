import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// FORCE DYNAMIC: This ensures the route always checks for the latest keys
export const dynamic = "force-dynamic";
export const revalidate = 0;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type LeadMetadata = {
  score?: number;
  lead_type?: "Hot" | "Warm" | "Cold";
  business_category?: string | null;
  location?: string | null;
  client_budget?: string | null;
  follow_up_next_step?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  couple_destination?: string | null;
  couple_guest_count?: string | null;
  source?: string | null;
  [key: string]: any;
};

// FIX 1: THE SECRET TUNNEL
// Look for LIVE_OPENAI_KEY first. If that fails, look for standard key.
// Finally, fallback to 'dummy-key' so the build never crashes.
const apiKey = process.env.LIVE_OPENAI_KEY || process.env.OPENAI_API_KEY || "dummy-key";

const client = new OpenAI({
  apiKey: apiKey,
});

// FIX 2: Add placeholder fallbacks for Supabase variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

function getSupabaseServerClient() {
  // FIX 3: If we are building (using placeholder), return null safely
  if (supabaseUrl === "https://placeholder.supabase.co" || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const messages: ChatMessage[] = body.messages || [];

    // We keep chatType support but default to couple for your widget
    const chatType: "vendor" | "couple" =
      body.chatType === "vendor" || body.mode === "vendor"
        ? "vendor"
        : "couple";

    const organisationId: string =
      body.organisationId || "9ecd45ab-6ed2-46fa-914b-82be313e06e4";
    const agentId: string =
      body.agentId || "70660422-489c-4b7d-81ae-b786e43050db";

    let conversationId: string | null =
      typeof body.conversation_id === "string"
        ? (body.conversation_id as string)
        : null;

    if (messages.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No messages supplied" },
        { status: 400 }
      );
    }

    // RUNTIME CHECK: Ensure we have a real key before calling OpenAI
    if (!apiKey || apiKey.startsWith("dummy")) {
       console.error("VENDORS CHAT ERROR: OpenAI Key is missing or invalid in Production.");
       return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY missing or invalid" },
        { status: 500 }
      );
    }

    const lastUserMessage = [...messages].reverse().find(
      (m) => m.role === "user"
    );

    if (!lastUserMessage) {
      return NextResponse.json(
        { ok: false, error: "No user message found" },
        { status: 400 }
      );
    }

    // SYSTEM PROMPT

    const systemPrompt =
      chatType === "vendor"
        ? `
You are the AI Vendor Qualification Assistant for 5 Star Weddings.

First, write a warm, natural reply for the business. Then, after that, output metadata in valid JSON inside a <metadata> block.

Example format:

Thank you for getting in touch, reply text here, only natural language.

<metadata>
{
  "score": 0,
  "lead_type": "Warm",
  "business_category": "Venue",
  "location": "Italy",
  "client_budget": null,
  "follow_up_next_step": null,
  "name": null,
  "email": null,
  "phone": null,
  "couple_destination": null,
  "couple_guest_count": null,
  "source": "web_chat"
}
</metadata>

Rules:
- The reply must come first, with no <reply> tags.
- Then a single <metadata> block that contains JSON only.
- If you do not know a field, set it to null.
`.trim()
        : `
You are the AI Wedding Concierge for couples on 5 Star Weddings.

First, write a warm, encouraging reply for the couple. Then, after that, output metadata in valid JSON inside a <metadata> block.

Example format:

Thank you for your message, reply text here, only natural language.

<metadata>
{
  "score": 0,
  "lead_type": "Warm",
  "business_category": "Couple",
  "location": "Italy",
  "client_budget": null,
  "follow_up_next_step": null,
  "name": null,
  "email": null,
  "phone": null,
  "couple_destination": null,
  "couple_guest_count": null,
  "source": "web_chat"
}
</metadata>

Rules:
- The reply must come first, with no <reply> tags.
- Then a single <metadata> block that contains JSON only.
- If you do not know a field, set it to null.
`.trim();

    // CALL OPENAI

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });

    const fullContent = completion.choices[0]?.message?.content || "";

    // PARSE REPLY AND METADATA

    let replyText = fullContent.trim();
    let metadata: LeadMetadata = {};

    const lower = fullContent.toLowerCase();
    const metaStart = lower.indexOf("<metadata>");
    const metaEnd = lower.indexOf("</metadata>");

    if (metaStart !== -1 && metaEnd !== -1 && metaEnd > metaStart) {
      // Everything before <metadata> is the visible reply
      replyText = fullContent.slice(0, metaStart).trim();

      const jsonBlock = fullContent
        .slice(metaStart + "<metadata>".length, metaEnd)
        .trim();

      try {
        metadata = JSON.parse(jsonBlock);
      } catch (err) {
        console.error("Failed parsing metadata JSON", err);
        metadata = {};
      }
    }

    // Fallback if replyText somehow ended empty
    if (!replyText) {
      replyText = fullContent.trim();
    }

    // SUPABASE SAVE PIPELINE

    const supabase = getSupabaseServerClient();
    let leadId: string | null = null;

    if (supabase) {
      // Conversations table

      if (!conversationId) {
        const { data: conv, error: convError } = await supabase
          .from("conversations")
          .insert({
            organisation_id: organisationId,
            agent_id: agentId,
            chat_type: chatType,
            status: "new",
            channel: "web",
            last_user_message_at: new Date().toISOString(),
            // fields used by the admin UI
            user_type: chatType === "vendor" ? "vendor" : "planning",
            first_message: lastUserMessage.content,
            last_message: replyText,
            contact_name: metadata.name ?? null,
            contact_email: metadata.email ?? null,
            contact_phone: metadata.phone ?? null,
          })
          .select("id")
          .single();

        if (convError) {
          console.error("Create conversation error", convError);
        } else if (conv) {
          conversationId = conv.id as string;
        }
      } else {
        const { error: convUpdateError } = await supabase
          .from("conversations")
          .update({
            chat_type: chatType,
            last_user_message_at: new Date().toISOString(),
            last_message: replyText,
            contact_name: metadata.name ?? null,
            contact_email: metadata.email ?? null,
            contact_phone: metadata.phone ?? null,
          })
          .eq("id", conversationId);

        if (convUpdateError) {
          console.error("Update conversation error", convUpdateError);
        }
      }

      // Messages table (existing stream)

      if (conversationId) {
        const inserts = [];

        if (lastUserMessage.content) {
          inserts.push({
            conversation_id: conversationId,
            sender_type: "user",
            content: lastUserMessage.content,
          });
        }

        inserts.push({
          conversation_id: conversationId,
          sender_type: "assistant",
          content: replyText,
        });

        const { error: messagesError } = await supabase
          .from("messages")
          .insert(inserts);

        if (messagesError) {
          console.error("Insert messages error", messagesError);
        }
      }

      // New transcript table used by admin live chat
      if (conversationId) {
        const transcriptRows = [];

        if (lastUserMessage.content) {
          transcriptRows.push({
            conversation_id: conversationId,
            sender_type: chatType === "vendor" ? "vendor" : "couple",
            message: lastUserMessage.content,
          });
        }

        transcriptRows.push({
          conversation_id: conversationId,
          sender_type: "assistant",
          message: replyText,
        });

        const { error: convMsgError } = await supabase
          .from("conversation_messages")
          .insert(transcriptRows);

        if (convMsgError) {
          console.error(
            "conversation_messages insert error",
            convMsgError
          );
        }
      }

      // vendor_leads table

      const { data, error } = await supabase
        .from("vendor_leads")
        .insert({
          organisation_id: organisationId,
          agent_id: agentId,
          chat_type: chatType,
          source: metadata.source || "web_chat",
          raw_chat_messages: messages,
          raw_metadata: metadata,
          score: metadata.score ?? null,
          lead_type: metadata.lead_type ?? null,
          business_category: metadata.business_category ?? null,
          location: metadata.location ?? null,
          budget: metadata.client_budget ?? null,
          follow_up_next_step: metadata.follow_up_next_step ?? null,
          name: metadata.name ?? null,
          email: metadata.email ?? null,
          phone: metadata.phone ?? null,
          couple_destination: metadata.couple_destination ?? null,
          couple_guest_count: metadata.couple_guest_count ?? null,
        })
        .select()
        .single();

      if (error) {
        console.error("vendor_leads insert error", error);
      } else if (data) {
        leadId = data.id as string;

        if (conversationId) {
          const { error: convLeadError } = await supabase
            .from("conversations")
            .update({ lead_id: leadId })
            .eq("id", conversationId);

          if (convLeadError) {
            console.error("Update conversation lead_id error", convLeadError);
          }
        }
      }

      // vendor_messages stream

      if (leadId) {
        const lastContent = lastUserMessage.content || "";

        const { error: vmError } = await supabase
          .from("vendor_messages")
          .insert([
            {
              lead_id: leadId,
              role: "user",
              message: lastContent,
            },
            {
              lead_id: leadId,
              role: "assistant",
              message: replyText,
            },
          ]);

        if (vmError) {
          console.error("vendor_messages insert error", vmError);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      reply: replyText, // this is what the visitor sees
      metadata,
      lead_id: leadId,
      conversation_id: conversationId,
    });
  } catch (err: any) {
    console.error("VENDORS-CHAT API ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}