import type { Metadata } from "next";
import { food, pageMetadata, pages } from "@/content/property";
import HorizonBand from "../components/HorizonBand";

/**
 * BRIEF §6 wants per-head prices published; the owner's decision
 * (food.menu, content/property.ts) was not to publish them online, so this
 * page says that plainly rather than showing a placeholder number.
 */

export function generateMetadata(): Metadata {
  return pageMetadata(pages.food, "pages.food");
}

export default function FoodPage() {
  return (
    <main>
      <HorizonBand
        caption="KITCHEN — the guest kitchen, in use"
        image={{ src: "/temp-stock/kitchen.jpg", alt: "Stock photo standing in for the guest kitchen" }}
      />

      <header className="shell settle-next" style={{ paddingBlock: "3rem" }}>
        <h1
          className="type-display type-display-lg mt-3"
          style={{ fontSize: "var(--step-3)" }}
        >
          Food — cook your own, or order in
        </h1>
        <p className="measure mt-6">
          {food.kitchen.value}. {food.cook.value} — home-style Konkani food,
          with local seafood on request.
        </p>
      </header>

      <section className="section bg-bone-deep">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Pricing
          </h2>
          <p className="measure mt-6">
            Priced per dish, not a fixed package — seafood is{" "}
            {food.seafoodPricing.value.toLowerCase()}. Menu cards are handed
            to you at the villa; prices aren&rsquo;t published online yet.
          </p>
        </div>
      </section>

      <section className="section bg-bone">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            How it works
          </h2>
          <ul className="measure mt-10 space-y-4">
            <li className="pl-4" style={{ borderLeft: "2px solid var(--laterite)" }}>
              You settle with the cook directly, not the villa.
            </li>
            <li className="pl-4" style={{ borderLeft: "2px solid var(--laterite)" }}>
              Let the cook know a meal ahead when you can — happy to adjust
              if your plans change.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
