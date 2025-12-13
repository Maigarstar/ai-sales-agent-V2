"use client";

export default function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b border-[#EAE7E2] flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-[#183F34]">
        Admin Panel
      </h2>

      <div className="text-sm text-[#183F34]/70">
        Logged in as <span className="font-medium">Admin</span>
      </div>
    </header>
  );
}
