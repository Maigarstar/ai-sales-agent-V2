import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#FDFCFB" }}> {/* Luxury Cream Background */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
        
        {/* Navigation Bar */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            border: "1px solid rgba(24, 63, 52, 0.1)", // Subtle green border
            borderRadius: 16,
            background: "#ffffff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          {/* Logo / Brand Name */}
          <Link href="/" style={{ 
            textDecoration: "none", 
            color: "#183F34", 
            fontWeight: 700, 
            fontSize: "20px",
            fontFamily: "Gilda Display, serif",
            letterSpacing: "1px"
          }}>
            AURA
          </Link>

          {/* Auth Links */}
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <Link href="/login" style={{ 
              textDecoration: "none", 
              color: "#555", 
              fontSize: "14px",
              fontWeight: 500
            }}>
              Sign In
            </Link>
            
            <Link href="/signup" style={{ 
              textDecoration: "none", 
              color: "#fff", 
              backgroundColor: "#183F34", // Signature Action Color
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              transition: "opacity 0.2s"
            }}>
              Join as Vendor
            </Link>
          </div>
        </nav>

        {/* Main Page Content */}
        <div style={{ marginTop: 32 }}>
          {children}
        </div>
      </div>
    </div>
  );
}