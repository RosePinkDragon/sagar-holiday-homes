import Image from "next/image";

/**
 * DESIGN.md "The signature: a continuous horizon" — the same band, at the
 * same 62% horizon height, opens all eight pages. Shared here so that stays
 * true by construction instead of by eight copies staying in sync by hand.
 *
 * No `band-horizon` guide line: that dashed rule is a styleguide-only build
 * aid and never ships on a real page.
 *
 * `image` is a stand-in only (see public/temp-stock/README.md) — swap it out
 * the moment real photography lands and drop the badge with it.
 */
export default function HorizonBand({
  caption,
  image,
}: {
  caption: string;
  image?: { src: string; alt: string };
}) {
  return (
    <div className="band settle">
      {image ? (
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
