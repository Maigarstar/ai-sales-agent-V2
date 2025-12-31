"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/src/app/context/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`p-2 rounded-full ${isLight ? "text-neutral-700" : "text-white"}`}
      title={isLight ? "Switch to dark" : "Switch to light"}
    >
      {isLight ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
