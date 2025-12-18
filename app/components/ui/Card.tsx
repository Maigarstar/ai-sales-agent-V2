"use client";

import React from "react";

export default function Card({
  title,
  subtitle,
  children,
  gradient = false,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  gradient?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${
        gradient
          ? "bg-luxury-gradient"
          : "bg-white/80 backdrop-blur-md border border-gray-100"
      } rounded-3xl shadow-luxury hover:shadow-glow transition-all duration-300 ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-8 pt-8">
          {title && (
            <h3 className="font-serif text-brand text-2xl mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-gray-500 text-sm mb-4 font-sans">{subtitle}</p>
          )}
        </div>
      )}
      <div className="p-8 pt-0">{children}</div>
    </div>
  );
}
