import type { Metadata } from "next";
import { ArrowDownToLine, Clock, Ruler, ShieldCheck, Waves } from "lucide-react";
import {
  describe,
  describePoolDepth,
  describePoolSize,
  facts,
  pageMetadata,
  pages,
  pool,
} from "@/content/property";
import HorizonBand from "../components/HorizonBand";

/**
 * BRIEF §8, Pool & Grounds: dimensions and depth stated plainly, safety
 * disclosure verbatim from BRIEF §3 (CLAUDE.md rule 6 — never paraphrased).
 */

export function generateMetadata(): Metadata {
  return pageMetadata(pages.poolAndGrounds, "pages.poolAndGrounds");
}

export default function PoolAndGroundsPage() {
  return (
    <main>
      <HorizonBand
        caption="POOL — wide shot showing the gazebo and fencing, golden hour"
        photo="pool-wide"
        facts={[
          { icon: Ruler, text: describePoolSize() },
          { icon: ArrowDownToLine, text: `${pool.depth.value.feet} ft deep` },
          { icon: Waves, text: "Private pool" },
        ]}
      />

      <header className="shell settle-next" style={{ paddingBlock: "3rem" }}>
        <h1
          className="type-display type-display-lg mt-3"
          style={{ fontSize: "var(--step-3)" }}
        >
          The pool, the ground, the orchard
        </h1>
        <p className="measure mt-6">
          {pool.summary.value}. {describe.ground()}. {describe.orchard()}.
        </p>
      </header>

      <section className="section bg-bone-deep">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            The pool
          </h2>
          <span className="ripple" aria-hidden="true" />
          {/* DESIGN.md Layout: two columns max, never more — three stats wrap 2+1. */}
          <dl className="grid gap-6 sm:grid-cols-2 mt-10">
            <div className="hairline p-6">
              <dt className="label with-icon"><Ruler className="icon" aria-hidden="true" />Size</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                {describePoolSize()}
              </dd>
              <p className="muted mt-2 text-fine">
                18 × 17 feet — room for a dozen people without taking turns.
              </p>
            </div>
            <div className="hairline p-6">
              <dt className="label with-icon"><ArrowDownToLine className="icon" aria-hidden="true" />Depth</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                {describePoolDepth()}
              </dd>
            </div>
            <div className="hairline p-6">
              <dt className="label with-icon"><Clock className="icon" aria-hidden="true" />Open</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                {pool.access.value.display}
              </dd>
            </div>
          </dl>

          <div className="hairline mt-10 p-6">
            <p className="label with-icon"><ShieldCheck className="icon" aria-hidden="true" />Pool safety</p>
            <p className="measure mt-3">{pool.disclosure.value}</p>
          </div>
        </div>
      </section>

      <section className="section bg-bone">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Ground
          </h2>
          <p className="measure mt-6">{describe.ground()}.</p>
        </div>
      </section>

      <section className="section bg-bone-deep">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Orchard
          </h2>
          <p className="measure mt-6">
            {describe.orchard()} — {facts.orchard.value.season}.
          </p>
        </div>
      </section>
    </main>
  );
}
