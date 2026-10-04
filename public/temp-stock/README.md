# Temporary stock photos — NOT the actual property

Everything in this folder is a free-license stock photo (Pexels) used to
preview page layout and visual weight before the real photography shoot
happens. **None of these are photos of the actual villa.**

- Do not deploy this branch to production or share the preview link outside
  the team — guests must never see stock photos presented as this property.
- Every image is marked with a "Stock photo — temp" badge in the UI
  (`.stock-badge` in `app/globals.css`) so it can't be mistaken for real
  content, even in a screenshot.
- See [BRIEF.md §9](../../BRIEF.md) for the actual photography shot list and
  [the shot list summary] shared with the photographer.

## When real photos land

Delete this folder and the `.stock-badge` styling, and replace each
`image={{ src: "/temp-stock/...", ... }}` prop (in `HorizonBand` call sites,
`app/page.tsx`'s `TEASER_SHOTS`, and `app/gallery/page.tsx`'s `CATEGORIES`)
with the delivered photo, with real `alt` text per CLAUDE.md's SEO
requirements.

## Sources (Pexels License — free for commercial use, no attribution required)

| File | Pexels photo |
|---|---|
| hero-pool-orchard.jpg | pexels.com/photo/29453302 |
| pool-gazebo-fence.jpg | pexels.com/photo/8134849 |
| pool-night.jpg | pexels.com/photo/7974837 |
| open-ground.jpg | pexels.com/photo/280222 |
| orchard.jpg | pexels.com/photo/8967399 |
| villa-exterior-golden.jpg | pexels.com/photo/34277704 |
| front-house-daytime.jpg | pexels.com/photo/19168388 |
| bedroom.jpg | pexels.com/photo/2029722 |
| kitchen.jpg | pexels.com/photo/6035312 |
| group-pool.jpg | pexels.com/photo/38787651 |
| drone.jpg | pexels.com/photo/12464355 |
