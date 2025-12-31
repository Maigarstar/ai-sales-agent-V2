import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
  ChevronLeft,
  Mail,
  User,
  MapPin,
  Zap,
  ShieldCheck,
  Clock,
  Crown,
  ArrowRight,
  Globe,
} from "lucide-react";

import AtlasInlineStageSelect from "@/components/admin/AtlasInlineStageSelect";
import AtlasInlinePrioritySelect from "@/components/admin/AtlasInlinePrioritySelect";
import AtlasLeadAssignment from "@/components/admin/AtlasLeadAssignment";
import AuditLog from "./AuditLog";
import InternalNotes from "./InternalNotes";

/* ---------------------------------
   SUPABASE
---------------------------------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ---------------------------------
   PAGE
---------------------------------- */
export default async function AtlasLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: lead } = await supabase
    .from("vendor_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center luxury-serif italic">
        Lead not found
      </div>
    );
  }

  const displayScore = lead.score || 0;
  const isHot = lead.priority === "HOT" || displayScore >= 80;
  const alreadyInvited = lead.stage === "invited";

  async function handlePlatinumInvite() {
    "use server";

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("vendor_leads")
      .update({
        stage: "invited",
        invited_at: new Date().toISOString(),
        invite_sent_by: user?.id,
      })
      .eq("id", id);

    revalidatePath(`/admin/atlas/leads/${id}`);
  }

  return (
    <div className="min-h-screen pb-32 text-[var(--text-primary)]">

      {/* NAV */}
      <nav className="px-12 py-8 border-b border-[var(--border)]">
        <Link
          href="/admin/atlas/leads"
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--aura-gold)]"
        >
          <ChevronLeft size={14} />
          Partnership Vault
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-12">

        {/* HEADER */}
        <header className="py-20 flex justify-between items-end border-b border-[var(--border)]">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
              {isHot && (
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-black text-[var(--aura-gold)] shadow-md">
                  <Zap size={10} />
                  Priority Target
                </span>
              )}
              <span className="text-[11px] uppercase tracking-[0.5em] text-[var(--aura-gold)] font-bold">
                {lead.category || "Vendor"}
              </span>
            </div>

            <h1 className="luxury-serif text-7xl uppercase leading-[0.9] tracking-tight mb-6">
              {lead.business_name || "Capture Pending"}
            </h1>

            <p className="flex items-center gap-2 luxury-serif italic opacity-60">
              <MapPin size={16} className="text-[var(--aura-gold)]" />
              {lead.location || "Location not provided"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-3 font-black">
              Aura Score
            </p>
            <div className="luxury-serif text-[100px] leading-none text-[var(--aura-gold)]">
              {displayScore}
            </div>
          </div>
        </header>

        {/* INTELLIGENCE */}
        <section className="mt-20 pl-12 border-l border-[var(--aura-gold)]/30">
          <div className="flex items-center gap-3 mb-6 text-[var(--aura-gold)]">
            <ShieldCheck size={20} />
            <span className="text-[10px] uppercase tracking-[0.4em] font-black">
              Atlas Intelligence Brief
            </span>
          </div>

          <p className="luxury-serif text-3xl italic leading-relaxed max-w-4xl">
            Atlas identifies this opportunity as{" "}
            <span className="text-[var(--aura-gold)]">
              {isHot ? "High Priority" : "Standard Priority"}
            </span>{" "}
            with a vetting score of {displayScore}. Current stage: {lead.stage}.
          </p>
        </section>

        {/* GUIDANCE + PROBABILITY + VALUE */}
        <section className="grid grid-cols-5 gap-16 mt-24 border-t border-[var(--border)] pt-16">
          <Guidance label="Confidence" value={displayScore >= 85 ? "High" : "Developing"} />
          <Guidance label="Timeline" value={lead.intent_timing === "immediate" ? "Fast-track" : "Standard"} />
          <Guidance label="Strategy" value={isHot ? "Immediate Outreach" : "Monitor"} />
          <ProbabilitySignal probability={lead.deal_probability} />
          <ExpectedRevenue
            probability={lead.deal_probability}
            dealValue={lead.estimated_deal_value}
          />
        </section>

        {/* CONTROL CONSOLE */}
        <section className="mt-24 grid grid-cols-4 rounded-[2.4rem] overflow-hidden border border-[var(--border)] shadow-xl">
          <ControlCell>
            <AtlasInlinePrioritySelect leadId={lead.id} initialPriority={lead.priority} />
          </ControlCell>

          <ControlCell>
            <AtlasInlineStageSelect leadId={lead.id} currentStage={lead.stage} />
          </ControlCell>

          <ControlCell>
            <AtlasLeadAssignment leadId={lead.id} initialAssignedId={lead.assigned_to} />
          </ControlCell>

          <form action={handlePlatinumInvite}>
            <button
              disabled={alreadyInvited}
              className={`w-full h-full flex flex-col items-center justify-center gap-3 transition-all ${
                alreadyInvited
                  ? "bg-zinc-100 opacity-40 cursor-not-allowed"
                  : "bg-[var(--aura-gold)] text-black hover:brightness-105"
              }`}
            >
              <Crown size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                {alreadyInvited ? "Invited" : "Invite to Platinum"}
              </span>
            </button>
          </form>
        </section>

        {/* DOSSIER */}
        <div className="grid grid-cols-12 gap-24 mt-32">
          <div className="col-span-7 space-y-20">
            <Section title="Secure Contact">
              <InfoRow icon={<User />} label="Principal" value={lead.contact_name} />
              <InfoRow icon={<Mail />} label="Email" value={lead.contact_email} />
              <InfoRow icon={<Globe />} label="Website" value={lead.website} isLink />
            </Section>
          </div>

          <div className="col-span-5">
            <Section title="Vetting Signals">
              <SignalBadge label="Luxury Alignment" active={lead.luxury_positioning} />
              <SignalBadge label="Immediate Intent" active={lead.intent_timing === "immediate"} />
            </Section>

            <div className="mt-16 pt-8 border-t border-[var(--border)] text-[10px] uppercase tracking-widest opacity-40 font-bold flex items-center gap-3">
              <Clock size={14} />
              Logged {new Date(lead.created_at).toLocaleDateString("en-GB")}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-12 mt-40">
        <InternalNotes leadId={id} />
        <div className="mt-20 border-t border-[var(--border)] pt-20">
          <AuditLog leadId={id} />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------
   COMPONENTS
---------------------------------- */

function ControlCell({ children }: { children: React.ReactNode }) {
  return <div className="p-8 flex items-center justify-center bg-white">{children}</div>;
}

function Guidance({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-black mb-3">
        {label}
      </p>
      <p className="luxury-serif text-3xl">{value}</p>
    </div>
  );
}

function ProbabilitySignal({ probability }: { probability: number | null }) {
  if (probability === null) {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-black mb-3">
          Likelihood
        </p>
        <p className="text-sm opacity-40">Pending</p>
      </div>
    );
  }

  const pct = Math.round(probability * 100);
  let tier = "Low";
  if (pct >= 70) tier = "High";
  else if (pct >= 40) tier = "Medium";

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-black mb-3">
        Likelihood
      </p>
      <div className="flex items-baseline gap-3">
        <span className="luxury-serif text-4xl">{pct}%</span>
        <span className="text-xs uppercase tracking-widest opacity-50 font-bold">
          {tier}
        </span>
      </div>
    </div>
  );
}

function ExpectedRevenue({
  probability,
  dealValue,
}: {
  probability: number | null;
  dealValue: number | null;
}) {
  if (!probability || !dealValue) {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-black mb-3">
          Expected Value
        </p>
        <p className="text-sm opacity-40">Pending</p>
      </div>
    );
  }

  const expected = Math.round(probability * dealValue);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-black mb-3">
        Expected Value
      </p>
      <p className="luxury-serif text-3xl">
        £{expected.toLocaleString("en-GB")}
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-[0.4em] opacity-50 font-black mb-10 border-b border-[var(--border)] pb-4">
        {title}
      </h3>
      <div className="space-y-12">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value, isLink }: any) {
  return (
    <div className="flex items-start gap-6">
      <div className="text-[var(--aura-gold)] mt-1">{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] opacity-50 font-black mb-2">
          {label}
        </p>
        <div className="text-xl luxury-serif">
          {isLink && value ? (
            <a
              href={value.startsWith("http") ? value : `https://${value}`}
              target="_blank"
              className="hover:text-[var(--aura-gold)] flex items-center gap-2"
            >
              Visit Site <ArrowRight size={14} />
            </a>
          ) : (
            value || "Pending"
          )}
        </div>
      </div>
    </div>
  );
}

function SignalBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex justify-between items-center py-6 border-b border-[var(--border)] ${active ? "" : "opacity-30"}`}>
      <span className="text-[11px] uppercase tracking-[0.3em] font-black">
        {label}
      </span>
      <div className={`h-2.5 w-2.5 rounded-full ${active ? "bg-black" : "bg-zinc-300"}`} />
    </div>
  );
}
