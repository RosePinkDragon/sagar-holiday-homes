// One-off image optimiser. NOT part of `next build`: run it by hand, commit the output.
//
//   node scripts/optimize-images.mjs <source-folder> [out-folder=public/photos] [--only a.jpg,b.jpg]
//
// For each photo writes <slug>-<width>.avif and <slug>-<width>.webp at 480/960/1600px wide
// (never upscaled), fixes EXIF rotation, strips metadata (incl. GPS), and records
// intrinsic dimensions in <out>/manifest.json for content/property.ts.
// Already-converted photos are skipped, so re-running after adding photos is cheap.

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const args = process.argv.slice(2)
const only = (() => {
  const i = args.indexOf('--only')
  return i === -1 ? null : new Set(args[i + 1].split(',').map((s) => s.toLowerCase()))
})()
const pos = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))
const [src, out = 'public/photos'] = pos
if (!src) {
  console.error('Usage: node scripts/optimize-images.mjs <source-folder> [out-folder] [--only a.jpg,b.jpg]')
  process.exit(1)
}

const WIDTHS = [480, 960, 1600]
const BUDGET_KB = { 480: 60, 960: 150, 1600: 300 } // per-file warning thresholds (WebP)
const slug = (f) =>
  path.basename(f).replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

fs.mkdirSync(out, { recursive: true })
const manifestPath = path.join(out, 'manifest.json')
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {}

const files = fs.readdirSync(src).filter((f) => {
  if (/\.(heic|heif)$/i.test(f)) {
    console.warn(`skipped (convert HEIC to JPG first): ${f}`)
    return false
  }
  return /\.(jpe?g|png|webp|tiff?)$/i.test(f) && (!only || only.has(f.toLowerCase()))
})

let done = 0
let skipped = 0
let over = 0
let bytes = 0
for (const f of files) {
  const id = slug(f)
  const targets = WIDTHS.flatMap((w) => ['avif', 'webp'].map((fmt) => path.join(out, `${id}-${w}.${fmt}`)))
  if (manifest[id] && targets.every((t) => fs.existsSync(t))) {
    skipped++
    continue
  }

  // Bake in EXIF rotation once so width/height below are the displayed orientation.
  const upright = await sharp(path.join(src, f), { failOn: 'none' }).rotate().toBuffer()
  const { width: W, height: H } = await sharp(upright).metadata()
  manifest[id] = { source: f, width: W, height: H }

  for (const w of WIDTHS) {
    const base = sharp(upright).resize({ width: w, withoutEnlargement: true })
    const webp = await base.clone().webp({ quality: 78, effort: 5 }).toBuffer()
    const avif = await base.clone().avif({ quality: 50, effort: 4 }).toBuffer()
    fs.writeFileSync(path.join(out, `${id}-${w}.webp`), webp)
    fs.writeFileSync(path.join(out, `${id}-${w}.avif`), avif)
    bytes += webp.length + avif.length
    if (webp.length / 1024 > BUDGET_KB[w]) {
      over++
      console.warn(`over budget: ${id}-${w}.webp ${(webp.length / 1024).toFixed(0)} KB (> ${BUDGET_KB[w]})`)
    }
  }
  done++
  if (done % 10 === 0) console.log(`  ${done}/${files.length}`)
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
console.log(`\nConverted ${done}, skipped ${skipped} (already done), over-budget files ${over}`)
console.log(`Wrote ${(bytes / 1048576).toFixed(1)} MB to ${out}; manifest: ${manifestPath}`)
