"use client";

import { useEffect } from "react";
import { useCookies } from "@/app/components/cookies/CookieContext";

export default function ProvideSupport() {
  const { analyticsAccepted } = useCookies();

  useEffect(() => {
    if (!analyticsAccepted) return;
    if ((window as any).__provideSupportLoaded) return;

    (window as any).__provideSupportLoaded = true;

    const load = (src: string) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      document.body.appendChild(s);
    };

    load(
      "https://image.providesupport.com/js/00w8xxhihpcie1ionxhh6o20ab/safe-monitor-sync.js?ps_h=kOig&ps_t=" +
        Date.now()
    );
    load("https://image.providesupport.com/sjs/static.js");
  }, [analyticsAccepted]);

  return null;
}
