export const dynamic = "force-dynamic";

export default function WeddingConciergeHub() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-start justify-center px-4 py-10 bg-[#FDFCFB] text-[#112620]">
      <div className="w-full">
        <header className="mb-8 text-center">
          <h1 className="luxury-serif text-3xl tracking-tight">Wedding Concierge</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Start with onboarding or jump straight into chat with Aura.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="/wedding-concierge/(with-sidebar)/planning"
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow"
          >
            <div className="text-lg font-semibold">Begin Onboarding</div>
            <p className="mt-1 text-sm text-neutral-600">Share date, guest numbers, locations, and style.</p>
          </a>

          <a
            href="/wedding-concierge/(with-sidebar)/chat"
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow"
          >
            <div className="text-lg font-semibold">Open Chat</div>
            <p className="mt-1 text-sm text-neutral-600">Speak with Aura now. You can onboard later.</p>
          </a>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <a
            href="/wedding-concierge/(with-sidebar)/planning"
            className="rounded-lg border border-neutral-200 bg-white p-4 text-sm transition hover:shadow"
          >
            Planning tools
          </a>
          <a
            href="/wedding-concierge/(with-sidebar)/style"
            className="rounded-lg border border-neutral-200 bg-white p-4 text-sm transition hover:shadow"
          >
            Style and inspiration
          </a>
          <a
            href="/wedding-concierge/(with-sidebar)/vendors"
            className="rounded-lg border border-neutral-200 bg-white p-4 text-sm transition hover:shadow"
          >
            Vendors and venues
          </a>
        </div>
      </div>
    </main>
  );
}
