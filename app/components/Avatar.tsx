import React from "react";

interface AvatarProps {
  role: "assistant" | "user";
}

export default function Avatar({ role }: AvatarProps) {
  const isAssistant = role === "assistant";

  const bgColor = isAssistant ? "#FFFFFF" : "#183F34"; // deep green for vendor
  const borderColor = isAssistant ? "#C8A165" : "#183F34"; // gold for assistant
  const textColor = isAssistant ? "#183F34" : "#FFFFFF";

  const initials = isAssistant ? "C" : "V"; 
  // C = Concierge, V = Vendor

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Gilda Display, serif",
        fontSize: 18,
        fontWeight: 500,
        color: textColor,
      }}
    >
      {initials}
    </div>
  );
}
