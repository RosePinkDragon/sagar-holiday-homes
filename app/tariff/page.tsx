import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CalendarHeart, LogIn, LogOut, Moon, Star, CalendarX } from "lucide-react";
import {
  describeLaunchOffer,
  describeWorkedExample,
  facts,
  formatInr,
  gstNote,
  type Fact,
  type Rate,
  type RateCard,
  pageMetadata,
  pages,
  policy,
  requireFact,
  resolved,
  tariff,
  tariffOfferJsonLd,
} from "@/content/property";
import HorizonBand from "../components/HorizonBand";

/**
 * BRIEF §4 hard-gates all site copy on the GST decision — resolved
 * (tariff.gst.displayTreatment) — and CLAUDE.md rule 7: no rate appears
 * without gstNote() beside it. Any fact still `assumed` rather than
 * `confirmed` (content/property.ts) is labelled "Indicative", so the flag
 * clears itself automatically the day someone promotes it to `confirmed`.
 */

export function generateMetadata(): Metadata {
  return pageMetadata(pages.tariff, "pages.tariff");
}

function Indicative() {
  return <span className="label"> · indicative</span>;
}

function RateValue({ rate }: { rate: Rate }) {
  return (
    <>
      <s className="muted" style={{ fontSize: "var(--step-0)" }}>
        <span className="sr-only">Was </span>
        {formatInr(rate.published)}
      </s>{" "}
      <span className="sr-only">now </span>
      {formatInr(rate.offer)}
    </>
  );
}

export default function TariffPage() {
  const rateCardFact: Fact<RateCard> = tariff.rateCard;
  const rateCard = requireFact(rateCardFact, "tariff.rateCard");
  const rateCardIndicative = rateCardFact.status !== "confirmed";

  const launchOffer = describeLaunchOffer();

  const deposit = resolved(policy.securityDeposit);
  const depositIndicative = policy.securityDeposit.status === "assumed";

  const worked = describeWorkedExample();
  const offerJsonLd = tariffOfferJsonLd();

  return (
    <main>
      {offerJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(offerJsonLd) }}
        />
      ) : null}

      <HorizonBand
        caption="POOL — pool at night, lit"
        photo="pool-loungers"
      />

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
              <dt className="label with-icon"><CalendarDays className="icon" aria-hidden="true" />Weekday · {tariff.periods.value.weekday}</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                <RateValue rate={rateCard.weekday} />
              </dd>
            </div>
            <div className="hairline p-6">
              <dt className="label with-icon"><CalendarHeart className="icon" aria-hidden="true" />Weekend · {tariff.periods.value.weekend}</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                <RateValue rate={rateCard.weekend} />
              </dd>
            </div>
            <div className="hairline p-6 sm:col-span-2">
              <dt className="label with-icon"><Star className="icon" aria-hidden="true" />Peak dates</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                <RateValue rate={rateCard.peak} />
              </dd>
              <p className="muted mt-3 text-fine">
                {tariff.peakDates.value.join(" · ")}
              </p>
            </div>
          </dl>
          <p className="measure mt-6 text-fine">
            Extra guest: {formatInr(tariff.extraGuest.value)} per night above{" "}
            {facts.occupancy.base.value} guests, up to the maximum of{" "}
            {facts.occupancy.max.value}. See the{" "}
            <Link href="/villa" className="link">
              villa page
            </Link>{" "}
            for the room and bed breakdown behind that number.
          </p>

          {worked ? (
            <div className="hairline mt-8 p-6">
              <p className="label">
                Worked example
                {rateCardIndicative ? <Indicative /> : null}
              </p>
              <p className="measure mt-3">
                A group of {worked.guests}, {worked.nights} weekend nights:
              </p>
              <p className="measure mt-2 text-fine">
                {formatInr(worked.nightlyRate)} × {worked.nights} nights ={" "}
                {formatInr(worked.nightsTotal)}
                <br />
                Extra guests ({worked.extraGuests} above{" "}
                {facts.occupancy.base.value}) — {formatInr(tariff.extraGuest.value)} ×{" "}
                {worked.extraGuests} × {worked.nights} = {formatInr(worked.extrasTotal)}
              </p>
              <p className="type-display mt-4" style={{ fontSize: "var(--step-1)" }}>
                Total {formatInr(worked.grandTotal)}
              </p>
              <p className="muted mt-2 text-fine">
                {gstNote()}. That&rsquo;s {formatInr(worked.perPersonPerNight)} per
                person, per night.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {launchOffer ? (
        <section className="section bg-bone">
          <div className="shell">
            <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
              Launch offer
            </h2>
            <p className="measure mt-6">
              {launchOffer}, already included in the rates above.
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
              <dt className="label with-icon"><LogIn className="icon" aria-hidden="true" />Check-in</dt>
              <dd className="mt-2">{policy.stay.checkIn.value.display}</dd>
            </div>
            <div className="hairline p-6">
              <dt className="label with-icon"><LogOut className="icon" aria-hidden="true" />Check-out</dt>
              <dd className="mt-2">{policy.stay.checkOut.value.display}</dd>
            </div>
            <div className="hairline p-6">
              <dt className="label with-icon"><Moon className="icon" aria-hidden="true" />Minimum stay</dt>
              <dd className="mt-2">
                {policy.stay.minimumNights.value.standard} night, {policy.stay.minimumNights.value.peak} on peak dates
              </dd>
            </div>
            <div className="hairline p-6">
              <dt className="label with-icon"><CalendarX className="icon" aria-hidden="true" />Single-night Saturday</dt>
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
                {term.includes("pool safety notice") ? (
                  <>
                    {term.split("pool safety notice")[0]}
                    <Link href="/pool-and-grounds" className="link">
                      pool safety notice
                    </Link>
                    {term.split("pool safety notice")[1]}
                  </>
                ) : (
                  term
                )}
              </li>
            ))}
          </ul>

          <p className="measure mt-6 text-fine">{policy.forceMajeure.value}</p>
        </div>
      </section>
    </main>
  );
}
