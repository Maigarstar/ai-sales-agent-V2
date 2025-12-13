"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MessageSnippet = {
  role: string;
  content: string;
};

type FeedRow = {
  id: string;
  created_at: string;
  messages: MessageSnippet[];
  metadata: {
    score?: number | null;
    lead_type?: string | null;
    business_category?: string | null;
    location?: string | null;
  } | null;
  last_user_message: string | null;
  last_assistant_message: string | null;
  score: number | null;
  lead_type: string | null;
  business_category: string | null;
  location: string | null;
  lead_status: string | null;
  chat_type?: "vendor" | "couple" | null;
};

export default function LiveVendorChatFeedPage() {
  const router = useRouter();

  const [rows, setRows] = useState<FeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All statuses");
  const [creatingFor, setCreatingFor] = useState<string | null>(null);

  async function loadFeed() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        "/api/admin/vendor-chat-feed?chatType=vendor",
        { cache: "no-store" }
      );

      if (!res.ok) {
        setError("Feed endpoint returned an error status");
        return;
      }

      const json = await res.json();

      if (!json.ok || !Array.isArray(json.messages)) {
        setError("Feed JSON structure is not as expected");
        return;
      }

      setRows(json.messages);
    } catch (err) {
      console.error("live vendor feed load error", err);
      setError("Could not load vendor chat feed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, []);

  async function handleCreateCard(conversationId: string) {
    if (!conversationId || creatingFor) return;

    setCreatingFor(conversationId);

    try {
      const res = await fetch("/api/admin/vendor-leads/from-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId }),
      });

      const json = await res.json();
      console.log("from-chat response", json);

      if (!res.ok || !json.ok) {
        alert(json.error || "Could not create lead card from this chat");
        return;
      }

      const leadId: string | undefined = json.lead_id;

      // Refresh feed so status and totals are up to date
      loadFeed();

      if (leadId) {
        // Go straight to the lead detail page
        router.push(`/admin/leads/${leadId}`);
      } else if (json.already_linked && json.lead_id) {
        router.push(`/admin/leads/${json.lead_id}`);
      }
    } catch (err) {
      console.error("create card error", err);
      alert("There was an error creating the lead card");
    } finally {
      setCreatingFor(null);
    }
  }

  // Simple stats
  const totalChats = rows.length;
  const hotCount = rows.filter((r) => r.lead_type === "Hot").length;
  const warmCount = rows.filter((r) => r.lead_type === "Warm").length;
  const bookedCount = rows.filter((r) => r.lead_status === "Booked").length;
  const scored = rows.filter((r) => typeof r.score === "number");
  const avgScore =
    scored.length > 0
      ? Math.round(
          (scored.reduce((sum, r) => sum + (r.score || 0), 0) /
            scored.length) *
            10
        ) / 10
      : null;

  const filteredRows =
    statusFilter === "All statuses"
      ? rows
      : rows.filter((r) => (r.lead_status || "New") === statusFilter);

  return (
    <div className="px-8 py-6">
      {/* Top bar */}
      <button
        type="button"
        onClick={() => router.push("/admin/leads")}
        className="mb-4 text-sm text-[#183F34] hover:underline"
      >
        ← Back to leads
      </button>

      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-normal text-[#183F34]">
            Live Vendor Chat Feed
          </h1>
          <p className="mt-1 text-sm text-[#6B7065]">
            A live view of the conversations your concierge is holding with
            vendors, updated every few seconds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-[#6B7065]">
            Filter by status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ml-2 rounded-full border border-[#D6D1C7] bg-white px-3 py-1 text-xs text-[#183F34]"
            >
              <option>All statuses</option>
              <option>New</option>
              <option>Hot</option>
              <option>Warm</option>
              <option>Booked</option>
            </select>
          </label>
        </div>
      </header>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-5 gap-4">
        <div className="rounded-xl border border-[#EAE7E2] bg-white px-4 py-3">
          <div className="text-xs text-[#6B7065]">Total chats</div>
          <div className="mt-1 text-xl font-semibold text-[#183F34]">
            {totalChats}
          </div>
        </div>
        <div className="rounded-xl border border-[#FBE4E4] bg-[#FFF6F6] px-4 py-3">
          <div className="text-xs text-[#8B3A3A]">Hot</div>
          <div className="mt-1 text-xl font-semibold text-[#8B3A3A]">
            {hotCount}
          </div>
        </div>
        <div className="rounded-xl border border-[#FFF0D6] bg-[#FFF9EE] px-4 py-3">
          <div className="text-xs text-[#8A5A14]">Warm</div>
          <div className="mt-1 text-xl font-semibold text-[#8A5A14]">
            {warmCount}
          </div>
        </div>
        <div className="rounded-xl border border-[#D6F1DD] bg-[#F3FBF6] px-4 py-3">
          <div className="text-xs text-[#1F6B3A]">Booked</div>
          <div className="mt-1 text-xl font-semibold text-[#1F6B3A]">
            {bookedCount}
          </div>
        </div>
        <div className="rounded-xl border border-[#EAE7E2] bg-white px-4 py-3">
          <div className="text-xs text-[#6B7065]">Average score</div>
          <div className="mt-1 text-xl font-semibold text-[#183F34]">
            {avgScore != null ? avgScore : "–"}
          </div>
        </div>
      </div>

      {/* List */}
      {loading && (
        <p className="text-sm text-[#6B7065]">Loading vendor chats, please wait.</p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && filteredRows.length === 0 && (
        <p className="text-sm text-[#6B7065]">
          No vendor conversations found for this filter.
        </p>
      )}

      {!loading && !error && filteredRows.length > 0 && (
        <div className="space-y-4">
          {filteredRows.map((row) => {
            const firstUser = row.messages.find((m) => m.role === "user");
            const conciergeReply =
              row.messages.find((m) => m.role === "assistant") || null;

            const statusLabel = row.lead_status || "New";
            const scoreLabel =
              row.score != null
                ? `Score ${row.score}`
                : "Unscored";

            return (
              <div
                key={row.id}
                className="rounded-xl border border-[#EAE7E2] bg-white px-5 py-4"
              >
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium text-[#9A9F93]">
                      {scoreLabel}
                    </div>
                    <div className="text-xs text-[#6B7065]">
                      {row.location ? `${row.location} · ` : ""}
                      {row.lead_type || "New"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#F3F2ED] px-3 py-1 text-xs text-[#6B7065]">
                      {statusLabel}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCreateCard(row.id)}
                      disabled={creatingFor === row.id}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium text-white ${
                        creatingFor === row.id
                          ? "bg-[#9AA29A]"
                          : "bg-[#183F34] hover:bg-[#0f2a23]"
                      }`}
                    >
                      {creatingFor === row.id ? "Creating…" : "Create card"}
                    </button>
                  </div>

                  <div className="text-xs text-[#9A9F93]">
                    {new Date(row.created_at).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="mt-2 space-y-1 text-sm text-[#183F34]">
                  <p className="font-semibold">
                    {firstUser
                      ? firstUser.content
                      : row.last_user_message || "No user message found"}
                  </p>
                  {conciergeReply && (
                    <p className="text-[#6B7065]">
                      <span className="font-semibold">Concierge: </span>
                      {conciergeReply.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
