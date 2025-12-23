import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient(); // ✅ FIX IS HERE

    const { lead_id } = await req.json();

    if (!lead_id) {
      return NextResponse.json(
        { error: "Missing lead_id" },
        { status: 400 }
      );
    }

    const { data: lead, error: leadError } = await supabase
      .from("vendor_leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    const { data: messages } = await supabase
      .from("chat_messages")
      .select("message, role, created_at")
      .eq("lead_id", lead_id)
      .order("created_at", { ascending: true })
      .limit(5);

    const conversation = (messages || [])
      .map(
        (m) => `${m.role === "admin" ? "You" : "Client"}: ${m.message}`
      )
      .join("\n");

    const prompt = `
You are writing a refined luxury follow-up email on behalf of 5 Star Weddings.

Lead name: ${lead.client_name || "Client"}

Conversation context:
${conversation}

Write a professional, warm, editorial-style email in HTML.
Include a suggested subject line on the first line prefixed with "Subject:".
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
    });

    const reply = completion.choices[0].message?.content || "";

    const [subjectLine, ...bodyLines] = reply.split("\n");

    return NextResponse.json({
      subject: subjectLine.replace(/^Subject:/i, "").trim(),
      html_body: bodyLines.join("\n").trim(),
    });
  } catch (err) {
    console.error("Email draft error:", err);
    return NextResponse.json(
      { error: "Failed to generate email draft" },
      { status: 500 }
    );
  }
}