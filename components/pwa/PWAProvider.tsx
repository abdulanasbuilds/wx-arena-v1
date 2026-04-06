"use client";

import { useEffect } from "react";
import { PWAInstallPrompt } from "./PWAInstallPrompt";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    }
  }, []);

  return (
    <>
      {children}
      <PWAInstallPrompt />
    </>
  );
}
