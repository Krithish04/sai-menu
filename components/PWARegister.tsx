"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      (window.location.protocol === "https:" ||
        window.location.hostname === "localhost")
    ) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => console.debug("SW register bypassed:", err));
      };

      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(registerSW, { timeout: 3000 });
      } else {
        setTimeout(registerSW, 1500);
      }
    }
  }, []);

  return null;
}
