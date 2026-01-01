"use client";

import { useEffect, useRef, useState } from "react";
import { AudioLines } from "lucide-react";

type AuraVoiceProps = {
  className?: string;
  onStart?: () => void;
  onStop?: () => void;
  onError?: (err: string) => void;
};

export default function AuraVoice({
  className,
  onStart,
  onStop,
  onError,
}: AuraVoiceProps) {
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hadError, setHadError] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    typeof RTCPeerConnection !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function" &&
    window.isSecureContext === true;

  async function start() {
    if (!isSupported) {
      setHadError(true);
      onError?.("Voice requires HTTPS and browser support");
      return;
    }

    if (busy || active) return;
    setBusy(true);
    setHadError(false);

    try {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (!audioRef.current) return;
        audioRef.current.srcObject = remoteStream;
        audioRef.current.play().catch(() => {});
      };

      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = localStream;

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp || "",
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "Voice connection failed");
        throw new Error(msg);
      }

      const sdpAnswer = await res.text();
      await pc.setRemoteDescription({ type: "answer", sdp: sdpAnswer });

      setActive(true);
      onStart?.();
    } catch (err: any) {
      console.error("AuraVoice error", err);
      setHadError(true);
      onError?.(err?.message || "Voice failed");
      stop();
    } finally {
      setBusy(false);
    }
  }

  function stop() {
    try {
      pcRef.current?.getSenders().forEach((s) => s.track?.stop());
      pcRef.current?.close();
    } catch {}

    pcRef.current = null;

    try {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}

    localStreamRef.current = null;

    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
      audioRef.current.srcObject = null;
    }

    if (active) onStop?.();
    setActive(false);
    setBusy(false);
  }

  function toggle() {
    if (active) stop();
    else void start();
  }

  useEffect(() => {
    return () => stop();
  }, []);

  return (
    <>
      <audio ref={audioRef} autoPlay className="hidden" />

      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-label={active ? "Turn off voice" : "Turn on voice"}
        aria-pressed={active}
        title={
          hadError
            ? "Microphone permission required"
            : active
            ? "Voice active"
            : "Start voice chat"
        }
        className={[
          "relative h-11 w-11 rounded-full flex items-center justify-center transition active:scale-95 shadow-sm",
          active
            ? "bg-[#183F34] text-[#C5A059]"
            : "bg-white text-gray-900 border border-gray-200",
          hadError ? "border-red-400" : "",
          busy ? "opacity-60 cursor-not-allowed" : "opacity-100",
          className || "",
        ].join(" ")}
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[#C5A059]/20 animate-ping"
          />
        )}

        <AudioLines
          size={18}
          className={active ? "opacity-100" : "opacity-70"}
        />
      </button>
    </>
  );
}
