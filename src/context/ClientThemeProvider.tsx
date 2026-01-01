"use client";

import React from "react";
import { ThemeProvider } from "./ThemeProvider";

export default function ClientThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
