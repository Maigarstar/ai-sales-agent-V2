"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Load our custom HTML editor (Tiptap wrapper)
const HtmlEditor = dynamic(() => import("@/components/EmailEditor/HtmlEditor"), {
  ssr: false,
});

export default function EmailCampaignsPage() {
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ===== AI MODIFICATIONS (Right Panel) ===== //
  const applyTemplate = (type: string) => {
    if (type === "venues") {
      setMessage(`
<p>Dear <strong>[Venue Name]</strong>,</p>

<p>Your property continues to stand out to our destination couples who are looking for refined service, strong storytelling, and a setting that feels both effortless and elevated.</p>

<p>I would love to introduce your venue to couples planning from the UK, USA, and UAE, many of whom are actively shortlisting wedding destinations for 2025 and 2026.</p>

<p>If you would like more visibility, I can share a short one page outline highlighting how we feature iconic venues on <strong>5starweddingdirectory.com</strong>.</p>

<p>Warm regards,<br/>Taiwo</p>
`);
    }

    if (type === "vendors") {
      setMessage(`
<p>Hi <strong>[Name]</strong>,</p>

<p>Your work has been appearing more frequently in our searches, and it aligns beautifully with what our international couples tend to look for, particularly those planning multi day destination celebrations.</p>

<p>If you're open to it, I can send a brief on how we feature luxury vendors and the criteria we use for visibility upgrades.</p>

<p>Warm regards,<br/>Taiwo</p>
`);
    }

    if (type === "couples") {
      setMessage(`
<p>Hi <strong>[Name]</strong>,</p>

<p>I noticed you’re exploring venues and vendors for your celebration. If you'd like, I can send curated recommendations based on your style, guest count, and destination preferences.</p>

<p>We work with luxury venues and vendors across Europe and beyond, so we can quickly match you with the right options.</p>

<p>Warm regards,<br/>Taiwo</p>
`);
    }
  };

  // ===== SEND EMAIL ===== //
  const sendEmail = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!recipients.trim()) {
      setErrorMsg("No recipients provided");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/send-email", {
      method: "POST",
      body: JSON.stringify({
        recipients,
        subject,
        message,
      }),
    });

    const json = await res.json();

    setLoading(false);

    if (!json.ok) {
      setErrorMsg(json.error || "Failed to send email");
      return;
    }

    setSuccessMsg("Email sent successfully");
    setRecipients("");
    setSubject("");
    setMessage("");
  };

  // ================================================================= //
  //                           UI LAYOUT                               //
  // ================================================================= //
  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-semibold mb-2">Email campaigns</h1>
      <p className="text-sm text-gray-500 mb-10">
        Send targeted messages to your couples, venues and vendors.
      </p>

      {errorMsg && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT PANEL: Email Composer */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recipients */}
          <div>
            <label className="font-semibold">Recipients</label>
            <input
              type="text"
              placeholder="email1@example.com, email2@example.com"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="font-semibold">Subject</label>
            <input
              type="text"
              placeholder="Your subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          {/* Message Editor */}
          <div>
            <label className="font-semibold">Message</label>
            <HtmlEditor value={message} onChange={setMessage} />
          </div>

          {/* SEND BUTTON */}
          <button
            onClick={sendEmail}
            disabled={loading}
            className="bg-[#183F34] text-white px-6 py-2 rounded-md hover:bg-[#0f2a23] disabled:opacity-40"
          >
            {loading ? "Sending…" : "Send email"}
          </button>

          {successMsg && (
            <p className="text-green-700 text-sm mt-3">{successMsg}</p>
          )}
        </div>

        {/* RIGHT PANEL: AI TEMPLATES */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">AI message templates</h3>

          <p className="text-sm text-gray-500 mb-6">
            Choose a preset to instantly populate your email with a polished outreach message.
          </p>

          <div className="space-y-4">

            {/* Venues Outreach */}
            <button
              onClick={() => applyTemplate("venues")}
              className="w-full text-left p-3 rounded-md border border-[#C8A165] text-[#183F34]"
            >
              Venues Outreach
            </button>

            {/* Vendors Outreach */}
            <button
              onClick={() => applyTemplate("vendors")}
              className="w-full text-left p-3 rounded-md border border-blue-400 text-blue-700"
            >
              Vendors Outreach
            </button>

            {/* Couples Outreach */}
            <button
              onClick={() => applyTemplate("couples")}
              className="w-full text-left p-3 rounded-md border border-pink-300 text-pink-600"
            >
              Couples Outreach
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
