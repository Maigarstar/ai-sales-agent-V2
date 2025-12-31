"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  // Load dark mode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("dark-mode");
    if (saved === "true") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggleMode() {
    const newState = !dark;
    setDark(newState);

    if (newState) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dark-mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dark-mode", "false");
    }
  }

  return (
    <button
      onClick={toggleMode}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-800 transition"
    >
      {dark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
