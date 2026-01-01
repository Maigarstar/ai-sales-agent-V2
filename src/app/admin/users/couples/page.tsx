import Link from "next/link";

export const metadata = {
  title: "Couples | 5 Star Weddings",
  description:
    "Plan your wedding with confidence. Discover curated venues, trusted vendors, and intelligent guidance for luxury weddings and destination celebrations.",
};

export default function CouplesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-24 space-y-20">

        {/* HERO */}
        <section className="space-y-6">
          <h1 className="luxury-serif text-5xl leading-tight">
            Plan with confidence.  
            <br />
            Celebrate with distinction.
          </h1>

          <p className="text-lg text-gray-600 max-w-3xl">
            5 Star Weddings connects couples with exceptional venues, trusted wedding professionals,
            and intelligent guidance designed to elevate every stage of your wedding journey.
          </p>
        </section>

        {/* VALUE GRID */}
        <section className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="luxury-serif text-2xl mb-3">
              Curated Access
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Explore a refined collection of venues and wedding partners selected for quality,
              experience, and consistency. No endless scrolling. No uncertainty.
            </p>
          </div>

          <div>
            <h3 className="luxury-serif text-2xl mb-3">
              Intelligent Guidance
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Aura, our wedding intelligence concierge, helps you refine your vision,
              discover aligned partners, and move forward with clarity.
            </p>
          </div>

          <div>
            <h3 className="luxury-serif text-2xl mb-3">
              Time Saved
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Receive focused recommendations based on your priorities,
              location, and style, without the overwhelm of traditional planning.
            </p>
          </div>

          <div>
            <h3 className="luxury-serif text-2xl mb-3">
              Discreet Introductions
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Connect directly with venues and vendors who are genuinely aligned
              with your celebration, budget, and expectations.
            </p>
          </div>
        </section>

        {/* WHO IT IS FOR */}
        <section className="space-y-6">
          <h2 className="luxury-serif text-3xl">
            Designed for couples who value clarity and quality
          </h2>

          <p className="text-gray-600 max-w-3xl leading-relaxed">
            This experience is created for couples who prefer thoughtful decisions,
            elegant execution, and trusted expertise over noise and pressure.
          </p>

          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Destination weddings and refined local celebrations</li>
            <li>Couples seeking trusted professionals, not marketplaces</li>
            <li>Those who value calm guidance and informed choice</li>
          </ul>
        </section>

        {/* HOW IT WORKS */}
        <section className="space-y-6">
          <h2 className="luxury-serif text-3xl">
            How it works
          </h2>

          <ol className="space-y-4 text-gray-600">
            <li>1. Share your vision, preferences, and priorities</li>
            <li>2. Explore curated venues and trusted partners</li>
            <li>3. Connect directly with aligned professionals</li>
            <li>4. Plan with confidence, supported by intelligent insight</li>
          </ol>
        </section>

        {/* CTA */}
        <section className="pt-12 border-t border-gray-200 flex flex-col items-start gap-6">
          <p className="luxury-serif text-2xl">
            Your wedding, elevated.
          </p>

          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-black text-white text-sm uppercase tracking-widest rounded-md hover:opacity-90 transition"
          >
            Begin Planning
          </Link>
        </section>

      </div>
    </div>
  );
}
