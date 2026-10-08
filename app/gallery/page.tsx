import type { Metadata } from "next";
import Image from "next/image";
import { pageMetadata, pages } from "@/content/property";
import type { PhotoId } from "@/content/photos";
import HorizonBand from "../components/HorizonBand";
import Photo from "../components/Photo";

/**
 * Real photos (content/photos.ts) are used wherever we have one. Tiles that
 * still carry a stock stand-in (public/temp-stock/README.md) are badged so
 * they can't be mistaken for the property; they are the shots still to be
 * taken: open ground, orchard, a group using the villa. The aspect ratios
 * match the site's landscape crop so nothing reflows when they land.
 */

export function generateMetadata(): Metadata {
  return pageMetadata(pages.gallery, "pages.gallery");
}

type Shot = {
  caption: string;
  photo?: PhotoId;
  image?: { src: string; alt: string };
};
type Category = { title: string; shots: Shot[] };

const CATEGORIES: Category[] = [
  {
    title: "Pool",
    shots: [
      { caption: "The pool, wide, at night", photo: "pool-wide" },
      { caption: "Sun loungers beside the pool", photo: "pool-loungers" },
      { caption: "Seating on the pool terrace", photo: "pool-seating" },
      { caption: "Loungers at the pool edge", photo: "pool-edge-loungers" },
      { caption: "Rocking chairs and armchairs on the terrace", photo: "terrace-seating" },
    ],
  },
  {
    title: "The villa",
    shots: [
      { caption: "The villa at sunset", photo: "exterior-sunset" },
      { caption: "The villa lit up at night", photo: "exterior-night" },
      { caption: "A bedroom with blue walls", photo: "bedroom-blue" },
      { caption: "A bedroom with blue walls, with air conditioner", photo: "bedroom-blue-ac" },
      { caption: "A bedroom with lilac walls", photo: "bedroom-lilac" },
      { caption: "A bedroom with lilac walls, from the window side", photo: "bedroom-lilac-2" },
      { caption: "A bedroom with cream walls", photo: "bedroom-cream" },
      { caption: "A bedroom with cream walls, with TV", photo: "bedroom-cream-2" },
      { caption: "The bed in the cream bedroom", photo: "bedroom-cream-bed" },
      { caption: "A bathroom with patterned tiles", photo: "bathroom-patterned" },
      { caption: "A bathroom with grey tiles", photo: "bathroom-grey" },
    ],
  },
  {
    title: "Ground & orchard",
    shots: [
      { caption: "From above, at dusk", photo: "aerial-dusk" },
      { caption: "From above, the path to the villa", photo: "aerial-approach" },
      { caption: "From above, at night", photo: "aerial-night" },
      {
        caption: "The open ground, wide enough to show the full 150m",
        image: { src: "/temp-stock/open-ground.jpg", alt: "Stock photo standing in for the open ground" },
      },
      {
        caption: "The orchard",
        image: { src: "/temp-stock/orchard.jpg", alt: "Stock photo standing in for the orchard" },
      },
    ],
  },
  {
    title: "Kitchen & sitting area",
    shots: [
      { caption: "The kitchen counter", photo: "kitchen-counter" },
      { caption: "The sitting area beside the kitchen", photo: "sitting-kitchen" },
      { caption: "The sofa set", photo: "sitting-sofa" },
    ],
  },
  {
    title: "Life at the villa",
    shots: [
      {
        caption: "A group actually using the space — not an empty house",
        image: { src: "/temp-stock/group-pool.jpg", alt: "Stock photo standing in for a group at the villa" },
      },
    ],
  },
];

function PhotoTile({ caption, photo, image }: Shot) {
  if (!photo && !image) {
    return (
      <div className="photo-placeholder" style={{ aspectRatio: "4 / 3" }}>
        <p className="muted text-fine">{caption}</p>
      </div>
    );
  }
  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          borderRadius: "var(--radius)",
        }}
      >
        {photo ? (
          <Photo id={photo} sizes="(min-width: 640px) 50vw, 100vw" />
        ) : image ? (
          <>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              style={{ objectFit: "cover" }}
            />
            <span className="stock-badge">Stock — temp</span>
          </>
        ) : null}
      </div>
      <figcaption className="muted text-fine mt-2">{caption}</figcaption>
    </figure>
  );
}

export default function GalleryPage() {
  return (
    <main>
      <HorizonBand caption="DRONE — house, ground and orchard together" photo="aerial-dusk" />

      <header className="shell settle-next" style={{ paddingBlock: "3rem" }}>
        <h1
          className="type-display type-display-lg mt-3"
          style={{ fontSize: "var(--step-3)" }}
        >
          Gallery
        </h1>
        <p className="measure mt-6">
          A closer look at the villa, the pool, the ground and the orchard.
        </p>
      </header>

      {CATEGORIES.map((category, i) => (
        <section
          key={category.title}
          className={`section ${i % 2 === 0 ? "bg-bone-deep" : "bg-bone"}`}
        >
          <div className="shell">
            <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
              {category.title}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 mt-10">
              {category.shots.map((shot) => (
                <PhotoTile key={shot.caption} {...shot} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
