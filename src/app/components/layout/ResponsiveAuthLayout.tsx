"use client";

export default function ResponsiveAuthLayout({
  left,
  right,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="auth-wrapper">
      <div className="auth-left">{left}</div>
      {right && <div className="auth-right">{right}</div>}
    </div>
  );
}
