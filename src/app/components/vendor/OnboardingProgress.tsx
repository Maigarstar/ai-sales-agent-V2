"use client";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  // Calculate percentage for the progress bar width
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-3 mb-10">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#1F4D3E] uppercase tracking-[0.2em]">
            Onboarding Progress
          </span>
          <p className="text-xs text-gray-400 font-medium">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
        <span className="text-xs font-serif italic text-[#1F4D3E]">
          {Math.round(progress)}% Complete
        </span>
      </div>
      
      {/* Progress Bar Container */}
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
        <div 
          className="h-full bg-[#1F4D3E] transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(31,77,62,0.2)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}