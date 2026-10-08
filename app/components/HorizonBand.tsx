import Image from "next/image";
import type { LucideIcon } from "lucide-react";

export type BandFact = { icon: LucideIcon; text: string };

/**
 * DESIGN.md "The signature: a continuous horizon" — the same band, at the
 * same 62% horizon height, opens all eight pages. Shared here so that stays
 * true by construction instead of by eight copies staying in sync by hand.
 *
 * No `band-horizon` guide line: that dashed rule is a styleguide-only build
 * aid and never ships on a real page.
 *
 * `facts` are short plaques along the bottom edge of the band: a few of the
 * page's key numbers, so the photo works as more than a picture. Callers build
 * the strings from content/property.ts (CLAUDE.md rule 1) — nothing is typed
 * here. The page title still sits BELOW the band; plaques are solid, never a
 * scrim, so the sky is never greyed.
 *
 * `image` is a stand-in only (see public/temp-stock/README.md) — swap it out
 * the moment real photography lands and drop the badge with it.
 */
export default function HorizonBand({
  caption,
  image,
  facts,
}: {
  caption: string;
  image?: { src: string; alt: string };
  facts?: BandFact[];
}) {
  return (
    <div className="band-wrap">
    <div className="band settle">
      {image ? (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            priority
            style={{ objectFit: "cover" }}
          />
          <span className="stock-badge">Stock photo — temp</span>
        </>
      ) : (
        <p className="band-caption">{caption}</p>
      )}
    </div>

      {facts && facts.length > 0 ? (
        <ul className="band-facts">
          {facts.map(({ icon: Icon, text }, i) => (
            <li
              key={text}
              className="band-fact"
              style={{ "--i": i } as React.CSSProperties}
            >
              <Icon className="icon" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
