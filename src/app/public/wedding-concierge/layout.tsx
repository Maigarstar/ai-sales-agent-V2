// app/wedding-concierge/layout.tsx
import type { ReactNode } from "react";

export default function WeddingConciergeLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen bg-gray-50">
      {children}
    </section>
  );
}
