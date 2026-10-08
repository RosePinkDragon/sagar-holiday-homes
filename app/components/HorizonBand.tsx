import type { PhotoId } from "@/content/photos";
import Photo from "./Photo";

/**
 * DESIGN.md "The signature: a continuous horizon" — the same band, at the
 * same 62% horizon height, opens all eight pages. Shared here so that stays
 * true by construction instead of by eight copies staying in sync by hand.
 *
 * No `band-horizon` guide line: that dashed rule is a styleguide-only build
 * aid and never ships on a real page.
 *
 * `photo` is a real villa photo (content/photos.ts). Without one the band
 * shows the caption naming the shot required. No stock photos: nothing on
 * this site may be mistaken for the property.
 */
export default function HorizonBand({
  caption,
  photo,
}: {
  caption: string;
  photo?: PhotoId;
}) {
  return (
    <div className="band settle">
      {photo ? (
        <Photo id={photo} sizes="100vw" priority />
      ) : (
        <p className="band-caption">{caption}</p>
      )}
    </div>
  );
}
