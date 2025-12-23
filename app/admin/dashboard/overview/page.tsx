"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  Users,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Clock,
  UserCheck,
} from "lucide-react";

/* === COUNT UP HOOK === */
function useAnimatedNumber(value: number, duration = 600) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.floor(start + (end - start) * eased);
      setDisplayValue(nextValue);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [value]);

  return displayValue;
}

/* === MAIN COMPONENT === */
export default function AdminOverview() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    human: 0,
    conversion: 82,
  });

  const palette = {
    gold: "#C5A059",
    green: "#183F34",
    cream: "#FAF7F6",
    shadow: "0 4px 12px rgba(197,160,89,0.1)",
  };

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark";

  const bgCard = isDark ? "rgba(26,28,27,0.85)" : "rgba(255,255,255,0.9)";
  const textColor = isDark ? "#E0E7E5" : "#183F34";

  const animatedTotal = useAnimatedNumber(stats.total);
  const animatedActive = useAnimatedNumber(stats.active);
  const animatedHuman = useAnimatedNumber(stats.human);

  useEffect(() => {
    loadData();
    subscribeToRealtime();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendor_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setLeads(data);
      refreshStats(data);
    }
    setLoading(false);
  }

  function subscribeToRealtime() {
    const channel = supabase
      .channel("realtime:vendor_leads")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vendor_leads" },
        (payload) => {
          setLeads((prev) => {
            let updated = [...prev];
            const idx = updated.findIndex((l) => l.id === payload.new?.id);

            if (payload.eventType === "INSERT") {
              if (!updated.some((l) => l.id === payload.new.id)) {
                updated = [payload.new, ...updated];
              }
            }

            if (payload.eventType === "UPDATE" && idx !== -1) {
              updated[idx] = { ...updated[idx], ...payload.new };
            }

            if (payload.eventType === "DELETE" && idx !== -1) {
              updated.splice(idx, 1);
            }

            refreshStats(updated);
            return updated;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  function refreshStats(list: any[]) {
    const total = list.length;
    const active = list.filter((l) => l.status === "Active").length;
    const human = list.filter((l) => l.is_human_takeover).length;
    setStats({ total, active, human, conversion: 82 });
  }

  const humanLeads = leads
    .filter((l) => l.is_human_takeover)
    .slice(0, 5);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "60px 80px",
        backgroundColor: isDark ? "#0A0C0B" : "#FAF7F6",
        fontFamily: "'Nunito Sans', sans-serif",
        color: textColor,
      }}
    >
      {/* HEADER */}
      <header style={{ marginBottom: "50px" }}>
        <h1
          style={{
            fontFamily: "'Gilda Display', serif",
            fontSize: "32px",
            color: textColor,
          }}
        >
          Concierge Intelligence Dashboard
        </h1>
        <p style={{ color: "#777", fontSize: "15px", maxWidth: 600 }}>
          Real-time intelligence for Aura AI and Human Takeover operations.
        </p>
      </header>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "60px",
        }}
      >
        <MetricCard
          icon={<Users size={20} color={palette.green} />}
          label="Total Leads"
          value={animatedTotal}
          color={palette.gold}
        />
        <MetricCard
          icon={<MessageSquare size={20} color={palette.green} />}
          label="Active Chats"
          value={animatedActive}
          color={palette.gold}
        />
        <MetricCard
          icon={<ShieldCheck size={20} color={palette.green} />}
          label="Human Takeovers"
          value={animatedHuman}
          color={palette.gold}
        />
        <MetricCard
          icon={<Sparkles size={20} color={palette.green} />}
          label="Conversion Rate"
          value={`${stats.conversion}%`}
          color={palette.gold}
        />
      </div>

      {/* LIVE LEADS TABLE */}
      <section
        style={{
          backgroundColor: bgCard,
          border: `1px solid ${palette.gold}`,
          borderRadius: "14px",
          boxShadow: palette.shadow,
          padding: "24px",
          marginBottom: "60px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Gilda Display', serif",
            fontSize: "22px",
            marginBottom: "20px",
          }}
        >
          Live Leads
        </h2>

        {loading ? (
          <div style={centerLoader}>
            <Loader2 className="animate-spin" color={palette.gold} />
          </div>
        ) : leads.length === 0 ? (
          <p style={{ color: "#777" }}>No leads available.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {leads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} palette={palette} />
            ))}
          </div>
        )}
      </section>

      {/* HUMAN TAKEOVER SUMMARY */}
      <section
        style={{
          backgroundColor: bgCard,
          border: `1px solid ${palette.gold}`,
          borderRadius: "14px",
          boxShadow: palette.shadow,
          padding: "24px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Gilda Display', serif",
            fontSize: "22px",
            marginBottom: "20px",
          }}
        >
          Human Takeovers
        </h2>

        {humanLeads.length === 0 ? (
          <p style={{ color: "#777" }}>No active human takeovers right now.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {humanLeads.map((lead) => (
              <div
                key={lead.id}
                style={{
                  backgroundColor: "rgba(197,160,89,0.1)",
                  border: `1px solid ${palette.gold}`,
                  borderRadius: "10px",
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, color: textColor }}>
                    <UserCheck
                      size={16}
                      color={palette.gold}
                      style={{ marginRight: 6 }}
                    />
                    {lead.client_name || "Unnamed"}
                  </h4>
                  <p style={{ fontSize: "12px", color: "#777" }}>
                    {lead.location || "Unknown"} •{" "}
                    <Clock size={12} style={{ marginRight: 4 }} />{" "}
                    {new Date(lead.updated_at).toLocaleTimeString("en-GB")}
                  </p>
                </div>
                <Link
                  href={`/admin/dashboard/vendor-leads/${lead.id}`}
                  style={{
                    backgroundColor: palette.green,
                    color: "#fff",
                    textDecoration: "none",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Rejoin Chat
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* === SUB COMPONENTS === */
const centerLoader = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "180px",
};

function MetricCard({ icon, label, value, color }: any) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(255,255,255,0.9)",
        border: `1px solid ${color}`,
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 10px rgba(197,160,89,0.08)",
        backdropFilter: "blur(10px)",
        justifyContent: "space-between",
        transition: "transform 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {icon}
        <p style={{ fontSize: "13px", color: "#777" }}>{label}</p>
      </div>
      <h3
        style={{
          fontSize: "30px",
          color: "#183F34",
          marginTop: "10px",
          transition: "color 0.3s ease",
        }}
      >
        {value}
      </h3>
    </div>
  );
}

function LeadRow({ lead, palette }: any) {
  return (
    <div
      style={{
        backgroundColor: lead.is_human_takeover
          ? "rgba(197,160,89,0.1)"
          : "rgba(255,255,255,0.8)",
        border: `1px solid ${
          lead.is_human_takeover ? palette.gold : "rgba(0,0,0,0.05)"
        }`,
        borderRadius: "10px",
        padding: "16px 20px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 120px 140px",
        alignItems: "center",
        fontSize: "14px",
      }}
    >
      <div>
        <strong>{lead.client_name || "Unnamed"}</strong>
        <p style={{ color: "#777", fontSize: "12px" }}>
          {lead.location || "Unknown"}
        </p>
      </div>
      <div>{lead.status || "New"}</div>
      <div style={{ color: palette.gold, fontWeight: 600 }}>
        {lead.is_human_takeover ? "Human Mode" : "AI Mode"}
      </div>
      <Link
        href={`/admin/dashboard/vendor-leads/${lead.id}`}
        style={{
          backgroundColor: palette.green,
          color: "#fff",
          textDecoration: "none",
          padding: "8px 14px",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        Join Chat <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
