"use client";

import { useEffect, useState } from "react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
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
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
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
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
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
