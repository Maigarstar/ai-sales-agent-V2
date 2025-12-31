import { createClient } from "@supabase/supabase-js";
import { History, UserCircle } from "lucide-react";

export default async function AuditLog({ leadId }: { leadId: string }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: logs } = await supabase
    .from("lead_audit_logs")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (!logs || logs.length === 0) return null;

  return (
    <section className="mt-24 border-t border-black/5 pt-16">
      <div className="flex items-center gap-3 mb-10">
        <History size={18} className="text-[#C5A059]" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A059]">
          Partnership Audit Trail
        </h3>
      </div>

      <div className="overflow-hidden border border-black/5 rounded-2xl">
        <table className="w-full bg-white border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-black/5">
              <th className="px-6 py-4 text-[9px] uppercase tracking-widest text-zinc-400 font-black">Date</th>
              <th className="px-6 py-4 text-[9px] uppercase tracking-widest text-zinc-400 font-black">Action</th>
              <th className="px-6 py-4 text-[9px] uppercase tracking-widest text-zinc-400 font-black">Agent</th>
              <th className="px-6 py-4 text-[9px] uppercase tracking-widest text-zinc-400 font-black text-right">Change</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black/5">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-5 text-[11px] text-zinc-400">
                  {new Date(log.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                <td className="px-6 py-5">
                  <span className="text-[10px] uppercase tracking-widest font-black text-[#183F34]">
                    {log.action_type.replace(/_/g, " ")}
                  </span>
                </td>

                <td className="px-6 py-5 flex items-center gap-2">
                  <UserCircle size={14} className="text-[#C5A059] opacity-50" />
                  <span className="text-[12px] font-medium">
                    {log.full_name || "System"}
                  </span>
                </td>

                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 text-[11px]">
                    {log.old_value && (
                      <span className="line-through opacity-30">
                        {log.old_value}
                      </span>
                    )}
                    {log.new_value && (
                      <>
                        <span className="text-[#C5A059] font-bold">→</span>
                        <span className="font-bold text-[#183F34]">
                          {log.new_value}
                        </span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
