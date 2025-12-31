"use client";

import React from "react";
import { Mail, MessageSquare, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

export default function CommLog({ emails, messages }: any) {
  // Combine and sort all communications by date
  const timeline = [...emails, ...messages].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const brand = { green: "#18342E", ivory: "#FAF7F6", gold: "#C5A059", border: "#EAE7E3" };

  return (
    <div style={logContainer}>
      <h3 style={gildaTitle}>COMMUNICATION TIMELINE</h3>
      <div style={timelineWrapper}>
        {timeline.map((item, idx) => (
          <div key={idx} style={timelineItem}>
            {/* Logic: Distinguish between Chat and Email */}
            <div style={iconBox(item.message ? brand.green : brand.gold)}>
              {item.message ? <MessageSquare size={14} /> : <Mail size={14} />}
            </div>

            <div style={contentBox}>
              <div style={logHeader}>
                <span style={typeLabel}>{item.message ? "LIVE CHAT" : "EMAIL INTERCEPT"}</span>
                <span style={dateLabel}>{new Date(item.created_at).toLocaleString()}</span>
              </div>
              <p style={logBody}>
                {item.message || item.html_body?.replace(/<[^>]*>?/gm, '').slice(0, 150) + "..."}
              </p>
              
              {/* Receipt Status */}
              {!item.role && (
                <div style={receiptBadge}>
                  <ShieldCheck size={10} /> INCOMING FROM CLIENT
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* === LUXURY TIMELINE STYLES === */
const logContainer = { marginTop: "40px" };
const gildaTitle = { fontFamily: "'Gilda Display', serif", fontSize: "20px", color: "#18342E", marginBottom: "24px", letterSpacing: "1px" };
const timelineWrapper = { borderLeft: "1px solid #EAE7E3", marginLeft: "20px", paddingLeft: "30px", display: "flex", flexDirection: "column" as const, gap: "32px" };

const timelineItem = { position: "relative" as const, display: "flex", gap: "20px" };
const iconBox = (color: string) => ({ 
  position: "absolute" as const, left: "-42px", top: "0",
  width: "24px", height: "24px", borderRadius: "50%", 
  backgroundColor: color, color: "#FFF", 
  display: "flex", alignItems: "center", justifyContent: "center" 
});

const contentBox = { backgroundColor: "#FFF", padding: "20px", borderRadius: "16px", border: "1px solid #EAE7E3", width: "100%" };
const logHeader = { display: "flex", justifyContent: "space-between", marginBottom: "12px" };
const typeLabel = { fontSize: "10px", fontWeight: 800, color: "#6F6A67", letterSpacing: "1px" };
const dateLabel = { fontSize: "10px", color: "#6F6A67", opacity: 0.6 };
const logBody = { fontSize: "14px", color: "#2E2B28", lineHeight: "1.6", margin: 0 };
const receiptBadge = { marginTop: "12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "9px", fontWeight: 800, color: "#C5A059" };