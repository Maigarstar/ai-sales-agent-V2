import Link from "next/link";

export default function AtlasLandingPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-between">

      {/* TOP BAR */}
      <header className="w-full px-10 py-8 flex items-center justify-between">
        <div className="text-xs tracking-[0.35em] uppercase opacity-70">
          Menu
        </div>

        <Link
          href="/login"
          className="text-xs tracking-widest uppercase border border-white/20 px-5 py-2 rounded-full hover:border-white transition"
        >
          Login
        </Link>
      </header>

      {/* HERO */}
      <section className="flex flex-col items-center text-center px-6">
        <h1 className="luxury-serif text-5xl md:text-6xl tracking-wide mb-4">
          5 Star Weddings
        </h1>

        <p className="luxury-serif text-xl text-[#C5A059] mb-6">
          Concierge
        </p>

        <p className="max-w-xl text-sm opacity-60 leading-relaxed">
          The world’s most exclusive wedding visions, curated by private intelligence.
        </p>
      </section>

      {/* ENTRY CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 px-10 w-full max-w-5xl my-20">

        {/* COUPLES */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-50 mb-4">
              For Couples
            </p>

            <h2 className="luxury-serif text-3xl mb-4">
              Unveil Your Vision
            </h2>

            <p className="text-sm opacity-60 leading-relaxed">
              Direct access to Aura, your private intelligence concierge, designed to interpret your vision and reveal the world’s most exceptional wedding destinations.
            </p>
          </div>

          <Link
            href="/concierge"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-[#183F34] px-8 py-4 text-xs tracking-widest uppercase font-bold hover:opacity-90 transition"
          >
            Enter Concierge
          </Link>
        </div>

        {/* PARTNERS */}
        <div className="rounded-3xl border border-[#C5A059]/30 bg-white/5 p-10 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-50 mb-4">
              For Partners
            </p>

            <h2 className="luxury-serif text-3xl mb-4">
              Join the Portfolio
            </h2>

            <p className="text-sm opacity-60 leading-relaxed">
              Atlas connects a curated selection of venues and artisans with high intent global enquiries. Inclusion is by alignment, not application.
            </p>
          </div>

          <Link
            href="/atlas/chat"
            className="mt-10 inline-flex items-center justify-center rounded-full border border-[#C5A059] px-8 py-4 text-xs tracking-widest uppercase font-bold text-[#C5A059] hover:bg-[#C5A059] hover:text-black transition"
          >
            Request Consideration
          </Link>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="w-full text-center text-[10px] tracking-widest uppercase opacity-40 pb-8">
        Powered by Taigenic.ai · 5 Star Weddings Ltd · Est. 2006
      </footer>

    </main>
  );
}
