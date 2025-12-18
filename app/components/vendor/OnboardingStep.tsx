"use client";

import { CheckCircle, Loader2 } from "lucide-react";
import React from "react";

type OnboardingStepProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  completed?: boolean;
  loading?: boolean;
  locked?: boolean;
  onNext?: () => void;
  nextLabel?: string;
};

export default function OnboardingStep({
  title,
  description,
  children,
  completed = false,
  loading = false,
  locked = false,
  onNext,
  nextLabel = "Continue",
}: OnboardingStepProps) {
  return (
    <div
      className={`relative rounded-[2rem] border p-8 transition-all ${
        locked
          ? "border-gray-200 bg-gray-50 opacity-70"
          : completed
          ? "border-green-200 bg-green-50"
          : "border-gray-100 bg-white shadow-sm hover:shadow-md"
      }`}
    >
      {/* Step Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-serif text-[#1F4D3E]">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {loading ? (
          <Loader2 className="animate-spin text-[#1F4D3E]" size={22} />
        ) : completed ? (
          <CheckCircle className="text-green-600" size={24} />
        ) : null}
      </div>

      {/* Step Body */}
      <div className="mt-4">{children}</div>

      {/* Step Actions */}
      {onNext && !completed && !locked && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onNext}
            disabled={loading}
            className="px-5 py-3 text-sm font-bold uppercase tracking-widest text-white bg-[#1F4D3E] rounded-2xl hover:bg-[#163C30] transition-all disabled:opacity-60"
          >
            {loading ? "Processing..." : nextLabel}
          </button>
        </div>
      )}

      {/* Step Locked Banner */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-[2rem]">
          <p className="text-sm font-medium text-gray-500">
            Complete previous step to unlock
          </p>
        </div>
      )}
    </div>
  );
}
