// Find duplicate and near-duplicate photos in a folder tree.
//
//   node scripts/find-duplicates.mjs <folder> [--move] [--exact 95] [--similar 85]
//
// Report only by default. Photos scoring >= --exact are treated as the same shot:
// the largest file is kept, the rest are listed (with --move they are MOVED to
// <folder>/_duplicates, never deleted). Photos between --similar and --exact are
// listed as "similar" (burst frames, nearby angles) and are never moved.

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const args = process.argv.slice(2)
const flag = (n, d) => { const i = args.indexOf(n); return i === -1 ? d : Number(args[i + 1]) }
const folder = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] === '--exact' || args[i - 1] === '--similar'))
if (!folder) { console.error('Usage: node scripts/find-duplicates.mjs <folder> [--move] [--exact 95] [--similar 85]'); process.exit(1) }
const EXACT = flag('--exact', 95)
const SIMILAR = flag('--similar', 85)
const MOVE = args.includes('--move')

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name)
  if (e.isDirectory()) return e.name === '_duplicates' ? [] : walk(p)
  return /\.(jpe?g|png|webp|tiff?)$/i.test(e.name) ? [p] : []
})

async function fingerprint(file) {
  const base = sharp(file, { failOn: 'none' }).rotate().greyscale()
  const d = await base.clone().resize(17, 16, { fit: 'fill' }).raw().toBuffer()
  const bits = new Uint8Array(256)
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) bits[y * 16 + x] = d[y * 17 + x] > d[y * 17 + x + 1] ? 1 : 0
  const t = await base.clone().resize(24, 24, { fit: 'fill' }).raw().toBuffer()
  const mean = t.reduce((a, v) => a + v, 0) / t.length
  const c = Float32Array.from(t, (v) => v - mean)
  const norm = Math.hypot(...c) || 1
  return { bits, thumb: c.map((v) => v / norm) }
}

function score(a, b) {
  let diff = 0
  for (let i = 0; i < 256; i++) if (a.bits[i] !== b.bits[i]) diff++
  let dot = 0
  for (let i = 0; i < a.thumb.length; i++) dot += a.thumb[i] * b.thumb[i]
  return ((1 - diff / 256) * 100 + Math.max(0, dot) * 100) / 2
}

const files = walk(folder)
console.log(`Fingerprinting ${files.length} photos...`)
const items = []
for (const f of files) items.push({ file: f, size: fs.statSync(f).size, fp: await fingerprint(f) })

// Union-find over "exact" pairs
const parent = items.map((_, i) => i)
const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])))
const similar = []
for (let i = 0; i < items.length; i++)
  for (let j = i + 1; j < items.length; j++) {
    const s = score(items[i].fp, items[j].fp)
    if (s >= EXACT) parent[find(j)] = find(i)
    else if (s >= SIMILAR) similar.push({ a: items[i].file, b: items[j].file, s })
  }

const groups = new Map()
items.forEach((it, i) => { const r = find(i); groups.set(r, [...(groups.get(r) || []), it]) })
const dupGroups = [...groups.values()].filter((g) => g.length > 1)

const rel = (f) => path.relative(folder, f)
console.log(`\nDUPLICATE GROUPS (>= ${EXACT}%): ${dupGroups.length}`)
let extra = 0
for (const g of dupGroups) {
  g.sort((a, b) => b.size - a.size)
  console.log(`  keep   ${rel(g[0].file)}  (${(g[0].size / 1048576).toFixed(1)} MB)`)
  for (const d of g.slice(1)) {
    extra++
    console.log(`  extra  ${rel(d.file)}  (${(d.size / 1048576).toFixed(1)} MB)`)
    if (MOVE) {
      const dest = path.join(folder, '_duplicates')
      fs.mkdirSync(dest, { recursive: true })
      fs.renameSync(d.file, path.join(dest, path.basename(d.file)))
    }
  }
}

console.log(`\nSIMILAR but not identical (${SIMILAR}-${EXACT}%): ${similar.length} pairs (not moved)`)
for (const p of similar.sort((a, b) => b.s - a.s)) console.log(`  ${p.s.toFixed(0)}%  ${rel(p.a)}  ~  ${rel(p.b)}`)

console.log(`\n${extra} extra copies ${MOVE ? 'moved to _duplicates' : 'found (report only; add --move to move them)'}`)
