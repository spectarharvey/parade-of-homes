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
 * Ordered list of logo candidates for a builder. The <img> tries each in turn
 * (advancing on error) so a logo loads automatically for every builder that has
 * a website — curated logos first, then several web sources for redundancy, and
 * only initials if every source fails.
 *
 * Order: database logo → local file → Google favicon (256px) → unavatar
 * (aggregates Clearbit/favicon/DuckDuckGo) → DuckDuckGo icon → site favicon.
 */
export function builderLogoSources(
  builder?: (Pick<Builder, "name" | "website"> & { logo?: string | null }) | null,
) {
  const dbLogo = builder?.logo?.trim() ?? "";
  const localLogo = builderLogo(builder);
  const webSources: string[] = [];

  try {
    const website = builder?.website?.trim();
    if (website) {
      const cleanWeb = /^https?:\/\//.test(website) ? website : `https://${website}`;
      const url = new URL(cleanWeb);
      const domain = url.hostname.replace(/^www\./, "");
      if (domain) {
        // Google usually serves a crisp favicon; unavatar is a reliable
        // aggregator that resolves logos Google misses. `fallback=false` makes
        // unavatar 404 (so the chain advances) instead of returning a generic
        // placeholder avatar.
        webSources.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`);
        webSources.push(`https://unavatar.io/${domain}?fallback=false`);
        webSources.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
        webSources.push(`${url.origin}/favicon.ico`);
      }
    }
  } catch {
    // An invalid or missing website simply has no logo fallback.
  }

  return [...new Set([dbLogo, localLogo, ...webSources].filter(Boolean))];
}
