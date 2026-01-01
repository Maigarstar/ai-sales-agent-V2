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

import AtlasInlineStageSelect from "@/app/components/admin/AtlasInlineStageSelect";
import AtlasInlinePrioritySelect from "@/app/components/admin/AtlasInlinePrioritySelect";
import AtlasLeadAssignment from "@/app/components/admin/AtlasLeadAssignment";
import AuditLog from "./AuditLog";
import InternalNotes from "./InternalNotes";

/* ---------------------------------
   SUPABASE (SERVER)
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
  params: { id: string };
}) {
  const { id } = params;

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
        invite_sent_by: user?.id ?? null,
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

        {/* CONTROL CONSOLE */}
        <section className="mt-24 grid grid-cols-4 rounded-[2.4rem] overflow-hidden border border-[var(--border)] shadow-xl">
          <ControlCell>
            <AtlasInlinePrioritySelect
              leadId={lead.id}
              initialPriority={lead.priority}
            />
          </ControlCell>

          <ControlCell>
            <AtlasInlineStageSelect
              leadId={lead.id}
              initialStage={lead.stage}
            />
          </ControlCell>

          <ControlCell>
            <AtlasLeadAssignment
              leadId={lead.id}
              initialAssignedId={lead.assigned_to}
            />
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

        {/* NOTES + AUDIT */}
        <div className="max-w-6xl mx-auto px-12 mt-40">
          <InternalNotes leadId={id} />
          <div className="mt-20 border-t border-[var(--border)] pt-20">
            <AuditLog leadId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------
   COMPONENTS
---------------------------------- */

function ControlCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8 flex items-center justify-center bg-white">
      {children}
    </div>
  );
}
