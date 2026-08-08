"use client";

import { useEffect, useState } from "react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

declare global {
  interface Window {
    __pohInstallPrompt?: BIPEvent | null;
    __pohInstalled?: boolean;
  }
}

export default function InstallButton({
  className = "btn btn-gold btn-block",
  label = "⬇ Install the App",
}: {
  className?: string;
  label?: string;
}) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      window.__pohInstalled === true;
    if (standalone) {
      setInstalled(true);
      return;
    }
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    // The global capture (in layout.tsx) may have already stored the prompt
    // before this component mounted — pick it up immediately.
    if (window.__pohInstallPrompt) setDeferred(window.__pohInstallPrompt);

    const syncFromGlobal = () => {
      if (window.__pohInstallPrompt) setDeferred(window.__pohInstallPrompt);
    };
    // Also listen directly, in case the event fires after mount.
    const onBIP = (e: Event) => {
      e.preventDefault();
      window.__pohInstallPrompt = e as BIPEvent;
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      window.__pohInstallPrompt = null;
      setDeferred(null);
      setInstalled(true);
    };
    window.addEventListener("poh-install-ready", syncFromGlobal);
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("poh-installed", onInstalled);
    return () => {
      window.removeEventListener("poh-install-ready", syncFromGlobal);
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("poh-installed", onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <p className="muted" style={{ fontSize: ".85rem", fontWeight: 600 }}>
        ✓ App installed — open it from your home screen
      </p>
    );
  }

  const handleClick = async () => {
    const prompt = deferred || window.__pohInstallPrompt || null;
    if (prompt) {
      await prompt.prompt();
      try {
        await prompt.userChoice;
      } catch {
        /* user dismissed */
      }
      // A prompt can only be used once.
      window.__pohInstallPrompt = null;
      setDeferred(null);
    } else {
      setShowHelp(true);
    }
  };

  return (
    <>
      <button className={className} onClick={handleClick} type="button">
        {label}
      </button>
      {showHelp && (
        <p className="muted" style={{ fontSize: ".8rem", marginTop: ".6rem", lineHeight: 1.5 }}>
          {isIOS ? (
            <>
              On iPhone/iPad: tap the <b>Share</b> icon, then{" "}
              <b>“Add to Home Screen.”</b>
            </>
          ) : (
            <>
              In your browser menu choose <b>“Install app”</b> / <b>“Add to Home
              screen.”</b> (In desktop Chrome, use the install icon in the address
              bar.)
            </>
          )}
        </p>
      )}
    </>
  );
}
