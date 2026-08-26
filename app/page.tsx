import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  contact,
  facts,
  formatPhone,
  identity,
  pageMetadata,
  pages,
  pool,
  resolved,
} from "@/content/property";
import HorizonBand from "./components/HorizonBand";

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

const TEASER_SHOTS = [
  {
    href: "/pool-and-grounds",
    caption: "Pool — gazebo and fencing",
    image: { src: "/temp-stock/pool-gazebo-fence.jpg", alt: "Stock photo standing in for the pool, gazebo and fencing" },
  },
  {
    href: "/pool-and-grounds",
    caption: "The open ground",
    image: { src: "/temp-stock/open-ground.jpg", alt: "Stock photo standing in for the open ground" },
  },
  {
    href: "/pool-and-grounds",
    caption: "The orchard",
    image: { src: "/temp-stock/orchard.jpg", alt: "Stock photo standing in for the orchard" },
  },
  {
    href: "/villa",
    caption: "Bedroom, king bed",
    image: { src: "/temp-stock/bedroom.jpg", alt: "Stock photo standing in for a bedroom" },
  },
  {
    href: "/food",
    caption: "The guest kitchen",
    image: { src: "/temp-stock/kitchen.jpg", alt: "Stock photo standing in for the guest kitchen" },
  },
  {
    href: "/gallery",
    caption: "A group at the villa",
    image: { src: "/temp-stock/group-pool.jpg", alt: "Stock photo standing in for a group at the villa" },
  },
];

export default function HomePage() {
  const phone = resolved(contact.phone);

  return (
    <main>
      <HorizonBand
        caption="HERO — pool with orchard behind, golden hour"
        image={{ src: "/temp-stock/hero-pool-orchard.jpg", alt: "Stock photo standing in for the hero pool shot" }}
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
              <dt className="label">Sleeps</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                {facts.occupancy.max.value}
              </dd>
            </div>
            <div className="hairline p-6">
              <dt className="label">Pool</dt>
              <dd
                className="type-display mt-2"
                style={{ fontSize: "var(--step-1)" }}
              >
                Private, {pool.access.value.display}
              </dd>
            </div>
            <div className="hairline p-6 sm:col-span-2">
              <dt className="label">Ground</dt>
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
            A closer look
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 mt-10">
            {TEASER_SHOTS.map((shot) => (
              <Link
                key={shot.caption}
                href={shot.href}
                className={shot.image ? undefined : "photo-placeholder"}
                style={{
                  aspectRatio: "4 / 3",
                  position: "relative",
                  display: "block",
                  overflow: "hidden",
                  borderRadius: shot.image ? "var(--radius)" : undefined,
                }}
              >
                {shot.image ? (
                  <>
                    <Image
                      src={shot.image.src}
                      alt={shot.image.alt}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      style={{ objectFit: "cover" }}
                    />
                    <span className="stock-badge">Stock — temp</span>
                  </>
                ) : (
                  <p className="muted text-fine">{shot.caption}</p>
                )}
              </Link>
            ))}
          </div>
          <p className="mt-8">
            <Link href="/gallery" className="link">
              See the full gallery
            </Link>
          </p>
        </div>
      </section>

      <section className="section bg-bone">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            What guests say
          </h2>
          <div className="hairline mt-10 p-6">
            <p className="muted">
              No reviews yet — the villa is in its finishing stages.
              Testimonials will appear here once guests have stayed.
            </p>
          </div>
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
            <a href={`tel:${phone}`} className="footer-link text-fine">
              Call {formatPhone(phone)}
            </a>
            <Link href="/contact" className="btn btn-invert">
              Send enquiry
            </Link>
          </div>
        </div>
      ) : null}
    </main>
  );
}
