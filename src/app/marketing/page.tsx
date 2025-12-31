import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default function MarketingPage() {
  async function submitLead(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const business = String(formData.get("business") || "").trim();
    const website = String(formData.get("website") || "").trim();

    if (!email || !business) return;

    const { data, error } = await supabase
      .from("vendor_leads")
      .insert({
        contact_name: name || null,
        contact_email: email,
        business_name: business,
        website: website || null,
        source: "marketing_page",
        stage: "new",
        priority: "WARM",
        score: 0,
        chat_type: "vendor",
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !data?.id) return;

    redirect(`/atlas/chat?lead=${data.id}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black px-8">
      <div className="max-w-3xl w-full">

        {/* BRAND HEADER */}
        <div className="mb-20 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500 mb-6 font-black">
            5 Star Weddings · The Luxury Wedding Collection · Est. 2006
          </p>

          <h1 className="luxury-serif text-6xl leading-[1.05] mb-6">
            Atlas
          </h1>

          <p className="luxury-serif text-xl italic opacity-70">
            Revenue intelligence for luxury wedding and hospitality brands
          </p>
        </div>

        {/* VALUE */}
        <div className="mb-20 space-y-10">
          <p className="text-lg leading-relaxed">
            Atlas is the intelligence layer behind 5 Star Weddings.
            It qualifies, prioritises, and routes genuine business
            enquiries before they ever reach your sales team.
          </p>

          <p className="text-lg leading-relaxed">
            Built by Taigenic.ai, Atlas replaces spreadsheets,
            inbox chaos, and low intent enquiries with structured,
            human guided decision making.
          </p>

          <p className="text-lg leading-relaxed">
            This is not a chatbot.
            This is not automation theatre.
            This is sales intelligence, designed for luxury brands.
          </p>
        </div>

        {/* FORM */}
        <form action={submitLead} className="space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              name="name"
              placeholder="Your name"
              className="w-full border border-zinc-300 rounded-xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            />

            <input
              name="email"
              placeholder="Email address"
              required
              className="w-full border border-zinc-300 rounded-xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            />
          </div>

          <input
            name="business"
            placeholder="Business name"
            required
            className="w-full border border-zinc-300 rounded-xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
          />

          <input
            name="website"
            placeholder="Website (optional)"
            className="w-full border border-zinc-300 rounded-xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
          />

          <button
            type="submit"
            className="w-full mt-6 rounded-2xl bg-[#C5A059] text-black py-5 text-[11px] font-black uppercase tracking-[0.35em] hover:opacity-90 transition"
          >
            Enter Atlas
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-20 text-center text-[11px] opacity-50 leading-relaxed">
          Taigenic.ai is the proprietary technology created by<br />
          5 Star Weddings · The Luxury Wedding Collection
        </div>

      </div>
    </div>
  );
}
