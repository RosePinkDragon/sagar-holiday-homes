import type { Metadata } from "next";
import { amenities, describe, facts, pageMetadata, pages } from "@/content/property";
import HorizonBand from "../components/HorizonBand";

/**
 * BRIEF §8, The Villa: "Rooms, occupancy, amenities, floor logic." Floor
 * logic has no source fact (see facts.floorLayout in content/property.ts) so
 * this page does not claim one — CLAUDE.md rule 2, never invent property
 * facts.
 */

export function generateMetadata(): Metadata {
  return pageMetadata(pages.villa, "pages.villa");
}

export default function VillaPage() {
  return (
    <main>
      <HorizonBand
        caption="BEDROOM — king bed made, lights on, golden hour"
        image={{ src: "/temp-stock/bedroom.jpg", alt: "Stock photo standing in for a bedroom" }}
      />

      <header className="shell settle-next" style={{ paddingBlock: "3rem" }}>
        <h1
          className="type-display type-display-lg mt-3"
          style={{ fontSize: "var(--step-3)" }}
        >
          The Villa — a 3BHK in Dapoli, yours alone
        </h1>
        <p className="measure mt-6">
          {facts.saleModel.value} {describe.occupancy()} — rates are built
          around {facts.occupancy.base.value} guests, {facts.occupancy.comfortable.value} is
          the comfortable number to plan a group around, and {facts.occupancy.max.value}{" "}
          is the most the villa takes.
        </p>
      </header>

      <section className="section bg-bone-deep">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Bedrooms
          </h2>
          <p className="measure mt-6">
            {facts.bedrooms.value} bedrooms. {facts.airConditioning.value} are
            air-conditioned. {describe.beds()}.
          </p>
        </div>
      </section>

      <section className="section bg-bone">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Amenities
          </h2>
          <ul className="measure mt-10 space-y-4">
            {amenities.map((item) => (
              <li
                key={item}
                className="pl-4"
                style={{ borderLeft: "2px solid var(--laterite)" }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
