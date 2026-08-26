/**
 * DESIGN.md "The signature: a continuous horizon" — the same band, at the
 * same 62% horizon height, opens all eight pages. Shared here so that stays
 * true by construction instead of by eight copies staying in sync by hand.
 *
 * No `band-horizon` guide line: that dashed rule is a styleguide-only build
 * aid and never ships on a real page.
 */
export default function HorizonBand({ caption }: { caption: string }) {
  return (
    <div className="band settle">
      <p className="band-caption">{caption}</p>
    </div>
  );
}
