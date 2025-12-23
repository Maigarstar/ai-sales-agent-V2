"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ArrowRight, Apple, Mail, ShieldCheck } from "lucide-react";

const GOLD = "#C5A059";

export default function ConciergeLoginGate({
  onAuthed,
  onPrefill,
}: {
  onAuthed: (session: any) => void;
  onPrefill: (p: { name?: string; email?: string }) => void;
}) {
  const sb = supabaseBrowser();
  const [step, setStep] = useState<"capture" | "auth">("capture");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // bubble up session when a user completes auth
  useEffect(() => {
    const { data: sub } = sb.auth.onAuthStateChange(async (_event, session) => {
      if (session) onAuthed(session);
    });
    return () => sub.subscription.unsubscribe();
  }, [sb, onAuthed]);

  async function startCapture(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) return;

    setBusy(true);
    try {
      await fetch("/api/vendors-chat/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          source: "concierge",
        }),
      });
      onPrefill({ name, email });
      setStep("auth");
    } catch (err: any) {
      setError(err?.message ?? "Could not start. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signInWithApple() {
    setBusy(true);
    setError(null);
    try {
      await sb.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/wedding-concierge/chat`,
        },
      });
    } catch {
      setError("Apple sign in failed");
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    try {
      await sb.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/wedding-concierge/chat`,
        },
      });
    } catch {
      setError("Google sign in failed");
      setBusy(false);
    }
  }

  async function signInWithEmailLink() {
    setBusy(true);
    setError(null);
    try {
      await sb.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/wedding-concierge/chat`,
          data: { full_name: name },
        },
      });
    } catch {
      setError("We could not send the magic link");
    } finally {
      setBusy(false);
    }
  }

  if (step === "capture") {
    return (
      <div className="min-h-screen bg-white text-[#112620] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <header className="text-center mb-8">
            <h1 className="luxury-serif text-[36px] tracking-tight">
              5 Star Weddings
            </h1>
            <p className="luxury-serif text-[22px] mt-1" style={{ color: GOLD }}>
              Concierge
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Your AI Concierge Experience
            </p>
          </header>

          <form onSubmit={startCapture} className="space-y-4">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-full border border-neutral-300 px-5 py-4"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full rounded-full border border-neutral-300 px-5 py-4"
            />

            {error && (
              <div className="text-[13px] text-red-600">{error}</div>
            )}

            <button
              disabled={busy || !name || !email}
              className="w-full rounded-full bg-[#183F34] text-white py-4 font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-4 text-center text-xs opacity-70">
            Your details let Aura personalise your shortlist, then you can sign in to save everything
          </p>

          <div className="mt-8 text-center text-xs text-neutral-500">
            Powered by Taigenic.ai
          </div>
        </div>
      </div>
    );
  }

  // step === "auth"
  return (
    <div className="min-h-screen bg-white text-[#112620] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <header className="text-center mb-6">
          <h2 className="text-sm tracking-widest">Welcome {name}</h2>
          <p className="text-[13px] opacity-70">
            Choose how you would like to continue
          </p>
        </header>

        <div className="space-y-3">
          <button
            onClick={signInWithApple}
            disabled={busy}
            className="w-full rounded-full border border-neutral-300 py-3 flex items-center justify-center gap-2 hover:bg-neutral-50"
          >
            <Apple size={18} /> Continue with Apple
          </button>

          <button
            onClick={signInWithGoogle}
            disabled={busy}
            className="w-full rounded-full border border-neutral-300 py-3 flex items-center justify-center gap-2 hover:bg-neutral-50"
          >
            {/* Google G icon */}
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path
                fill="#FFC107"
                d="M43.6 20.5H42v-.1H24v7.2h11.3C33.4 31.8 29.1 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1.1 7.2 2.8l5.1-5.1C33 7.1 28.7 5.3 24 5.3 12.7 5.3 3.7 14.3 3.7 25.6S12.7 45.9 24 45.9c10.4 0 19.4-7.5 19.4-20.3 0-1.6-.1-2.7-.4-3.9z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={signInWithEmailLink}
            disabled={busy || !email.trim()}
            className="w-full rounded-full bg-[#183F34] text-white py-3 flex items-center justify-center gap-2 hover:opacity-90"
          >
            <Mail size={18} /> Send me a magic link
          </button>

          <button
            onClick={() => onAuthed(null)}
            className="w-full rounded-full border border-neutral-300 py-3 flex items-center justify-center gap-2 hover:bg-neutral-50"
          >
            Continue as guest
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs opacity-70">
          <ShieldCheck size={12} />
          Your details are private. You can upgrade to full access any time
        </div>

        <div className="mt-8 text-center text-xs text-neutral-500">
          Powered by Taigenic.ai
        </div>
      </div>
    </div>
  );
}
