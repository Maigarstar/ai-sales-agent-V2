"use client";

import { useRef, useState } from "react";

type Status = "idle" | "connecting" | "live" | "error";

export default function AuraVoice() {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [note, setNote] = useState("");

  async function start() {
    if (status !== "idle") return;

    setStatus("connecting");
    setNote("Allow microphone access, connecting.");

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
        if (pc.connectionState === "connected") {
          setStatus("live");
          setNote("Voice connected.");
        }
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setStatus("error");
          setNote("Voice disconnected, start again.");
        }
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
    } catch (e: any) {
      stop();
      setStatus("error");
      setNote(e?.message ? String(e.message) : "Voice failed.");
    }
  }

  function stop() {
    pcRef.current?.close();
    pcRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    if (audioRef.current) audioRef.current.srcObject = null;

    setStatus("idle");
    setNote("Voice ended.");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={start}
          disabled={status === "connecting" || status === "live"}
          className="px-4 py-2 rounded-2xl border"
        >
          {status === "connecting" ? "Connecting" : status === "live" ? "Live" : "Start voice"}
        </button>

        <button
          onClick={stop}
          disabled={status === "idle"}
          className="px-4 py-2 rounded-2xl border"
        >
          End voice
        </button>
      </div>

      {note ? <div className="text-sm opacity-80">{note}</div> : null}
    </div>
  );
}
