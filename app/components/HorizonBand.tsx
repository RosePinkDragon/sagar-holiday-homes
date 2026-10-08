import Image from "next/image";
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
 * `photo` is a real villa photo (content/photos.ts). `image` is a stock
 * stand-in only (see public/temp-stock/README.md) for shots we don't have yet
 * — drop it, and its badge, as soon as the real photo exists.
 */
export default function HorizonBand({
  caption,
  image,
  photo,
}: {
  caption: string;
  image?: { src: string; alt: string };
  photo?: PhotoId;
}) {
  return (
    <div className="band settle">
      {photo ? (
        <Photo id={photo} sizes="100vw" priority />
      ) : image ? (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
          <span className="stock-badge">Stock photo — temp</span>
        </>
      ) : (
        <p className="band-caption">{caption}</p>
      )}
    </div>
  );
}
