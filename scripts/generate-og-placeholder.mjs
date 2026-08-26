// One-off generator for the placeholder OpenGraph image (seo.defaultOgImage
// in content/property.ts). Delete this script once real photography lands
// and the file it produces is replaced with the actual hero shot.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve("public/og");
const OUT_FILE = path.join(OUT_DIR, "placeholder-1200x630.png");

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#F0EADF" />
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#5C7F6E" stroke-width="2" />
  <text x="600" y="280" font-family="Georgia, 'Times New Roman', serif" font-size="68" font-weight="600" fill="#234F3E" text-anchor="middle">Sagar Holiday Homes</text>
  <text x="600" y="340" font-family="Arial, sans-serif" font-size="28" fill="#4A6658" text-anchor="middle">A private villa in a Konkan orchard — Dapoli</text>
  <text x="600" y="560" font-family="Arial, sans-serif" font-size="20" fill="#8A3F2B" text-anchor="middle">PLACEHOLDER — replace with the hero photo (pool, orchard behind)</text>
</svg>
`;

await mkdir(OUT_DIR, { recursive: true });
await sharp(Buffer.from(svg)).png().toFile(OUT_FILE);
console.log(`Wrote ${OUT_FILE}`);
