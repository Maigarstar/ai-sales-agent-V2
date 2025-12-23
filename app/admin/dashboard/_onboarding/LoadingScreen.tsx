"use client";

import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div style={overlay}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={card}
      >
        <div style={logoWrap}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={logoText}
          >
            5 STAR WEDDINGS
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            style={subText}
          >
            POWERED BY TAIGENIC AI
          </motion.span>
        </div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
          style={loaderWrap}
        >
          <Loader2 size={40} color="#a58a32" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          style={message}
        >
          Concierge Initializing
          <Sparkles size={16} style={{ marginLeft: 6, color: "#a58a32" }} />
        </motion.p>
      </motion.div>
    </div>
  );
}

/* === Styles === */
const overlay = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  width: "100vw",
  backgroundColor: "#f4f7f6",
  fontFamily: "'Nunito Sans', sans-serif",
};

const card = {
  textAlign: "center" as const,
  backgroundColor: "#ffffff",
  padding: "60px 80px",
  borderRadius: "30px",
  boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
};

const logoWrap = { marginBottom: "36px" };
const logoText = {
  display: "block",
  fontFamily: "'Gilda Display', serif",
  fontSize: "22px",
  letterSpacing: "4px",
  color: "#18342e",
  fontWeight: 700,
};
const subText = {
  display: "block",
  fontSize: "10px",
  letterSpacing: "2px",
  color: "#a58a32",
  fontWeight: 800,
  marginTop: "6px",
};

const loaderWrap = {
  margin: "30px auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const message = {
  color: "#18342e",
  fontWeight: 600,
  fontSize: "15px",
  marginTop: "8px",
  letterSpacing: "0.5px",
};
