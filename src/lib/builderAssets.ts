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
};

export function builderLogo(builder?: Pick<Builder, "name"> | null) {
  if (!builder?.name) return "";
  return BUILDER_LOGOS[builder.name.toLowerCase()] ?? "";
}
