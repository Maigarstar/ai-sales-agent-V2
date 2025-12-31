"use client";

type Props = {
  onToggleSidebar: () => void;
};

export default function ConciergeTopBar({ onToggleSidebar }: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="text-xs px-3 py-1 rounded-full border border-neutral-300"
      >
        ☰
      </button>

      <div className="text-sm font-semibold tracking-wide">
        Wedding Concierge
      </div>

      {/* spacer to balance the left button */}
      <div className="w-10" />
    </header>
  );
}