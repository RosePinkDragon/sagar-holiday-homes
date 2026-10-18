// One-off brand asset generator. NOT part of `next build`: run it by hand, commit the output.
//
//   node scripts/generate-brand.mjs <logo-source-image>
//
// Takes the full logo artwork (any size, white background), trims it to the
// emblem, masks it to a transparent circle and writes:
//   public/brand/logo-160.webp, logo-320.webp   header / footer / JSON-LD (1x, 2x)
//   app/icon.png (512)                          favicon for modern browsers
//   app/apple-icon.png (180, on bone)           iOS home screen — it fills transparency with black
//   app/favicon.ico (16/32/48, PNG-in-ICO)      crawlers and old browsers that ask for /favicon.ico

import fs from 'node:fs'
import sharp from 'sharp'

const src = process.argv[2]
if (!src) {
  console.error('Usage: node scripts/generate-brand.mjs <logo-source-image>')
  process.exit(1)
}

const BONE = '#f0eadf' // --bone in app/globals.css; keep in step

const { data, info } = await sharp(src).trim({ threshold: 12 }).toBuffer({ resolveWithObject: true })
const side = Math.min(info.width, info.height)
const square = await sharp(data)
  .extract({ left: Math.floor((info.width - side) / 2), top: Math.floor((info.height - side) / 2), width: side, height: side })
  .toBuffer()

/** Emblem resized to `px`, corners transparent. */
const circle = async (px) => {
  const mask = Buffer.from(`<svg width="${px}" height="${px}"><circle cx="${px / 2}" cy="${px / 2}" r="${px / 2}" fill="#fff"/></svg>`)
  return sharp(await sharp(square).resize(px, px).toBuffer())
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
}

fs.mkdirSync('public/brand', { recursive: true })
for (const px of [160, 320]) {
  await (await circle(px)).webp({ quality: 90, alphaQuality: 100 }).toFile(`public/brand/logo-${px}.webp`)
}
await (await circle(512)).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile('app/icon.png')

// Apple touch icon: the emblem at ~88% on a solid bone square.
const inner = Math.round(180 * 0.88)
await sharp({ create: { width: 180, height: 180, channels: 4, background: BONE } })
  .composite([{ input: await (await circle(inner)).png().toBuffer(), gravity: 'center' }])
  .png({ palette: true, quality: 90, compressionLevel: 9 })
  .toFile('app/apple-icon.png')

// favicon.ico: three PNG frames in an ICO container.
const sizes = [16, 32, 48]
const frames = await Promise.all(sizes.map(async (px) => (await circle(px)).png().toBuffer()))
const header = Buffer.alloc(6)
header.writeUInt16LE(1, 2) // type: icon
header.writeUInt16LE(sizes.length, 4)
let offset = 6 + 16 * sizes.length
const entries = frames.map((png, i) => {
  const e = Buffer.alloc(16)
  e.writeUInt8(sizes[i], 0)
  e.writeUInt8(sizes[i], 1)
  e.writeUInt16LE(1, 4) // colour planes
  e.writeUInt16LE(32, 6) // bits per pixel
  e.writeUInt32LE(png.length, 8)
  e.writeUInt32LE(offset, 12)
  offset += png.length
  return e
})
fs.writeFileSync('app/favicon.ico', Buffer.concat([header, ...entries, ...frames]))
console.log('Wrote public/brand/logo-{160,320}.webp, app/icon.png, app/apple-icon.png, app/favicon.ico')
