"use client";

import { useEffect, useState, type FC } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import ConciergeLoginGate from "../components/ConciergeLoginGate";
import AuraRefinedChat from "./AuraRefinedChat";

type Prefill = { name?: string; email?: string };
interface AuraChatProps { prefill?: Prefill }

// Typed wrapper using React.FC rather than JSX namespace
const AuraChat: FC<AuraChatProps> = (props) => {
  const Inner = AuraRefinedChat as unknown as FC<AuraChatProps>;
  return <Inner {...props} />;
};

export default function WeddingConciergeChatPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [prefill, setPrefill] = useState<Prefill | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] grid place-items-center text-[#183F34]">
        Initialising concierge…
      </div>
    );
  }

  if (!session) {
    return (
      <ConciergeLoginGate
        onAuthed={(s) => setSession(s)}
        onPrefill={(p) => setPrefill(p)}
      />
    );
  }

  return <AuraChat prefill={prefill ?? undefined} />;
}
