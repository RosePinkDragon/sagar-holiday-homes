import type { Metadata } from "next";
import Link from "next/link";
import { Car, ExternalLink, MapPin, Navigation } from "lucide-react";
import {
  contact,
  describe,
  facts,
  identity,
  mapsSearchHref,
  nearbyPlaces,
  pageMetadata,
  pages,
  policy,
  resolved,
} from "@/content/property";
import HorizonBand from "../components/HorizonBand";
import LocationMap from "../components/LocationMap";

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
          That&rsquo;s what makes room for {describe.ground()} and a
          working orchard on the property — a seafront plot in Dapoli
          rarely has space for either. Saldure beach is still just{" "}
          {describe.beachDistance()} away, and the wider Dapoli coastline
          is a short drive further along.
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
          <p className="muted mt-6 text-fine">
            {facts.distances.routeNote.value}.
          </p>
          <p className="measure mt-6">
            Given the drive, most groups stay more than one night — minimum
            stay is {policy.stay.minimumNights.value.standard} night
            ({policy.stay.minimumNights.value.peak} on peak dates). See{" "}
            <Link href="/tariff" className="link">
              rates and booking
            </Link>
            .
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
                key={place.name}
                className="pl-4 with-icon"
                style={{ borderLeft: "2px solid var(--laterite)" }}
              >
                <MapPin className="icon" aria-hidden="true" style={{ color: "var(--laterite)", alignSelf: "flex-start", marginTop: "0.3em" }} />
                <span>
                <a
                  className="link with-icon"
                  href={mapsSearchHref(place.mapsQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {place.name}
                  <ExternalLink className="icon arrow" aria-hidden="true" style={{ width: "0.85em", height: "0.85em" }} />
                  <span className="sr-only"> (opens Google Maps)</span>
                </a>
                {place.detail ? <> — {place.detail}</> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-bone-deep">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,34rem)] lg:items-center lg:justify-center lg:gap-20">
            <div>
              <h2
                className="type-display"
                style={{ fontSize: "var(--step-2)" }}
              >
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
              <p className="mt-6">
                <a
                  className="btn btn-outline"
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="icon" aria-hidden="true" />
                  Get directions
                </a>
              </p>
              {geo ? (
                <p className="muted mt-4 text-fine">
                  Tap a pin to open it in Google Maps.
                </p>
              ) : null}
            </div>

            {geo ? (
              <LocationMap
                title={`Map showing ${identity.name} in ${address.village}, ${address.taluka}`}
                pins={[{ label: identity.name, ...geo, primary: true }]}
              />
            ) : (
              <div
                className="photo-placeholder"
                style={{ aspectRatio: "4 / 3" }}
              >
                <p className="muted text-fine">
                  MAP — pin at the gate, pending coordinates
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
