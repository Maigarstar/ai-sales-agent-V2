// src/app/vision/page.tsx
import { Suspense } from "react";
import VisionConversationClient from "./VisionConversationClient";

export const dynamic = "force-dynamic";

export default function VisionPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#070707",
            fontFamily: "var(--font-gilda)",
            color: "#c6a157",
          }}
        >
          <h1
            style={{
              letterSpacing: "0.45em",
              fontSize: "12px",
              textTransform: "uppercase",
            }}
          >
            Initialising Vision...
          </h1>
        </div>
      }
    >
      <VisionConversationClient />
    </Suspense>
  );
}
