"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DealForecast({
  leadId,
  initialValue,
}: {
  leadId: string;
  initialValue?: number;
}) {
  const [value, setValue] = useState(initialValue || 0);

  async function save() {
    await supabase
      .from("vendor_leads")
      .update({ deal_value: value })
      .eq("id", leadId);
  }

  return (
    <div>
      <p className="text-[9px] uppercase tracking-widest opacity-40 mb-2">
        Forecast Value
      </p>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={save}
        className="border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}
