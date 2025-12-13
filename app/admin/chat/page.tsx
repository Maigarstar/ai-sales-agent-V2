"use client";

import React from "react";
import Link from "next/link";
import { AdminNav } from "../AdminNav";

export default function AdminChatHubPage() {
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
            '"Nunito Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {/* Top admin tabs */}
        <AdminNav />

        {/* Page header */}
        <div
          style={{
            marginTop: 18,
            marginBottom: 18,
          }}
        >
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
              maxWidth: 640,
            }}
          >
            Choose how you want to work with your AI concierge, you can review
            vendor leads, read full conversations, or step in to a live chat as
            a member of the team.
          </p>
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: 20,
            marginTop: 8,
          }}
        >
          {/* Vendor leads card */}
          <section
            style={{
              borderRadius: 20,
              backgroundColor: "#ffffff",
              boxShadow: "0 14px 36px rgba(0,0,0,0.06)",
              border: "1px solid rgba(24,63,52,0.06)",
              padding: 20,
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
                Vendor leads
              </h2>
              <p
                style={{
                  marginTop: 8,
                  marginBottom: 16,
                  fontSize: 14,
                  color: "#555",
                }}
              >
                See the vendors your concierge has flagged as promising, update
                their status, and keep light notes as they move closer to
                joining 5 Star Weddings.
              </p>
            </div>
            <div>
              <Link
                href="/admin/leads"
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
                Open vendor leads
              </Link>
            </div>
          </section>

          {/* Concierge conversations card */}
          <section
            style={{
              borderRadius: 20,
              backgroundColor: "#ffffff",
              boxShadow: "0 14px 36px rgba(0,0,0,0.06)",
              border: "1px solid rgba(24,63,52,0.06)",
              padding: 20,
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
                Concierge conversations
              </h2>
              <p
                style={{
                  marginTop: 8,
                  marginBottom: 16,
                  fontSize: 14,
                  color: "#555",
                }}
              >
                Read full AI chats with couples and vendors, understand their
                story, then create a vendor lead card directly from any
                conversation.
              </p>
            </div>
            <div>
              <Link
                href="/admin/conversations"
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
                View conversations
              </Link>
            </div>
          </section>

          {/* Live chat card */}
          <section
            style={{
              borderRadius: 20,
              backgroundColor: "#ffffff",
              boxShadow: "0 14px 36px rgba(0,0,0,0.06)",
              border: "1px solid rgba(24,63,52,0.06)",
              padding: 20,
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
                Live chat takeover
              </h2>
              <p
                style={{
                  marginTop: 8,
                  marginBottom: 16,
                  fontSize: 14,
                  color: "#555",
                }}
              >
                Watch live conversations in real time, then step in as a human
                if a couple or venue needs personal guidance or a more nuanced
                answer.
              </p>
            </div>
            <div>
              <Link
                href="/admin/live-chat"
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
                Open live chat
              </Link>
            </div>
          </section>
        </div>

        {/* Footer */}
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
            style={{
              color: "#183F34",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Taigenic AI
          </a>
        </div>
      </div>
    </div>
  );
}
