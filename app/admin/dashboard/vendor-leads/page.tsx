"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Filter, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

export default function VendorLeadsPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const palette = {
    bg: "transparent",
    text: "#183F34",
    subtle: "#666",
    green: "#183F34",
    shadow: "0 8px 20px rgba(24, 63, 52, 0.06)",
    cardBg: "rgba(255,255,255,0.9)",
    darkCardBg: "rgba(26,28,27,0.75)",
    darkText: "#E0E7E5",
    border: "rgba(0,0,0,0.08)",
  };

  /**
   * 1. Hydration-Safe Theme Detection
   * Prevents mismatch errors between server and client during build.
   */
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme === "dark");
    };
    checkTheme();
    loadLeads();
  }, []);

  const current = {
    text: isDark ? palette.darkText : palette.text,
    cardBg: isDark ? palette.darkCardBg : palette.cardBg,
  };

  async function loadLeads() {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendor_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setLeads(data || []);
    setLoading(false);
  }

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function deleteSelected() {
    if (!selected.length) return;
    if (!confirm("Delete selected leads?")) return;

    setSaving(true);
    await supabase.from("vendor_leads").delete().in("id", selected);
    await loadLeads();
    setSelected([]);
    setSaving(false);
  }

  async function updateLeadStatus(id: string, status: string) {
    setSaving(true);
    await supabase.from("vendor_leads").update({ status }).eq("id", id);
    await loadLeads();
    setSaving(false);
  }

  return (
    <div
      style={{
        padding: "60px 80px",
        fontFamily: "'Nunito Sans', sans-serif",
        color: current.text,
      }}
    >
      <h1
        style={{
          fontFamily: "'Gilda Display', serif",
          fontSize: "32px",
          marginBottom: "10px",
        }}
      >
        Vendor Leads
      </h1>
      <p style={{ fontSize: "15px", color: palette.subtle, marginBottom: "30px" }}>
        A live view of all conversations and leads flagged by your concierge AI.
      </p>

      {/* ACTION BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={deleteSelected}
            disabled={!selected.length || saving}
            style={{
              backgroundColor: selected.length ? palette.green : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: selected.length ? "pointer" : "not-allowed",
              transition: "background 0.2s ease",
            }}
          >
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
            Delete ({selected.length})
          </button>
        </div>

        <button
          style={{
            border: `1px solid ${palette.green}`,
            backgroundColor: "transparent",
            color: palette.green,
            borderRadius: "8px",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
          }}
        >
          <Filter size={14} />
          Filter
        </button>
      </div>

      {/* LEAD LIST */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "80px" }}>
          <Loader2 className="animate-spin" color={palette.green} size={28} />
        </div>
      ) : leads.length === 0 ? (
        <p style={{ textAlign: "center", color: palette.subtle }}>No leads available.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {leads.map((lead) => (
            <div
              key={lead.id}
              style={{
                backgroundColor: current.cardBg,
                border: `1px solid ${palette.border}`,
                borderRadius: "14px",
                boxShadow: palette.shadow,
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "transform 0.2s ease",
              }}
            >
              {/* Lead Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="checkbox"
                  checked={selected.includes(lead.id)}
                  onChange={() => toggleSelect(lead.id)}
                  style={{ cursor: "pointer" }}
                />
                <div>
                  <Link
                    href={`/admin/dashboard/vendor-leads/${lead.id}`}
                    style={{
                      fontFamily: "'Gilda Display', serif",
                      fontSize: "18px",
                      marginBottom: "4px",
                      color: palette.green,
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    {lead.name || lead.client_name || "Unnamed lead"}
                  </Link>
                  <p
                    style={{
                      color: palette.subtle,
                      fontSize: "14px",
                      marginBottom: "6px",
                      maxWidth: "600px",
                    }}
                  >
                    {lead.summary || lead.ai_summary || "No summary text stored yet."}
                  </p>
                  <div style={{ fontSize: "13px", color: palette.subtle }}>
                    {lead.type || "Lead"} | Score:{" "}
                    {lead.score || lead.match_score ? (lead.score || lead.match_score) + "%" : "Unscored"} |{" "}
                    {lead.budget || "Budget not specified"} |{" "}
                    {new Date(lead.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <Link
                    href={`/admin/dashboard/vendor-leads/${lead.id}`}
                    style={{
                      marginTop: "8px",
                      display: "inline-block",
                      color: palette.green,
                      fontWeight: 600,
                      fontSize: "13px",
                      textDecoration: "underline",
                    }}
                  >
                    Read More →
                  </Link>
                </div>
              </div>

              {/* STATUS */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <select
                  value={lead.status || lead.lead_status || "new"}
                  onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                  style={{
                    border: `1px solid ${palette.green}`,
                    borderRadius: "8px",
                    padding: "6px 8px",
                    fontSize: "13px",
                    color: palette.text,
                    backgroundColor: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="proposal">Proposal</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>

                {/* THE FIX: Remove 'title' from Icon and wrap in div */}
                <div title="Neural Sync Secure">
                  <CheckCircle2
                    size={18}
                    color={palette.green}
                    style={{ opacity: 0.8 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}