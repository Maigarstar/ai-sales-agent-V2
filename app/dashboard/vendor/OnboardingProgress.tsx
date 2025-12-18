"use client";

export default function OnboardingProgress({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}) {
  const percentage = ((step - 1) / totalSteps) * 100;

  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className="bg-gradient-to-r from-[#1F4D3E] to-[#C8A165] h-2 transition-all duration-500"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}
