import { Suspense } from "react";
import VendorsChatClient from "./VendorsChatClient";

export const dynamic = "force-dynamic";

export default function VendorsChatPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            color: "#183F34",
            fontSize: 15,
          }}
        >
          Initialising concierge…
        </div>
      }
    >
      <VendorsChatClient />
    </Suspense>
  );
}
