"use client";

import ClientThemeProvider from "@/context/ClientThemeProvider";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientThemeProvider>
      {children}
    </ClientThemeProvider>
  );
}
