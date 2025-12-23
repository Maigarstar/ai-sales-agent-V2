// app/vendor-sales-agent/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your Private Wedding Concierge | 5 Star Weddings",
  description:
    "Connect with our private wedding concierge to explore fit, visibility, and refined connections for couples, venues, and wedding vendors worldwide.",
};

export default function VendorSalesAgentPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f7f7",
        padding: "40px 16px 60px",
        fontFamily: "system-ui, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        {/* Header */}
        <section
  style={{
    marginBottom: 32,
    textAlign: "center",
  }}
>
  <h1
    style={{
      fontFamily: "Gilda Display, serif",
      fontSize: 44,
      lineHeight: 1.2,
      color: "#183F34",
      marginBottom: 12,
      fontWeight: 400,
    }}
  >
    5 Star Weddings
  </h1>

  <h3
    style={{
      fontFamily: "Gilda Display, serif",
      fontSize: 30,
      lineHeight: 1.3,
      color: "#183F34",
      marginBottom: 18,
      fontWeight: 400,
    }}
  >
    Your Private Wedding Concierge
  </h3>

  <p
    style={{
      maxWidth: 700,
      margin: "0 auto",
      fontSize: 16,
      lineHeight: 1.7,
      color: "#555",
    }}
  >
    Share a little about your brand or your celebration and I will guide you
    through whether our collection is the right fit, what kind of visibility we
    can bring, and how we connect couples and exceptional venues worldwide.
  </p>
</section>

        {/* Main Grid */}
        <section
          className="vendorSalesGrid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
            gap: 24,
          }}
        >
          {/* Left Panel */}
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
              Our concierge asks a few thoughtful questions about your venue or
              service, typical budgets, locations, and the type of enquiries you
              want more of. From there, we explore how you may sit within our
              curated collection and which options make sense.
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
                • Understand the level of couples we reach in your markets
              </li>
              <li style={{ marginBottom: 8 }}>
                • Explore featured placement and editorial opportunities
              </li>
              <li style={{ marginBottom: 8 }}>
                • See how Taigenic AI helps qualify enquiries and save time
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
                Request details
              </Link>
            </div>

            <p style={{ marginTop: 16, fontSize: 12, color: "#777" }}>
              Prefer to type instead of talk? Use the concierge on the right and
              we can follow up personally with a tailored proposal.
            </p>
          </div>

          {/* Right Panel */}
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
                Here to help you 24/7
              </p>
            </div>

            <iframe
              title="Vendor Concierge"
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

        {/* Footer Branding */}
        <footer
          style={{
            marginTop: 60,
            padding: "36px 16px 42px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "Gilda Display, serif",
              fontSize: 16,
              color: "#183F34",
              marginBottom: 6,
            }}
          >
            5 Star Weddings, The Luxury Wedding Collection
          </p>

          <p
            style={{
              fontSize: 13,
              color: "#666",
              maxWidth: 520,
              margin: "0 auto 18px",
              lineHeight: 1.6,
            }}
          >
            A curated collection of exceptional wedding venues and vendors,
            supported by refined editorial and intelligent concierge guidance.
          </p>

          <p style={{ fontSize: 12, color: "#888" }}>
            Powered by <span style={{ color: "#183F34" }}>Taigenic.ai</span> ·{" "}
            <a
              href="#"
              data-cookie-preferences
              style={{ color: "#888", textDecoration: "underline" }}
            >
              Cookie Preferences
            </a>{" "}
            ·{" "}
            <a
              href="https://5starweddingdirectory.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#888", textDecoration: "underline" }}
            >
              Privacy Policy
            </a>
          </p>
        </footer>

        <style>{`
          @media (max-width: 840px) {
            .vendorSalesGrid {
              grid-template-columns: minmax(0, 1fr) !important;
            }
          }
        `}</style>
      </div>
    </main>
  );
}
