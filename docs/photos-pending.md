# Photos still needed

The site uses real photos only. No stock images ship. Where a shot does not
exist yet, the page shows a labelled placeholder block ("Photo to come: ...").

## Shots not yet taken

| # | Shot | Where it appears | Notes |
|---|------|------------------|-------|
| 1 | The open ground, wide enough to show the full 150 m | Gallery > Ground & orchard | Landscape, ideally daylight. Supports the "150m cricket ground" claim. |
| 2 | The orchard | Gallery > Ground & orchard | Daylight; the mango trees should be identifiable. |
| 3 | A group actually using the villa (not an empty house) | Gallery > Life at the villa | Needs permission from the people shown. |

The Location page map block is a map placeholder, not a photo slot.

## Facts to confirm against the photos (copy not changed)

1. **Pool.** Copy says "private pool under a gazebo, in a fenced enclosure".
   The photos show a small tiled pool on a covered terrace with a steel
   railing under a metal-sheet roof. Is the covered terrace the "gazebo"?
2. **Kitchen.** Copy says "full kitchen". The photos show a counter with a
   sink, blue cabinets and a fridge, in the same room as the sofa set.
3. **Bed sizes.** Copy says three king beds. Photo captions say "a bedroom"
   because sizes cannot be confirmed from the images.

## Photos not used on purpose

AC and TV close-ups (`_DSC3368-3370`, `IMG_0522`, `IMG_0523`), the approach
road (`IMG_0496`), and frames that duplicate a better shot. Originals stay in
`raw photos/` (not committed).

## How to add a photo

1. Put the original in `raw photos/`.
2. `node scripts/optimize-images.mjs "raw photos" public/photos --only <file>.jpg`
3. Add an entry to `content/photos.ts` (file stem, width/height from
   `public/photos/manifest.json`, factual alt text).
4. Replace the `pending: true` shot in `app/gallery/page.tsx` with
   `photo: "<id>"`, and delete its line from this table.
