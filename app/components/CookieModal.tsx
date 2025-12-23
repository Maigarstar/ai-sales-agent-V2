"use client";

import { X } from "lucide-react";

export default function CookieModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div style={overlay}>
      <div style={modalCard}>
        <div style={modalHeader}>
          <h2 className="luxury-serif" style={modalTitle}>Cookie Preference Center</h2>
          <button onClick={onClose} style={closeBtn}><X size={18} /></button>
        </div>
        
        <div style={modalBody}>
          <p style={desc}>We use cookies for essential operations, analytics and marketing measurement.</p>
          
          <div style={optionRow}>
            <div>
              <div style={optTitle}>Strictly Necessary</div>
              <div style={optSub}>Security and authentication</div>
            </div>
            <div style={toggleOn} />
          </div>

          <div style={optionRow}>
            <div>
              <div style={optTitle}>Analytics</div>
              <div style={optSub}>Performance monitoring</div>
            </div>
            <div style={toggleOff} />
          </div>
        </div>

        <div style={modalFooter}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={onClose} style={confirmBtn}>Confirm Choices</button>
        </div>
      </div>
    </div>
  );
}

/* Sharp Luxury Modal Styles (Radius: 6px) */
const overlay = { position: "fixed" as "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 };
const modalCard = { width: "100%", maxWidth: "480px", backgroundColor: "#fff", borderRadius: "6px", overflow: "hidden" };
const modalHeader = { padding: "24px", borderBottom: "1px solid #EEE", display: "flex", justifyContent: "space-between", alignItems: "center" };
const modalTitle = { fontSize: "18px", color: "#112620" };
const closeBtn = { background: "none", border: "none", cursor: "pointer", color: "#AAA" };
const modalBody = { padding: "24px" };
const desc = { fontSize: "13px", color: "#666", marginBottom: "24px", lineHeight: "1.5" };
const optionRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" };
const optTitle = { fontSize: "14px", fontWeight: "700", color: "#112620" };
const optSub = { fontSize: "11px", color: "#999" };
const toggleOn = { width: "36px", height: "18px", backgroundColor: "#C5A059", borderRadius: "6px" };
const toggleOff = { width: "36px", height: "18px", backgroundColor: "#EEE", borderRadius: "6px" };
const modalFooter = { padding: "20px 24px", backgroundColor: "#F9F9F9", display: "flex", justifyContent: "flex-end", gap: "12px" };
const cancelBtn = { background: "none", border: "none", color: "#666", fontWeight: "600", cursor: "pointer", fontSize: "12px" };
const confirmBtn = { padding: "10px 20px", backgroundColor: "#112620", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "12px" };