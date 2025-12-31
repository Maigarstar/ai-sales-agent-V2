"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "src/lib/supabase/client";
import {
  Loader2,
  Users,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Bot,
  Globe,
  Calendar,
  Clock,
  ArrowUpRight,
} from "lucide-react";

/**
 * TAIGENIC / 5 STAR WEDDINGS ADMIN DASHBOARD
 * Live stats for AI conversations, vendor leads, human takeovers, and global activity.
 */
export default function AdminDashboard() {
  const supabase = createClient();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeChats: 0,
    humanTakeovers: 0,
    vendorsCount: 0,
    aiResponses: 0,
  });

  // watch theme changes
  useEffect(() => {
    setMounted(true);
    const updateTheme = () => {
      const current = document.documentElement.getAttribute("data-theme");
      setTheme(current === "dark" ? "dark" : "light");
    };
    updateTheme();
    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, { attributes: true });
    loadAllData();
    subscribeRealtime();
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";
  const palette = {
    bgLight: "#FDFCFB",
    bgDark: "#0B0C0D",
    textLight: "#183F34",
    textDark: "#E9ECEB",
    subtleLight: "#777",
    subtleDark: "#A5AAA9",
    green: "#183F34",
    borderLight: "rgba(0,0,0,0.08)",
    borderDark: "rgba(255,255,255,0.08)",
  };

  async function loadAllData() {
    setLoading(true);
    const [leadRes, vendorRes, msgRes] = await Promise.all([
      supabase.from("vendor_leads").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("vendors").select("id,name,status"),
      supabase.from("chat_messages").select("id,created_at,role,message").order("created_at", { ascending: false }).limit(10),
    ]);

    const leads = leadRes.data || [];
    const vendors = vendorRes.data || [];
    const messages = msgRes.data || [];

    const active = leads.filter((l) => l.status === "Active").length;
    const human = leads.filter((l) => l.is_human_takeover).length;
    const aiResponses = messages.filter((m) => m.role === "assistant").length;

    setLeads(leads);
    setVendors(vendors);
    setMessages(messages);
    setStats({
      totalLeads: leads.length,
      activeChats: active,
      humanTakeovers: human,
      vendorsCount: vendors.length,
      aiResponses,
    });
    setLoading(false);
  }

  function subscribeRealtime() {
    const leadChannel = supabase
      .channel("realtime:vendor_leads")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendor_leads" }, loadAllData)
      .subscribe();
    return () => supabase.removeChannel(leadChannel);
  }

  const bg = isDark ? palette.bgDark : palette.bgLight;
  const text = isDark ? palette.textDark : palette.textLight;
  const subtle = isDark ? palette.subtleDark : palette.subtleLight;
  const border = isDark ? palette.borderDark : palette.borderLight;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: bg,
        color: text,
        transition: "all 0.4s ease",
        fontFamily: "'Nunito Sans', sans-serif",
        padding: "60px 80px",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          borderBottom: `1px solid ${border}`,
          marginBottom: "50px",
          paddingBottom: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "'Gilda Display', serif", fontSize: "32px", marginBottom: 8 }}>
            Concierge Intelligence Dashboard
          </h1>
          <p style={{ color: subtle, fontSize: "15px" }}>
            Real-time insight across AI chats, vendor activity, and lead flow.
          </p>
        </div>
        <div
          style={{
            fontSize: "13px",
            color: subtle,
            border: `1px solid ${border}`,
            borderRadius: "8px",
            padding: "6px 12px",
            backdropFilter: "blur(8px)",
          }}
        >
          <Clock size={14} style={{ marginRight: 4 }} /> Updated {new Date().toLocaleTimeString("en-GB")}
        </div>
      </header>

      {/* METRICS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "50px",
        }}
      >
        <Metric label="Total Leads" value={stats.totalLeads} icon={<Users />} isDark={isDark} border={border} />
        <Metric label="Active Chats" value={stats.activeChats} icon={<MessageSquare />} isDark={isDark} border={border} />
        <Metric label="Human Takeovers" value={stats.humanTakeovers} icon={<ShieldCheck />} isDark={isDark} border={border} />
        <Metric label="AI Responses" value={stats.aiResponses} icon={<Bot />} isDark={isDark} border={border} />
        <Metric label="Vendors Listed" value={stats.vendorsCount} icon={<Globe />} isDark={isDark} border={border} />
      </div>

      {/* SECTIONS */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "40px" }}>
        {/* RECENT LEADS */}
        <Panel title="Recent Leads" isDark={isDark} border={border}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Loader2 className="animate-spin" color={palette.green} />
            </div>
          ) : leads.length === 0 ? (
            <p style={{ color: subtle }}>No leads yet.</p>
          ) : (
            leads.slice(0, 6).map((lead) => (
              <div
                key={lead.id}
                style={{
                  borderBottom: `1px solid ${border}`,
                  padding: "14px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{lead.client_name || "Unnamed"}</strong>
                  <p style={{ color: subtle, fontSize: 12 }}>
                    {lead.location || "Unknown"} • {new Date(lead.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <Link
                  href={`/admin/dashboard/vendor-leads/${lead.id}`}
                  style={{
                    backgroundColor: palette.green,
                    color: "#fff",
                    textDecoration: "none",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                >
                  View
                </Link>
              </div>
            ))
          )}
        </Panel>

        {/* RECENT AI ACTIVITY */}
        <Panel title="Latest AI Conversations" isDark={isDark} border={border}>
          {messages.length === 0 ? (
            <p style={{ color: subtle }}>No recent messages.</p>
          ) : (
            messages.slice(0, 8).map((msg) => (
              <div
                key={msg.id}
                style={{
                  borderBottom: `1px solid ${border}`,
                  padding: "12px 0",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "13px",
                      color: isDark ? "#C9CCC9" : "#333",
                      marginBottom: 4,
                    }}
                  >
                    {msg.message?.slice(0, 80) || "—"}
                  </p>
                  <span style={{ fontSize: 11, color: subtle }}>
                    {msg.role === "assistant" ? "AI Response" : "User"} •{" "}
                    {new Date(msg.created_at).toLocaleTimeString("en-GB")}
                  </span>
                </div>
              </div>
            ))
          )}
        </Panel>
      </div>

      {/* VENDORS */}
      <Panel
        title="Active Vendors"
        isDark={isDark}
        border={border}
        style={{ marginTop: "40px" }}
      >
        {vendors.length === 0 ? (
          <p style={{ color: subtle }}>No vendors registered yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: "18px",
            }}
          >
            {vendors.slice(0, 6).map((v) => (
              <div
                key={v.id}
                style={{
                  backgroundColor: isDark ? "rgba(26,28,27,0.6)" : "rgba(255,255,255,0.9)",
                  border: `1px solid ${border}`,
                  borderRadius: "12px",
                  padding: "16px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h4 style={{ marginBottom: 6 }}>{v.name}</h4>
                <p style={{ color: subtle, fontSize: "12px" }}>
                  Status: {v.status || "Active"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* SUBCOMPONENTS */
function Metric({ label, value, icon, isDark, border }: any) {
  return (
    <div
      style={{
        backgroundColor: isDark ? "rgba(28,30,31,0.6)" : "rgba(255,255,255,0.8)",
        border: `1px solid ${border}`,
        borderRadius: "12px",
        padding: "20px",
        boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.05)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {icon}
        <p style={{ fontSize: 13, opacity: 0.8 }}>{label}</p>
      </div>
      <h3 style={{ fontSize: "28px", marginTop: 10 }}>{value}</h3>
    </div>
  );
}

function Panel({ title, children, isDark, border, style = {} }: any) {
  return (
    <section
      style={{
        backgroundColor: isDark ? "rgba(25,27,28,0.55)" : "rgba(255,255,255,0.85)",
        border: `1px solid ${border}`,
        borderRadius: "14px",
        padding: "24px",
        backdropFilter: "blur(12px)",
        boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.05)",
        ...style,
      }}
    >
      <h2
        style={{
          fontFamily: "'Gilda Display', serif",
          fontSize: "20px",
          borderBottom: `1px solid ${border}`,
          paddingBottom: "8px",
          marginBottom: "14px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
