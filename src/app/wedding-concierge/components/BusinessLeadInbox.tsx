"use client";

import React from "react";

export default function BusinessLeadInbox({
  isLightMode,
}: {
  isLightMode?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 border text-center ${
        isLightMode
          ? "bg-white border-black/10 text-black"
          : "bg-[#121413] border-white/10 text-white"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.25em] opacity-50 mb-3">
        Lead Inbox
      </p>

      <div className="text-[12px] opacity-60 leading-relaxed">
        No active leads yet.
        <br />
        Conversations will appear here once enquiries begin.
      </div>
    </div>
  );
}
