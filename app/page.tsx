import type { Metadata } from "next";
import { ArrowRight, Car, Maximize2, MessageSquare, Phone, Users, Waves } from "lucide-react";
import Link from "next/link";
import {
  contact,
  describeLaunchOffer,
  describe,
  facts,
  faq,
  formatPhone,
  identity,
  pageMetadata,
  pages,
  policy,
  pool,
  resolved,
} from "@/content/property";
import type { PhotoId } from "@/content/photos";
import HorizonBand from "./components/HorizonBand";
import Photo from "./components/Photo";

/**
 * BRIEF §8, Home: hero + H1 (must contain "Dapoli" and "private pool") +
 * three-fact strip + positioning paragraph + the three differentiators +
 * photo teaser + testimonials (empty at launch, designed for now) + sticky
 * enquiry CTA. Built last (CLAUDE.md build order) because it summarises the
 * other seven pages rather than introducing new facts.
 */

export function generateMetadata(): Metadata {
  return pageMetadata(pages.home, "pages.home");
}

type TeaserShot = {
  href: string;
  caption: string;
  photo: PhotoId;
};

const TEASER_SHOTS: TeaserShot[] = [
  {
    href: "/pool-and-grounds",
    caption: "The pool terrace",
    photo: "pool-wide",
  },
  {
    href: "/gallery",
    caption: "From above, at dusk",
    photo: "aerial-dusk",
  },
  {
    href: "/pool-and-grounds",
    caption: "Seating beside the pool",
    photo: "pool-seating",
  },
  {
    href: "/villa",
    caption: "A bedroom",
    photo: "bedroom-blue",
  },
  {
    href: "/food",
    caption: "The kitchen",
    photo: "kitchen-counter",
  },
  {
    href: "/villa",
    caption: "The villa at night",
    photo: "exterior-night",
  },
];

export default function HomePage() {
  const phone = resolved(contact.phone);
  const launchOffer = describeLaunchOffer();

  return (
    <main>
      <HorizonBand
        caption="HERO — pool with orchard behind, golden hour"
        photo="exterior-sunset"
        facts={[
          { icon: Users, text: `Sleeps ${facts.occupancy.max.value}` },
          { icon: Waves, text: "Private pool" },
          { icon: Maximize2, text: `~${facts.ground.value.approxMetres}m open ground` },
        ]}
      />

      <header className="shell settle-next" style={{ paddingBlock: "3rem" }}>
        <h1
          className="type-display type-display-lg mt-3"
          style={{ fontSize: "var(--step-3)" }}
        >
          A private pool villa in Dapoli, built for big groups
        </h1>
        <p className="measure mt-6">{identity.positioning}</p>
      </header>

      <section className="section bg-bone-deep">
        <div className="shell">
          <dl className="grid gap-6 sm:grid-cols-2">
            <div className="hairline p-6">
              <dt className="label with-icon"><Users className="icon" aria-hidden="true" />Sleeps</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                {facts.occupancy.max.value}
              </dd>
            </div>
            <div className="hairline p-6">
              <dt className="label with-icon"><Waves className="icon" aria-hidden="true" />Pool</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                Private, {pool.access.value.display}
              </dd>
            </div>
            <div className="hairline p-6 sm:col-span-2">
              <dt className="label with-icon"><Maximize2 className="icon" aria-hidden="true" />Ground</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                ~{facts.ground.value.approxMetres}m open
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section bg-bone">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            What makes it different
          </h2>
          <div className="grid gap-8 md:grid-cols-2 mt-10">
            {identity.differentiators.map((d) => (
              <div key={d.title} className="hairline p-6">
                <h3
                  className="type-display"
                  style={{ fontSize: "var(--step-1)" }}
                >
                  {d.title}
                </h3>
                <p className="measure mt-3">{d.body}</p>
              </div>
            ))}
          </div>
          <p className="measure mt-8">{identity.supporting}</p>
        </div>
      </section>

      <section className="section bg-bone-deep">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Who this villa is for
          </h2>
          <ul className="measure mt-10 space-y-4">
            {identity.segments.map((segment) => (
              <li
                key={segment}
                className="pl-4"
                style={{ borderLeft: "2px solid var(--laterite)" }}
              >
                {segment}
              </li>
            ))}
          </ul>
          <p className="measure mt-8">
            The pull is the same for all three:{" "}
            <Link href="/pool-and-grounds" className="link">
              {describe.ground()}
            </Link>
            , a private pool that&rsquo;s never shared with another
            booking, and enough bedrooms and beds for{" "}
            {facts.occupancy.max.value} people under one roof.
          </p>
        </div>
      </section>

      <section className="section bg-bone">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            How booking works
          </h2>
          <p className="measure mt-6">{policy.confirmation.value.line}</p>
          <p className="measure mt-4">
            Cancel {policy.cancellation.value[0].noticeBeforeCheckIn} out and
            you get a {policy.cancellation.value[0].refundPercent}% refund,
            less a small processing fee. Closer to your dates, partial
            refunds apply on a sliding scale — see the{" "}
            <Link href="/tariff" className="link">
              full rate card and cancellation policy
            </Link>
            , including weekday and weekend rates.
          </p>
        </div>
      </section>

      <section className="section bg-bone-deep">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Getting here from Mumbai and Pune
          </h2>
          <dl className="grid gap-6 sm:grid-cols-2 mt-10">
            {facts.distances.driveTimes.value.map((drive) => (
              <div key={drive.from} className="hairline p-6">
                <dt className="label with-icon"><Car className="icon" aria-hidden="true" />{drive.from}</dt>
                <dd
                  className="type-display mt-2"
                  style={{ fontSize: "var(--step-1)" }}
                >
                  {drive.duration}
                </dd>
              </div>
            ))}
          </dl>
          <p className="measure mt-6">
            {facts.distances.routeNote.value}. Full drive-time and directions
            on the{" "}
            <Link href="/location" className="link">
              location page
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="section bg-bone">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            A closer look
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 mt-10">
            {TEASER_SHOTS.map((shot) => (
              <Link
                key={shot.caption}
                href={shot.href}
                className="zoom-frame"
                style={{
                  aspectRatio: "4 / 3",
                  position: "relative",
                  display: "block",
                  overflow: "hidden",
                  borderRadius: "var(--radius)",
                }}
              >
                <Photo id={shot.photo} sizes="(min-width: 640px) 50vw, 100vw" />
              </Link>
            ))}
          </div>
          <p className="mt-8">
            <Link href="/gallery" className="link">
              <span className="with-icon">
                See the full gallery
                <ArrowRight className="icon arrow" aria-hidden="true" />
              </span>
            </Link>
          </p>
        </div>
      </section>

      <section className="section bg-bone-deep">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            What guests say
          </h2>
          <div className="hairline mt-10 p-6">
            <p className="measure">
              No reviews yet — the villa is in its finishing stages.
              {launchOffer ? (
                <>
                  {" "}
                  We&rsquo;re taking bookings for our first season at{" "}
                  {launchOffer}.
                </>
              ) : (
                " Testimonials will appear here once guests have stayed."
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-bone">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Straight answers
          </h2>
          <div className="grid gap-8 mt-10">
            {faq.slice(0, 5).map((item) => (
              <div key={item.question} className="hairline p-6">
                <h3
                  className="type-display"
                  style={{ fontSize: "var(--step-0)" }}
                >
                  {item.question}
                </h3>
                <p className="measure mt-3">{item.answer}</p>
              </div>
            ))}
          </div>
          <p className="mt-8">
            <Link href="/faq" className="link">
              <span className="with-icon">
                See all FAQs
                <ArrowRight className="icon arrow" aria-hidden="true" />
              </span>
            </Link>
          </p>
        </div>
      </section>

      {phone ? (
        <div
          className="bg-canopy"
          style={{ position: "sticky", bottom: 0, zIndex: 30 }}
        >
          <div
            className="shell flex flex-wrap items-center justify-between gap-4"
            style={{ paddingBlock: "0.75rem" }}
          >
            <a href={`tel:${phone}`} className="footer-link text-fine with-icon">
              <Phone className="icon" aria-hidden="true" />
              Call {formatPhone(phone)}
            </a>
            <Link href="/contact" className="btn btn-invert pulse-ring">
              <MessageSquare className="icon" aria-hidden="true" />
              Send enquiry
            </Link>
          </div>
        </div>
      ) : null}
    </main>
  );
}
