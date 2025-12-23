"use client";

export default function OnboardingStep({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-serif text-[#1F4D3E] mb-1">{title}</h2>
      <p className="text-gray-500 text-sm mb-6">{description}</p>
      {children}
    </div>
  );
}
