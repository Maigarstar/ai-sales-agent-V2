"use client";

import CookieModal from "@/app/components/cookies/CookieModal";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <CookieModal />
    </>
  );
}
