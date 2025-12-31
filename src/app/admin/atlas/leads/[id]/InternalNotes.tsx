import { createClient } from "@supabase/supabase-js";
import { MessageSquare } from "lucide-react";
import { addInternalNote } from "./actions";

/* ---------------------------------
   NOTES VIEW
---------------------------------- */
export default async function InternalNotes({
  leadId,
}: {
  leadId: string;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: notes } = await supabase
    .from("lead_notes")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  return (
    <section className="mt-24 border-t border-black/5 pt-16">
      <div className="flex items-center gap-3 mb-10">
        <MessageSquare size={18} className="text-[#C5A059]" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A059]">
          Internal Notes
        </h3>
      </div>

      {/* ADD NOTE FORM */}
      <form
        action={addInternalNote.bind(null, leadId)}
        className="flex gap-4"
      >
        <textarea
          name="note"
          placeholder="Private note for sales team only…"
          className="flex-1 rounded-xl border border-black/10 p-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
          rows={3}
        />

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[#183F34] text-white text-xs font-black uppercase tracking-widest hover:opacity-90"
        >
          Save
        </button>
      </form>

      {/* NOTES LIST */}
      <div className="space-y-6 mt-10">
        {notes?.map((note) => (
          <div
            key={note.id}
            className="border border-black/5 rounded-2xl p-6 bg-zinc-50"
          >
            <p className="text-[14px] leading-relaxed mb-3">
              {note.note}
            </p>

            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
              {note.author_name || "System"} ·{" "}
              {new Date(note.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        ))}

        {!notes?.length && (
          <p className="text-[11px] italic opacity-40">
            No internal notes yet.
          </p>
        )}
      </div>
    </section>
  );
}
