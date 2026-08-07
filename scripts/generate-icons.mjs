import sharp from "sharp";

const BG = "#116799";

// 512-canvas icon: white house + "MCBIA" wordmark on the brand blue, matching
// the original PARADE icon layout.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BG}"/>
  <g fill="#ffffff">
    <!-- roof -->
    <path d="M256 120 L416 262 L96 262 Z"/>
    <!-- body -->
    <rect x="152" y="248" width="208" height="104"/>
  </g>
  <!-- door (blue opening) -->
  <rect x="230" y="292" width="52" height="60" fill="${BG}"/>
  <text x="256" y="432" fill="#ffffff" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="86"
        font-weight="700" letter-spacing="3">MCBIA</text>
</svg>`;

const targets = process.argv.includes("--preview")
  ? [{ file: "scripts/_icon-preview.png", size: 512 }]
  : [
      { file: "public/icon-192.png", size: 192 },
      { file: "public/icon-512.png", size: 512 },
      { file: "public/icon-maskable-512.png", size: 512 },
      { file: "public/apple-icon.png", size: 180 },
    ];

for (const { file, size } of targets) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(file);
  console.log("wrote", file, `${size}x${size}`);
}
