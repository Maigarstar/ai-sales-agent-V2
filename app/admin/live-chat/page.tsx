"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { AdminNav } from "../AdminNav";

type ConversationRow = {
  id: string;
  user_type: string | null;
  status: string | null;
  first_message: string | null;
  last_message: string | null;
  created_at: string;
  updated_at: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })
    : null;

function formatCreated(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeLabel(row: ConversationRow): string {
  if (row.user_type === "vendor") return "Vendor";
  if (row.user_type === "planning") return "Wedding planner or couple";
  return "Unknown";
}

function getStatusLabel(status: string | null | undefined): string {
  const raw = (status || "").toLowerCase();
  if (raw === "in_progress") return "In progress";
  if (raw === "done") return "Done";
  if (raw === "open" || raw === "new" || raw === "") return "New";
  return status || "New";
}

function getStatusColour(status: string | null | undefined): {
  bg: string;
  color: string;
} {
  const raw = (status || "").toLowerCase();
  if (raw === "in_progress") return { bg: "#e4f4ea", color: "#1d6b3b" };
  if (raw === "done") return { bg: "#f1f1f1", color: "#777" };
  return { bg: "#fff3e6", color: "#cc692b" };
}

function getSummary(row: ConversationRow): string {
  const src = row.first_message || row.last_message || "";
  if (!src) return "No user message found yet.";
  if (src.length <= 140) return src;
  return `${src.slice(0, 137)}...`;
}

function getContactSnippet(row: ConversationRow): string {
  const bits: string[] = [];
  if (row.contact_name) bits.push(row.contact_name);
  if (row.contact_email) bits.push(row.contact_email);
  if (row.contact_phone) bits.push(row.contact_phone);
  return bits.join(" · ");
}

export default function LiveChatQueuePage() {
  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const sb = supabase;

    if (!sb) {
      setErrorMessage(
        "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }

    const sb = supabase; // this is now guaranteed, and TS is happy

    let cancelled = false;

    async function loadQueue() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await sb
        .from("conversations")
        .select("*")
        .or("status.is.null,status.eq.new,status.eq.open,status.eq.in_progress")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (cancelled) return;

      if (error) {
        console.error("live chat queue error", error);
        setErrorMessage(
          `Could not load live chat queue: ${
            (error as any)?.message ?? "Unknown error"
          }`
        );
      } else if (data) {
        setRows(data as ConversationRow[]);
      }

      setLoading(false);
    }

    void loadQueue();

    const channel = sb
      .channel("live-chat-queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        (payload) => {
          setRows((current) => {
            const newRow = payload.new as ConversationRow | null;
            const oldRow = payload.old as ConversationRow | null;

            function isActive(row: ConversationRow | null): boolean {
              if (!row) return false;
              const raw = (row.status || "").toLowerCase();
              return (
                raw === "" ||
                raw === "new" ||
                raw === "open" ||
                raw === "in_progress" ||
                row.status === null
              );
            }

            if (payload.eventType === "INSERT" && newRow) {
              if (!isActive(newRow)) return current;
              const exists = current.some((r) => r.id === newRow.id);
              const merged = exists
                ? current.map((r) => (r.id === newRow.id ? newRow : r))
                : [newRow, ...current];
              return merged.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
            }

            if (payload.eventType === "UPDATE" && newRow) {
              const stillActive = isActive(newRow);
              let next = current;

              if (stillActive) {
                const exists = current.some((r) => r.id === newRow.id);
                next = exists
                  ? current.map((r) => (r.id === newRow.id ? newRow : r))
                  : [newRow, ...current];
              } else {
                next = current.filter((r) => r.id !== newRow.id);
              }

              return next.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
            }

            if (payload.eventType === "DELETE" && oldRow) {
              return current.filter((r) => r.id !== oldRow.id);
            }

            return current;
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      sb.removeChannel(channel);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f4ef",
        padding: 24,
      }}
    >
      <AdminNav />

      <div
        style={{
          maxWidth: 1120,
          margin: "24px auto 0 auto",
        }}
      >
        <h1
          style={{
            fontFamily: '"Playfair Display","Gilda Display",serif',
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: -0.6,
            margin: 0,
            color: "#111",
          }}
        >
          Live chat queue
        </h1>

        <p
          style={{
            margin: "8px 0 24px 0",
            fontSize: 14,
            color: "#666",
          }}
        >
          Chats where users have requested a person or where an admin is already
          active. Click through to open the full conversation and reply.
        </p>

        {errorMessage && (
          <div
            style={{
              marginBottom: 12,
              fontSize: 13,
              color: "#aa1111",
            }}
          >
            {errorMessage}
          </div>
        )}

        <div
          style={{
            borderRadius: 22,
            backgroundColor: "#ffffff",
            boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
            border: "1px solid rgba(24,63,52,0.05)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "160px 150px minmax(0, 1fr) 140px",
              padding: "12px 24px",
              fontSize: 12,
              color: "#8a8172",
              borderBottom: "1px solid #f0ebe1",
            }}
          >
            <div>Created</div>
            <div>Type</div>
            <div>Summary</div>
            <div style={{ textAlign: "right" }}>Status</div>
          </div>

          {loading && rows.length === 0 && (
            <div style={{ padding: 20, fontSize: 13, color: "#666" }}>
              Loading live chats.
            </div>
          )}

          {!loading && rows.length === 0 && (
            <div style={{ padding: 20, fontSize: 13, color: "#666" }}>
              There are no active live chats at the moment.
            </div>
          )}

          {rows.map((row) => {
            const statusInfo = getStatusColour(row.status);
            const contactSnippet = getContactSnippet(row);

            return (
              <div
                key={row.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 150px minmax(0, 1fr) 140px",
                  padding: "14px 24px",
                  fontSize: 14,
                  borderTop: "1px solid #f4efe5",
                  alignItems: "center",
                }}
              >
                <div style={{ color: "#555" }}>{formatCreated(row.created_at)}</div>
                <div style={{ color: "#333" }}>{getTypeLabel(row)}</div>

                <div>
                  <div style={{ color: "#222" }}>{getSummary(row)}</div>
                  {contactSnippet && (
                    <div style={{ marginTop: 4, fontSize: 12, color: "#777" }}>
                      Contact: {contactSnippet}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      backgroundColor: statusInfo.bg,
                      color: statusInfo.color,
                    }}
                  >
                    {getStatusLabel(row.status)}
                  </span>

                  <Link
                    href={`/admin/conversations/${row.id}`}
                    style={{ fontSize: 12, color: "#183F34", textDecoration: "none" }}
                  >
                    Open conversation
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 12, fontSize: 11, color: "#999", textAlign: "right" }}>
          Powered by Taigenic AI
        </div>
      </div>
    </div>
  );
}
