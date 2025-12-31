"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function Dropdown({
  label,
  items,
  align = "right",
}: {
  label: React.ReactNode;
  items: { label: string; href?: string; onClick?: () => void; color?: string }[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm text-gray-600 font-medium hover:text-brand transition-all"
      >
        {label}
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {open && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-3 w-48 bg-white/70 backdrop-blur-md border border-white/30 shadow-luxury rounded-2xl animate-fadeIn overflow-hidden`}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setOpen(false);
                item.onClick?.();
              }}
              className={`block w-full text-left px-5 py-3 text-sm ${
                item.color
                  ? `text-${item.color}-500`
                  : "text-gray-600 hover:text-brand"
              } hover:bg-gold-hover transition-all`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
