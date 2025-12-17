"use client";

import { useRef, useState } from "react";

type Status = "idle" | "connecting" | "live" | "error";

export default function AuraVoice() {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [status, setStatus] = useState<Status>("idle");

  async function start() {
    if (status !== "idle") return;

    setStatus("connecting");

    try {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioRef.current = audioEl;

      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") setStatus("live");
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected")
          setStatus("error");
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.createDataChannel("oai-events");

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpAnswer = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp ?? "",
      }).then(async (res) => {
        const t = await res.text();
        if (!res.ok) throw new Error(t || `Server error ${res.status}`);
        return t;
      });

      await pc.setRemoteDescription({ type: "answer", sdp: sdpAnswer });
    } catch {
      stop();
      setStatus("error");
    }
  }

  function stop() {
    pcRef.current?.close();
    pcRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    if (audioRef.current) audioRef.current.srcObject = null;

    setStatus("idle");
  }

  const live = status === "live";
  const connecting = status === "connecting";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={start}
        disabled={connecting || live}
        className={`px-3 py-2 rounded-xl border text-sm shadow-sm transition-colors ${
          live ? "bg-green-50 border-green-200 text-green-800" : "bg-white border-gray-200 text-gray-700"
        } ${connecting ? "opacity-60" : ""}`}
        title="Start voice"
      >
        {connecting ? "Voice..." : live ? "Live" : "Voice"}
      </button>

      <button
        type="button"
        onClick={stop}
        disabled={!live}
        className="px-3 py-2 rounded-xl border text-sm shadow-sm bg-white border-gray-200 text-gray-600 disabled:opacity-50"
        title="End voice"
      >
        End
      </button>
    </div>
  );
}
