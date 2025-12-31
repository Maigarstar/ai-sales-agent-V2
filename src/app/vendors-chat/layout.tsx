// app/vendors-chat/layout.tsx

export const metadata = {
  title: "Vendors Chat",
  description: "AI Vendor Qualification Assistant",
};

export default function VendorsChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ margin: 0, padding: 0 }}>
      {children}
    </div>
  );
}
