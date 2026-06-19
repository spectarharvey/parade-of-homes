// Generates PWA icons (PNG) from an on-brand SVG into /public.
// Run once: node scripts/gen-icons.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public");
fs.mkdirSync(outDir, { recursive: true });

// Navy background with a white house mark + "PARADE" wordmark.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#116799"/>
  <g fill="#ffffff">
    <path d="M256 132 L398 250 L366 250 L366 350 L146 350 L146 250 L114 250 Z"/>
    <rect x="232" y="288" width="48" height="62" fill="#116799"/>
  </g>
  <text x="256" y="430" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="64" font-weight="700" fill="#ffffff" letter-spacing="2">PARADE</text>
</svg>`;

const buf = Buffer.from(svg);

async function gen(size, name) {
  await sharp(buf).resize(size, size).png().toFile(path.join(outDir, name));
  console.log("  ✓", name);
}

await gen(192, "icon-192.png");
await gen(512, "icon-512.png");
await gen(512, "icon-maskable-512.png");
await gen(180, "apple-icon.png");
console.log("Icons written to /public");
