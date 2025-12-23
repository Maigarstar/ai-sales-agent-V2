"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function WelcomeScreen() {
  return (
    <div style={overlay}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={card}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={badge}
        >
          <Sparkles size={28} color="#a58a32" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={title}
        >
          Welcome to the Aura Network
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          style={subtitle}
        >
          Your digital concierge has been activated.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          style={line}
        />
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
  padding: "80px 100px",
  borderRadius: "40px",
  boxShadow: "0 12px 50px rgba(0,0,0,0.06)",
};

const badge = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  backgroundColor: "#18342e",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 30px",
};

const title = {
  fontFamily: "'Gilda Display', serif",
  fontSize: "28px",
  color: "#18342e",
  marginBottom: "12px",
  letterSpacing: "1px",
};

const subtitle = {
  fontSize: "15px",
  color: "#a58a32",
  fontWeight: 600,
  marginBottom: "40px",
  letterSpacing: "0.5px",
};

const line = {
  height: "2px",
  width: "60px",
  backgroundColor: "#a58a32",
  margin: "0 auto",
  borderRadius: "2px",
};
