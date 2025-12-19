"use client";

import React from "react";
import { AdminNav } from "./AdminNav";

type Stat = { title: string; value: string; delta: string };
type Activity = { name: string; note: string; when: string };

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <section
      style={{
        borderRadius: 20,
        backgroundColor: "#ffffff",
        boxShadow: "0 14px 36px rgba(0,0,0,0.06)",
        border: "1px solid rgba(24,63,52,0.06)",
        padding: 20,
      }}
    >
      {children}
    </section>
  );
}

function PillLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        padding: "8px 16px",
        borderRadius: 999,
        backgroundColor: "#183F34",
        color: "#ffffff",
        fontSize: 13,
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}

function ConciergeCard({
  title,
  body,
  button,
  href,
}: {
  title: string;
  body: string;
  button: string;
  href: string;
}) {
  return (
    <CardShell>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: 170,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontFamily: '"Playfair Display","Gilda Display",serif',
              fontWeight: 400,
              color: "#111",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              marginTop: 8,
              marginBottom: 16,
              fontSize: 14,
              color: "#555",
            }}
          >
            {body}
          </p>
        </div>
        <div>
          <PillLink href={href}>{button}</PillLink>
        </div>
      </div>
    </CardShell>
  );
}

function StatCard({ title, value, delta }: Stat) {
  return (
    <CardShell>
      <div style={{ fontSize: 13, color: "#666" }}>{title}</div>
      <div
        style={{
          marginTop: 10,
          fontSize: 34,
          fontWeight: 700,
          color: "#111",
          letterSpacing: -0.4,
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "#1f7a4d" }}>
        {delta}
      </div>
    </CardShell>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        borderRadius: 20,
        backgroundColor: "#ffffff",
        boxShadow: "0 14px 36px rgba(0,0,0,0.06)",
        border: "1px solid rgba(24,63,52,0.06)",
        padding: 24,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 20,
          fontFamily: '"Playfair Display","Gilda Display",serif',
          fontWeight: 400,
          color: "#111",
        }}
      >
        {title}
      </h3>
      {subtitle ? (
        <p style={{ margin: "10px 0 0 0", fontSize: 14, color: "#666" }}>
          {subtitle}
        </p>
      ) : null}
      <div style={{ marginTop: 18 }}>{children}</div>
    </section>
  );
}

export default function AdminPage() {
  const stats: Stat[] = [
    { title: "New Leads Today", value: "12", delta: "+18 percent" },
    { title: "Hot Leads", value: "4", delta: "+33 percent" },
    { title: "Vendors Joined", value: "3", delta: "Stable" },
    { title: "AI Agent Accuracy", value: "92 percent", delta: "+3 percent" },
  ];

  const activity: Activity[] = [
    {
      name: "Bella Weddings Italy",
      note: "Submitted application",
      when: "2h ago",
    },
    { name: "Cygnus Events", note: "Updated profile", when: "6h ago" },
    { name: "MR Music Italy", note: "New inquiry", when: "1d ago" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f4ef",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: 32,
          fontFamily:
            '"Nunito Sans",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        }}
      >
        <AdminNav />

        <div style={{ marginTop: 18 }}>
          <h1
            style={{
              fontFamily: '"Gilda Display","Playfair Display",serif',
              fontSize: 30,
              fontWeight: 400,
              letterSpacing: -0.4,
              color: "#183F34",
              margin: 0,
            }}
          >
            Concierge workspace
          </h1>
          <p
            style={{
              margin: "6px 0 0 0",
              fontSize: 14,
              color: "#555",
              maxWidth: 720,
            }}
          >
            Choose how you want to work with your AI concierge, you can review
            vendor leads, read full conversations, or step into live chat when a
            human reply is needed.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(260px, 1fr))",
            gap: 20,
            marginTop: 16,
          }}
        >
          <ConciergeCard
            title="Vendor leads"
            body="See the vendors your concierge has flagged as promising, update their status, and keep light notes as they move closer to joining 5 Star Weddings."
            button="Open vendor leads"
            href="/admin/leads"
          />

          <ConciergeCard
            title="Concierge conversations"
            body="Read full AI chats with couples and vendors, understand their story, then create a vendor lead card directly from any conversation."
            button="View conversations"
            href="/admin/conversations"
          />

          <ConciergeCard
            title="Live chat takeover"
            body="Watch live conversations in real time, then step in as a human if a couple or venue needs personal guidance or a more nuanced answer."
            button="Open live chat"
            href="/admin/live-chat"
          />
        </div>

        <div style={{ marginTop: 28 }}>
          <h2
            style={{
              fontFamily: '"Gilda Display","Playfair Display",serif',
              fontSize: 34,
              fontWeight: 400,
              letterSpacing: -0.4,
              color: "#111",
              margin: 0,
            }}
          >
            Dashboard
          </h2>
          <p
            style={{
              margin: "8px 0 0 0",
              fontSize: 14,
              color: "#666",
              maxWidth: 720,
            }}
          >
            Your AI sales pipeline, vendor activity and performance insights.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(230px, 1fr))",
            gap: 20,
            marginTop: 20,
          }}
        >
          {stats.map((s) => (
            <StatCard key={s.title} title={s.title} value={s.value} delta={s.delta} />
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 20,
            marginTop: 22,
          }}
        >
          <Panel
            title="Lead Quality Overview"
            subtitle="Snapshot of AI graded leads over the past seven days."
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              <div
                style={{
                  borderRadius: 18,
                  backgroundColor: "#fbf8f3",
                  padding: 22,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    margin: "0 auto",
                    backgroundColor: "#2fbf71",
                  }}
                />
                <div style={{ marginTop: 12, color: "#666" }}>Hot</div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#111",
                  }}
                >
                  9
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  backgroundColor: "#fbf8f3",
                  padding: 22,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    margin: "0 auto",
                    backgroundColor: "#f0a034",
                  }}
                />
                <div style={{ marginTop: 12, color: "#666" }}>Warm</div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#111",
                  }}
                >
                  17
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  backgroundColor: "#fbf8f3",
                  padding: 22,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    margin: "0 auto",
                    backgroundColor: "#9aa3ad",
                  }}
                />
                <div style={{ marginTop: 12, color: "#666" }}>Cold</div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#111",
                  }}
                >
                  5
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Recent Vendor Activity">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {activity.map((a) => (
                <div
                  key={a.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#111" }}>{a.name}</div>
                    <div style={{ marginTop: 4, color: "#666", fontSize: 13 }}>
                      {a.note}
                    </div>
                  </div>
                  <div
                    style={{
                      color: "#999",
                      fontSize: 13,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.when}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div
          style={{
            marginTop: 32,
            paddingTop: 12,
            borderTop: "1px solid #eee2cf",
            fontSize: 12,
            color: "#777",
            textAlign: "right",
          }}
        >
          Powered by{" "}
          <a
            href="https://taigenic.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#183F34", textDecoration: "none", fontWeight: 500 }}
          >
            Taigenic AI
          </a>
        </div>
      </div>
    </div>
  );
}
