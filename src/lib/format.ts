import type { Home } from "./types";

export const money = (n: number) => "$" + Number(n).toLocaleString("en-US");

export const moneyK = (n: number) =>
  n >= 1000000
    ? "$" + (n / 1000000).toFixed(2).replace(/\.?0+$/, "") + "M"
    : "$" + Math.round(n / 1000) + "K";

export const stars = (r: number) =>
  "★★★★★☆☆☆☆☆".slice(5 - Math.round(r), 10 - Math.round(r));

// Accepts either a full URL (uploaded image / Cloudinary) or a bare Unsplash
// photo code (the original seed format) and returns a usable image URL.
export const imgUrl = (code: string, w = 900) => {
  if (!code) return "";
  if (/^https?:\/\//.test(code)) return code;
  return `https://images.unsplash.com/photo-${code}?auto=format&fit=crop&w=${w}&q=70`;
};

export const homePhoto = (h: Home) =>
  h.imgs && h.imgs.length ? imgUrl(h.imgs[0]) : "";

/** Deterministic pseudo-QR (decorative, not scannable). Returns an SVG string. */
export function qrSVG(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const N = 11;
  const rnd = () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h >>> 16) / 65535;
  };
  let cells = "";
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const corner =
        (x < 3 && y < 3) || (x > N - 4 && y < 3) || (x < 3 && y > N - 4);
      if (corner || rnd() > 0.5)
        cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  const finder = (fx: number, fy: number) =>
    `<rect x="${fx}" y="${fy}" width="3" height="3" fill="#0a1c30"/><rect x="${fx + 1}" y="${fy + 1}" width="1" height="1" fill="#fff"/>`;
  return `<svg viewBox="-0.5 -0.5 ${N + 1} ${N + 1}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="-0.5" y="-0.5" width="${N + 1}" height="${N + 1}" fill="#fff"/><g fill="#0a1c30">${cells}</g>${finder(0, 0)}${finder(N - 3, 0)}${finder(0, N - 3)}</svg>`;
}
