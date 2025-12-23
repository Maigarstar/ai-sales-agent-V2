import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const supabase = createClient();
  const { lead_id } = await req.json();

  const { data: lead } = await supabase.from("vendor_leads").select("*").eq("id", lead_id).single();
  const { data: messages } = await supabase
    .from("chat_messages")
    .select("message, role, created_at")
    .eq("lead_id", lead_id)
    .order("created_at", { ascending: true })
    .limit(5);

  const conversation = messages
    .map((m) => `${m.role === "admin" ? "You" : "Client"}: ${m.message}`)
    .join("\n");

  const prompt = `
You are an assistant at 5 Star Weddings, writing a refined luxury follow-up email.
Lead name: ${lead?.name || "Client"}
Context:
${conversation}

Write a professional, warm, and polished email (HTML format) replying appropriately.
Include a suggested subject line.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [{ role: "user", content: prompt }],
  });

  const reply = completion.choices[0].message?.content || "";
  const [subjectLine, ...bodyLines] = reply.split("\n");
  return NextResponse.json({
    subject: subjectLine.replace(/^Subject:/i, "").trim(),
    html_body: bodyLines.join("\n").trim(),
  });
}
