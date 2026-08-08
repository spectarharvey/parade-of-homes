import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import PWARegister from "@/components/PWARegister";

// Chrome fires `beforeinstallprompt` very early — frequently before React has
// mounted the InstallButton. Capture it globally here (before hydration) and
// stash it on window so the button can always find it and fire the native
// install dialog. Without this the button often misses the event and can only
// show fallback instructions.
const INSTALL_CAPTURE = `(function(){
  try {
    var w = window;
    w.__pohInstalled =
      (w.matchMedia && w.matchMedia('(display-mode: standalone)').matches) ||
      w.navigator.standalone === true;
    w.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      w.__pohInstallPrompt = e;
      w.dispatchEvent(new Event('poh-install-ready'));
    });
    w.addEventListener('appinstalled', function () {
      w.__pohInstallPrompt = null;
      w.__pohInstalled = true;
      w.dispatchEvent(new Event('poh-installed'));
    });
  } catch (_) {}
})();`;

export const metadata: Metadata = {
  title: "MCBIA Parade of Homes",
  description:
    "Discover Marion County's finest new homes — tour builder showcases, plan your route, vote for favorites, and enter to win.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Parade of Homes",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#116799",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Script id="poh-install-capture" strategy="beforeInteractive">
          {INSTALL_CAPTURE}
        </Script>
        <AppProvider>{children}</AppProvider>
        <PWARegister />
      </body>
    </html>
  );
}
