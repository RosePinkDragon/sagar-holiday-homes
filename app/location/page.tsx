import type { Metadata } from "next";
import {
  contact,
  describe,
  facts,
  identity,
  nearbyPlaces,
  pageMetadata,
  pages,
  resolved,
} from "@/content/property";
import HorizonBand from "../components/HorizonBand";

/**
 * BRIEF §8, Location: "Embedded map pin at the actual gate ... this page is
 * where local SEO is won." Every number here comes from content/property.ts
 * (CLAUDE.md rule 1) — nothing is retyped.
 */

export function generateMetadata(): Metadata {
  return pageMetadata(pages.location, "pages.location");
}

export default function LocationPage() {
  const geo = resolved(contact.geo);
  const address = contact.address.value;

  const directionsHref = geo
    ? `https://www.google.com/maps/dir/?api=1&destination=${geo.lat},${geo.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        address.lines.join(", ")
      )}`;

  return (
    <main>
      <HorizonBand
        caption="VILLA APPROACH — full villa from the entrance, golden hour"
        image={{ src: "/temp-stock/villa-exterior-golden.jpg", alt: "Stock photo standing in for the villa entrance approach" }}
      />

      <header className="shell settle-next" style={{ paddingBlock: "3rem" }}>
        <h1
          className="type-display type-display-lg mt-3"
          style={{ fontSize: "var(--step-3)" }}
        >
          Saldure, Dapoli — five minutes from the beach
        </h1>
        <p className="measure mt-6">
          Sagar Holiday Homes sits in {address.village} village,{" "}
          {address.taluka} taluka, {address.district} district,{" "}
          {address.state} — inland, in the orchard, not on the seafront.
          Saldure beach is {describe.beachDistance()} away, and the wider
          Dapoli coastline is a short drive further along.
        </p>
      </header>

      <section className="section bg-bone-deep">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Getting here
          </h2>
          <dl className="grid gap-6 sm:grid-cols-2 mt-10">
            {facts.distances.driveTimes.value.map((drive) => (
              <div key={drive.from} className="hairline p-6">
                <dt className="label">{drive.from}</dt>
                <dd
                  className="type-display mt-2"
                  style={{ fontSize: "var(--step-1)" }}
                >
                  {drive.duration}
                </dd>
              </div>
            ))}
          </dl>
          <p className="muted mt-6 text-fine">
            {facts.distances.routeNote.value}.
          </p>
        </div>
      </section>

      <section className="section bg-bone">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Nearby
          </h2>
          <ul className="measure mt-10 space-y-4">
            {nearbyPlaces.map((place) => (
              <li
                key={place}
                className="pl-4"
                style={{ borderLeft: "2px solid var(--laterite)" }}
              >
                {place}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-bone-deep">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Find us
          </h2>
          <address className="measure mt-6 not-italic">
            {address.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block">{contact.postalCode.value}</span>
          </address>

          {geo ? (
            <div
              className="hairline mt-8 overflow-hidden"
              style={{ aspectRatio: "16 / 9" }}
            >
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  geo.lng - 0.01
                }%2C${geo.lat - 0.01}%2C${geo.lng + 0.01}%2C${
                  geo.lat + 0.01
                }&layer=mapnik&marker=${geo.lat}%2C${geo.lng}`}
                title={`Map showing ${identity.name} in Saldure, Dapoli`}
                loading="lazy"
                style={{ width: "100%", height: "100%", border: 0 }}
              />
            </div>
          ) : (
            <div
              className="photo-placeholder mt-8"
              style={{ aspectRatio: "16 / 9" }}
            >
              <p className="muted text-fine">
                MAP — pin at the gate, pending coordinates
              </p>
            </div>
          )}

          <p className="mt-6">
            <a
              className="btn btn-outline"
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
