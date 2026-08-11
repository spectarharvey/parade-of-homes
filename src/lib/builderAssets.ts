import type { Builder } from "./types";

const BUILDER_LOGOS: Record<string, string> = {
  "brije homes": "/parade-entries/2026/brije-logo.webp",
  "brije": "/parade-entries/2026/brije-logo.webp",
  "brije llc": "/parade-entries/2026/brije-logo.webp",
  "d.r. horton": "/parade-entries/2026/dr-horton-logo.png",
  "dr horton": "/parade-entries/2026/dr-horton-logo.png",
  "the deltona corporation": "/parade-entries/2026/deltona-logo.jpg",
  "deltona corporation": "/parade-entries/2026/deltona-logo.jpg",
  "secure built, llc": "/parade-entries/2026/secure-built-logo.png",
  "secure built llc": "/parade-entries/2026/secure-built-logo.png",
  "curington homes": "/parade-entries/2026/curington-logo.png",
  "curington": "/parade-entries/2026/curington-logo.png",
};

export function builderLogo(builder?: (Pick<Builder, "name"> & { logo?: string | null }) | null) {
  if (builder?.logo?.trim()) return builder.logo.trim();
  if (!builder?.name) return "";
  return BUILDER_LOGOS[builder.name.toLowerCase().trim()] ?? "";
}

/**
 * Prefer database logo, then local logo, then fast Google CDN favicon, then site favicon fallback.
 */
export function builderLogoSources(
  builder?: (Pick<Builder, "name" | "website"> & { logo?: string | null }) | null,
) {
  const dbLogo = builder?.logo?.trim() ?? "";
  const localLogo = builderLogo(builder);
  let googleFavicon = "";
  let siteLogo = "";

  try {
    const website = builder?.website?.trim();
    if (website) {
      const cleanWeb = /^https?:\/\//.test(website) ? website : `https://${website}`;
      const url = new URL(cleanWeb);
      const domain = url.hostname.replace(/^www\./, "");
      if (domain) {
        googleFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        siteLogo = `${url.origin}/favicon.ico`;
      }
    }
  } catch {
    // An invalid or missing website simply has no logo fallback.
  }

  return [...new Set([dbLogo, localLogo, googleFavicon, siteLogo].filter(Boolean))];
}
