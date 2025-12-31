"use client";

import React, { useState } from "react";

export default function AdminEmailPage() {
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | string>(null);

  async function sendEmail() {
    setStatus(null);

    if (!recipients.trim()) {
      setStatus("No recipients provided");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        body: JSON.stringify({
          subject,
          message,
          recipients: recipients
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean),
        }),
      });

      const json = await res.json();

      if (json.ok) {
        setStatus("Email sent successfully");
        setRecipients("");
        setSubject("");
        setMessage("");
      } else {
        setStatus(json.error || "Failed to send email");
      }
    } catch (err) {
      console.error(err);
      setStatus("Server error while sending email");
    }

    setLoading(false);
  }

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-[#183F34]">
        Email Marketing
      </h1>

      {/* RECIPIENT INPUT */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Recipients (comma separated)
      </label>
      <input
        className="w-full border border-gray-300 rounded-md p-3 mb-6"
        value={recipients}
        onChange={(e) => setRecipients(e.target.value)}
        placeholder="example1@mail.com, example2@mail.com"
      />

      {/* SUBJECT */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Subject
      </label>
      <input
        className="w-full border border-gray-300 rounded-md p-3 mb-6"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Your email subject..."
      />

      {/* MESSAGE BODY */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Message
      </label>
      <textarea
        className="w-full border border-gray-300 rounded-md p-3 h-40 mb-6"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your email message here..."
      />

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
        <p className="mt-4 text-sm text-[#183F34] font-medium">{status}</p>
      )}
    </div>
  );
}
