export default function VendorsChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 50% -200px, #1b1b1b 0%, #0a0a0a 55%, #060606 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "48px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "820px",
          borderRadius: 24,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          backdropFilter: "blur(24px)",
          boxShadow:
            "0 40px 120px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
