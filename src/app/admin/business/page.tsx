"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Building2, ArrowUpRight } from "lucide-react";

export default function AdminBusinessPage() {
  const supabase = createClient();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    const { data } = await supabase
      .from("businesses")
      .select(`
        id,
        business_name,
        category,
        luxury_tier,
        status,
        onboarding_completed,
        created_at
      `)
      .order("created_at", { ascending: false });

    setBusinesses(data || []);
    setLoading(false);
  }

  return (
    <div style={page}>
      <h1 style={title}>Business Users</h1>
      <p style={subtitle}>
        Venues, planners, and partners on the platform.
      </p>

      {loading ? (
        <p style={empty}>Loading businesses…</p>
      ) : businesses.length === 0 ? (
        <p style={empty}>No businesses found.</p>
      ) : (
        <div style={card}>
          {businesses.map((b) => (
            <div key={b.id} style={row}>
              <div style={avatar}>
                <Building2 size={14} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={name}>{b.business_name}</div>
                <div style={meta}>
                  {b.category} · {b.luxury_tier} · {b.status}
                </div>
              </div>

              <Link
                href={`/admin/business/${b.id}`}
                style={view}
              >
                View <ArrowUpRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const page = { padding: "70px 100px", fontFamily: "'Nunito Sans', sans-serif" };
const title = { fontFamily: "'Gilda Display', serif", fontSize: 32 };
const subtitle = { color: "#666", marginBottom: 30 };
const empty = { color: "#999" };
const card = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16 };
const row = { display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderBottom: "1px solid #EEE" };
const avatar = { width: 36, height: 36, borderRadius: 8, background: "#F4F4F4", display: "flex", alignItems: "center", justifyContent: "center" };
const name = { fontWeight: 600, color: "#183F34" };
const meta = { fontSize: 12, color: "#777" };
const view = { fontSize: 13, color: "#183F34", textDecoration: "none", fontWeight: 600 };
