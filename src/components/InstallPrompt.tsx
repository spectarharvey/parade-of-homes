"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

const DISMISS_KEY = "poh_install_dismissed";

// App-wide "Save to Homescreen" prompt. Appears when the app is opened on a
// mobile browser (or whenever the browser offers install), until dismissed.
export default function InstallPrompt() {
  const pathname = usePathname();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(true); // hidden until we confirm it should show
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const mobile = /iphone|ipad|ipod|android|mobile/i.test(ua);
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const alreadyDismissed = localStorage.getItem(DISMISS_KEY) === "1";

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      if (!alreadyDismissed) setDismissed(false);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    // On iOS there's no beforeinstallprompt event, so show the banner directly.
    if (mobile && !alreadyDismissed) {
      const t = setTimeout(() => setDismissed(false), 1500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBIP);
        window.removeEventListener("appinstalled", onInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Avoid cluttering the map page (its sticky trip bar lives at the bottom).
  if (installed || dismissed || pathname === "/map") return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      dismiss();
    } else {
      setShowIOSHelp(true);
    }
  };

  return (
    <div className="install-prompt">
      <div className="install-prompt-icon">📱</div>
      <div className="install-prompt-text">
        <b>Save to your Home Screen</b>
        <span>
          Install the Parade of Homes app for one-tap check-ins and offline
          access.
        </span>
        {showIOSHelp && isIOS && (
          <span className="install-prompt-help">
            Tap the <b>Share</b> icon, then <b>“Add to Home Screen.”</b>
          </span>
        )}
      </div>
      <div className="install-prompt-actions">
        <button className="btn btn-gold btn-sm" onClick={install}>
          {deferred ? "Install" : "Save App"}
        </button>
        <button className="install-prompt-x" onClick={dismiss} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}
