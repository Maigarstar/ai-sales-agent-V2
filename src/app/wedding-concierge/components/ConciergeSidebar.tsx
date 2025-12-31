"use client";

export default function ConciergeSidebar({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={`relative h-screen border-r border-neutral-200 bg-neutral-50 transition-all duration-300 ${
        open ? "w-64" : "w-16"
      }`}
    >
      {/* Single edge toggle, one control only */}
      <button
        type="button"
        onClick={onToggle}
        aria-label="Toggle sidebar"
        className="absolute -right-3 top-5 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 shadow"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          {open ? (
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" />
          ) : (
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" />
          )}
        </svg>
      </button>

      {/* Brand strip */}
      <div className="flex h-14 items-center px-4">
        <div className="truncate text-xs font-semibold tracking-widest text-neutral-700">
          {open ? "WEDDING CONCIERGE" : "WC"}
        </div>
      </div>

      {/* Nav */}
      <nav className="px-2 pt-2">
        <a
          href="/wedding-concierge/chat"
          className={`block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 ${
            open ? "" : "text-center px-2"
          }`}
        >
          {open ? "Chat" : "C"}
        </a>
        <a
          href="/wedding-concierge/planning"
          className={`mt-1 block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 ${
            open ? "" : "text-center px-2"
          }`}
        >
          {open ? "Planning" : "P"}
        </a>
        <a
          href="/wedding-concierge/style"
          className={`mt-1 block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 ${
            open ? "" : "text-center px-2"
          }`}
        >
          {open ? "Style" : "S"}
        </a>
        <a
          href="/wedding-concierge/vendors"
          className={`mt-1 block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 ${
            open ? "" : "text-center px-2"
          }`}
        >
          {open ? "Vendors" : "V"}
        </a>
      </nav>

      {/* Footer inside rail */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-200 px-3 py-3">
        <div className={`${open ? "" : "text-center"} text-xs text-neutral-500`}>
          {open ? "5 Star Weddings" : "5★"}
        </div>
      </div>
    </aside>
  );
}