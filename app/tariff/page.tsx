import type { Metadata } from "next";
import Link from "next/link";
import {
  facts,
  formatInr,
  gstNote,
  pages,
  policy,
  requireFact,
  resolved,
  tariff,
} from "@/content/property";
import HorizonBand from "../components/HorizonBand";

/**
 * BRIEF §4 hard-gates all site copy on the GST decision — resolved
 * (tariff.gst.displayTreatment) — and CLAUDE.md rule 7: no rate appears
 * without gstNote() beside it. tariff.rateCard and policy.securityDeposit
 * are `assumed`, not `confirmed` (content/property.ts) — this page labels
 * them "Indicative" per the module's own instruction, so the flag clears
 * itself automatically the day someone promotes them to `confirmed`.
 */

export function generateMetadata(): Metadata {
  return {
    title: requireFact(pages.tariff.title, "pages.tariff.title"),
    description: requireFact(pages.tariff.description, "pages.tariff.description"),
  };
}

function Indicative() {
  return <span className="label"> · indicative</span>;
}

export default function TariffPage() {
  const rateCard = requireFact(tariff.rateCard, "tariff.rateCard");
  const rateCardIndicative = tariff.rateCard.status === "assumed";

  const launchOffer = resolved(tariff.launchOffer);
  const launchOfferIndicative = tariff.launchOffer.status === "assumed";

  const deposit = resolved(policy.securityDeposit);
  const depositIndicative = policy.securityDeposit.status === "assumed";

  return (
    <main>
      <HorizonBand caption="POOL — pool at night, lit" />

      <header className="shell settle-next" style={{ paddingBlock: "3rem" }}>
        <h1
          className="type-display type-display-lg mt-3"
          style={{ fontSize: "var(--step-3)" }}
        >
          Tariff &amp; booking
        </h1>
        <p className="measure mt-6">
          Whole-villa buyout only. All rates below are{" "}
          {gstNote().charAt(0).toLowerCase() + gstNote().slice(1)}.
        </p>
      </header>

      <section className="section bg-bone-deep">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Rate card
            {rateCardIndicative ? <Indicative /> : null}
          </h2>
          <dl className="grid gap-6 sm:grid-cols-2 mt-10">
            <div className="hairline p-6">
              <dt className="label">Weekday · {tariff.periods.value.weekday}</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                {formatInr(rateCard.weekday)}
              </dd>
            </div>
            <div className="hairline p-6">
              <dt className="label">Weekend · {tariff.periods.value.weekend}</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                {formatInr(rateCard.weekend)}
              </dd>
            </div>
            <div className="hairline p-6 sm:col-span-2">
              <dt className="label">Peak dates</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                {formatInr(rateCard.peak)}
              </dd>
              <p className="muted mt-3 text-fine">
                {tariff.peakDates.value.join(" · ")}
              </p>
            </div>
          </dl>
          <p className="measure mt-6 text-fine">
            Extra guest: {formatInr(tariff.extraGuest.value)} per night above{" "}
            {facts.occupancy.base.value} guests, up to the maximum of{" "}
            {facts.occupancy.max.value}.
          </p>
        </div>
      </section>

      {launchOffer ? (
        <section className="section bg-bone">
          <div className="shell">
            <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
              Launch offer
              {launchOfferIndicative ? <Indicative /> : null}
            </h2>
            <p className="measure mt-6">
              {launchOffer.discountPercent.from}–
              {launchOffer.discountPercent.to}% off the published rate for
              the first {launchOffer.durationMonths} months,{" "}
              {launchOffer.condition.charAt(0).toLowerCase() +
                launchOffer.condition.slice(1)}
              .
            </p>
          </div>
        </section>
      ) : null}

      <section className="section bg-bone-deep">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            What&rsquo;s included
          </h2>
          <p className="measure mt-6">
            The rate covers the whole villa — private pool, ground, orchard,
            parking, Wi-Fi and generator backup. Food is separate: the
            kitchen is yours to use, or order from our local cook. See the{" "}
            <Link href="/food" className="link">
              food page
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="section bg-bone">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Booking &amp; cancellation
          </h2>
          <p className="measure mt-6">{policy.confirmation.value.line}</p>

          <div className="hairline mt-8 overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="label p-4 text-left">Notice before check-in</th>
                  <th className="label p-4 text-left">Refund</th>
                </tr>
              </thead>
              <tbody>
                {policy.cancellation.value.map((tier) => (
                  <tr key={tier.noticeBeforeCheckIn} className="rule">
                    <td className="p-4">{tier.noticeBeforeCheckIn}</td>
                    <td className="p-4">
                      {tier.refundPercent}%
                      {tier.processingFeeInr
                        ? `, less ${formatInr(tier.processingFeeInr)} processing`
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="measure mt-6">{policy.dateTransfer.value.line}</p>
        </div>
      </section>

      <section className="section bg-bone-deep">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Stay details
          </h2>
          <dl className="grid gap-6 sm:grid-cols-2 mt-10">
            <div className="hairline p-6">
              <dt className="label">Check-in</dt>
              <dd className="mt-2">{policy.stay.checkIn.value.display}</dd>
            </div>
            <div className="hairline p-6">
              <dt className="label">Check-out</dt>
              <dd className="mt-2">{policy.stay.checkOut.value.display}</dd>
            </div>
            <div className="hairline p-6">
              <dt className="label">Minimum stay</dt>
              <dd className="mt-2">
                {policy.stay.minimumNights.value.standard} night, {policy.stay.minimumNights.value.peak} on peak dates
              </dd>
            </div>
            <div className="hairline p-6">
              <dt className="label">Single-night Saturday</dt>
              <dd className="mt-2">
                +{policy.stay.singleNightSaturdaySurchargePercent.value}%
              </dd>
            </div>
          </dl>

          <p className="measure mt-8">
            {policy.stay.flexibleTimings.value.condition} Early check-in from{" "}
            {policy.stay.flexibleTimings.value.earlyCheckIn}, late check-out
            until {policy.stay.flexibleTimings.value.lateCheckOut}.
          </p>

          <p className="measure mt-6">{policy.stay.quietHours.value.line}</p>

          {deposit ? (
            <p className="measure mt-6">
              Refundable security deposit {formatInr(deposit.amountInr)}
              {depositIndicative ? <Indicative /> : null}, returned within{" "}
              {deposit.refundWithinHours} hours of check-out.
            </p>
          ) : null}

          <ul className="measure mt-6 space-y-4">
            {policy.otherTerms.value.map((term) => (
              <li
                key={term}
                className="pl-4"
                style={{ borderLeft: "2px solid var(--laterite)" }}
              >
                {term}
              </li>
            ))}
          </ul>

          <p className="measure mt-6 text-fine">{policy.forceMajeure.value}</p>
        </div>
      </section>
    </main>
  );
}
