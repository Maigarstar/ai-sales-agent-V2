"use client";

import React, { useState } from "react";

export default function EmailMarketingPage() {
  const [recipientInput, setRecipientInput] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; text: string }>(
    null
  );

  async function sendEmail() {
    setStatus(null);

    const recipients = recipientInput
      .split(/[\s,]+/)
      .map((x) => x.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      setStatus({ ok: false, text: "Please enter at least one email address." });
      return;
    }
    if (!subject.trim()) {
      setStatus({ ok: false, text: "Subject cannot be empty." });
      return;
    }
    if (!message.trim()) {
      setStatus({ ok: false, text: "Message cannot be empty." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        body: JSON.stringify({
          recipients,
          subject,
          message,
        }),
      });

      const json = await res.json();

      if (json.ok) {
        setStatus({ ok: true, text: "Emails sent successfully." });
        setRecipientInput("");
        setSubject("");
        setMessage("");
      } else {
        setStatus({ ok: false, text: json.error || "Send failed." });
      }
    } catch (err) {
      console.error(err);
      setStatus({ ok: false, text: "Server error while sending email." });
    }

    setLoading(false);
  }

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#183F34] mb-6">
        Email campaigns
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Send targeted messages to your couples, venues and vendors with Resend.
      </p>

      <div className="bg-white border border-[#EAE7E2] rounded-xl p-6 shadow-sm space-y-6">

        {/* RECIPIENTS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipients
          </label>
          <textarea
            value={recipientInput}
            onChange={(e) => setRecipientInput(e.target.value)}
            placeholder="Add emails separated by spaces or commas: manager@ritz.com events@villabali.com"
            className="w-full border rounded-lg p-3 text-sm"
            rows={3}
          />
        </div>

        {/* SUBJECT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="For example: A curated spotlight for your wedding venue"
            className="w-full border rounded-lg p-3 text-sm"
          />
        </div>

        {/* MESSAGE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Write your email in plain text. Example:\n\nDear [First Name],\n\nI wanted to reach out personally…\n\nWarm regards,\nTaiwo`}
            className="w-full border rounded-lg p-3 text-sm"
            rows={10}
          />
        </div>

        {/* SEND BUTTON */}
        <button
          onClick={sendEmail}
          disabled={loading}
          className="bg-[#183F34] text-white px-6 py-2 rounded-md hover:bg-[#0f2a23] disabled:opacity-40"
        >
          {loading ? "Sending…" : "Send email"}
        </button>

        {/* STATUS MESSAGE */}
        {status && (
          <p
            className={`text-sm mt-2 ${
              status.ok ? "text-green-600" : "text-red-600"
            }`}
          >
            {status.text}
          </p>
        )}

        <p className="text-[11px] text-gray-500">
          Emails are sent through Resend using your verified domain and sender profile.
        </p>
      </div>
    </div>
  );
}
