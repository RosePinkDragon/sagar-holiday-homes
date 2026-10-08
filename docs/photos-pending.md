# Photos still needed

The site uses real photos only. No stock images ship and no "photo to come"
blocks show on any page: for the client preview, the three empty gallery
slots were filled with extra real photos of the villa (below). The shots we
actually want are still missing.

## Shots not yet taken

| # | Shot | Was meant for | Stand-in used for now |
|---|------|---------------|-----------------------|
| 1 | The open ground, wide enough to show the full 150 m | Gallery, "Ground & orchard" | Gallery section renamed "From above"; aerial photo of the fields around the villa (`aerial-fields`) |
| 2 | The orchard | Gallery, "Ground & orchard" | None; tile removed |
| 3 | A group actually using the villa (not an empty house) | Gallery, "Life at the villa" | None; section removed. Two extra villa photos (`exterior-night-lamp`, `bedroom-blue-dresser`) were added to "The villa" |

When these are taken: add them to `content/photos.ts`, restore the gallery
sections (`Ground & orchard`, `Life at the villa`), and drop the stand-ins
that no longer fit. The gallery still supports a labelled placeholder tile
(`pending: true` on a shot) if one is needed again.

The Location page map block is a map, not a photo slot.

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
4. Add it to a shot list in `app/gallery/page.tsx` (`photo: "<id>"`).
