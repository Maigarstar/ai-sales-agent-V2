"use client";

import React, { useState, useRef, useEffect } from "react";

export default function AuraVoice() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [status, setStatus] = useState("Idle");
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);

  // 1. Start the Session
  const startSession = async () => {
    setStatus("Requesting Microphone...");
    
    // Get Microphone Access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Initialize Peer Connection
    const pc = new RTCPeerConnection();
    peerConnection.current = pc;

    // Add local microphone track to the connection
    pc.addTrack(stream.getTracks()[0]);

    // Handle incoming audio from Aura (The AI)
    const remoteStream = new MediaStream();
    pc.ontrack = (event) => {
      remoteStream.addTrack(event.track);
      if (audioElement.current) {
        audioElement.current.srcObject = remoteStream;
        audioElement.current.play();
      }
    };

    // 2. Create the SDP Offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    setStatus("Connecting to Aura...");

    // 3. Send Offer to your Backend (The code we wrote previously)
    const response = await fetch("/api/voice", {
      method: "POST",
      body: offer.sdp,
      headers: { "Content-Type": "application/sdp" },
    });

    if (!response.ok) {
      setStatus("Connection Failed");
      return;
    }

    // 4. Set the Remote Description (The Answer)
    const answerSdp = await response.text();
    await pc.setRemoteDescription({
      type: "answer",
      sdp: answerSdp,
    });

    setIsSessionActive(true);
    setStatus("Connected");
  };

  // Stop the Session
  const stopSession = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setIsSessionActive(false);
    setStatus("Idle");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-neutral-50 p-8 rounded-xl border border-neutral-200">
      
      {/* Hidden Audio Element for Output */}
      <audio ref={audioElement} autoPlay />

      <div className="text-center space-y-6">
        {/* Branding */}
        <h2 className="text-2xl font-serif tracking-widest text-neutral-800">
          5 STAR WEDDINGS
        </h2>
        <p className="text-neutral-500 font-light uppercase tracking-widest text-xs">
          AI Concierge
        </p>

        {/* Status Indicator */}
        <div className="h-8 flex items-center justify-center">
          <span className={`text-sm font-medium ${isSessionActive ? "text-emerald-600 animate-pulse" : "text-neutral-400"}`}>
             {isSessionActive ? "Aura is Listening..." : status}
          </span>
        </div>

        {/* The Button */}
        <button
          onClick={isSessionActive ? stopSession : startSession}
          className={`
            px-8 py-3 rounded-full transition-all duration-500 ease-out
            font-serif text-sm tracking-widest uppercase
            ${isSessionActive 
              ? "bg-neutral-900 text-white hover:bg-neutral-700 shadow-lg" 
              : "bg-white text-neutral-900 border border-neutral-300 hover:border-neutral-900 hover:shadow-xl"
            }
          `}
        >
          {isSessionActive ? "End Consultation" : "Speak with Aura"}
        </button>
      </div>
    </div>
  );
}