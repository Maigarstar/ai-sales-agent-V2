// app/vendor-sales-agent/page.tsx

import Link from "next/link";

export const metadata = {
  title: "Vendor Sales Agent | 5 Star Weddings",
  description:
    "Share a little about your brand and let our AI concierge show you how 5 Star Weddings can bring you more high-value destination enquiries.",
};

export default function VendorSalesAgentPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f7f7",
        padding: "40px 16px 60px",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto",
        }}
      >
        {/* Header / intro */}
        <section style={{ marginBottom: 32, textAlign: "center" }}>
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: 11,
              color: "#777",
              marginBottom: 8,
            }}
          >
            5 Star Weddings
          </p>
          <h1
            style={{
              fontFamily: "Gilda Display, serif",
              fontSize: 32,
              color: "#183F34",
              marginBottom: 10,
            }}
          >
            Vendor Sales Agent
          </h1>
          <p
            style={{
              maxWidth: 640,
              margin: "0 auto",
              fontSize: 15,
              lineHeight: 1.6,
              color: "#555",
            }}
          >
            Share a little about your brand and I will guide you through whether
            our collection is the right fit, what kind of visibility we can
            bring, and how we help venues and vendors attract more international
            couples.
          </p>
        </section>

        {/* Two column layout: left benefits, right chat */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
            gap: 24,
          }}
        >
          {/* Left: sales copy and CTAs */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 20,
              padding: 22,
              boxShadow: "0 14px 40px rgba(0, 0, 0, 0.04)",
            }}
          >
            <h2
              style={{
                fontFamily: "Gilda Display, serif",
                fontSize: 22,
                color: "#183F34",
                marginBottom: 16,
              }}
            >
              Is 5 Star Weddings the right home for your brand?
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#555",
                lineHeight: 1.7,
                marginBottom: 18,
              }}
            >
              Our AI concierge will ask a few smart questions about your venue
              or service, typical budgets, locations, and the kind of enquiries
              you want more of. From there, we can see how you might sit within
              our curated collection and which plan makes sense.
            </p>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 18px",
                fontSize: 14,
                color: "#444",
              }}
            >
              <li style={{ marginBottom: 8 }}>
                • Discover how many high-value couples we reach in your markets
              </li>
              <li style={{ marginBottom: 8 }}>
                • Explore options for featured placement and editorial coverage
              </li>
              <li style={{ marginBottom: 8 }}>
                • See how Taigenic AI helps qualify enquiries and save you time
              </li>
            </ul>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <Link
                href="/vendor-apply"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 18px",
                  borderRadius: 999,
                  backgroundColor: "#183F34",
                  color: "#ffffff",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Apply to join the collection
              </Link>

              <Link
                href="/contactus"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "1px solid #183F34",
                  color: "#183F34",
                  fontSize: 14,
                  textDecoration: "none",
                  backgroundColor: "#ffffff",
                }}
              >
                Book a short call
              </Link>
            </div>

            <p
              style={{
                marginTop: 16,
                fontSize: 12,
                color: "#777",
              }}
            >
              Prefer to type instead of talk? Use the concierge on the right,
              then we can follow up personally with a tailored proposal.
            </p>
          </div>

          {/* Right: embedded chat (full page, not the bubble) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 24,
              padding: 0,
              boxShadow: "0 18px 48px rgba(0, 0, 0, 0.05)",
              overflow: "hidden",
              minHeight: 520,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "14px 18px 10px",
                borderBottom: "1px solid #eee",
              }}
            >
              <p
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontSize: 10,
                  color: "#999",
                  marginBottom: 4,
                }}
              >
                AI Concierge
              </p>
              <p
                style={{
                  fontFamily: "Gilda Display, serif",
                  fontSize: 18,
                  color: "#183F34",
                  margin: 0,
                }}
              >
                Vendor Sales Agent
              </p>
            </div>

            <iframe
              title="Vendor Sales Agent"
              src="/vendors-chat?embed=1"
              style={{
                border: "none",
                width: "100%",
                flex: 1,
                minHeight: 420,
              }}
              allow="clipboard-read; clipboard-write"
              loading="lazy"
            />
          </div>
        </section>

        {/* Mobile layout tweak */}
        <style jsx>{`
          @media (max-width: 840px) {
            section:nth-of-type(2) {
              grid-template-columns: minmax(0, 1fr);
            }
          }
        `}</style>
      </div>
    </main>
  );
}
