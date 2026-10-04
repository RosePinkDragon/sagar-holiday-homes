import type { Metadata } from "next";
import Image from "next/image";
import { pageMetadata, pages } from "@/content/property";
import HorizonBand from "../components/HorizonBand";

/**
 * No real photography exists yet (BRIEF §9, CLAUDE.md working style). Tiles
 * below carry a stock stand-in (public/temp-stock/README.md) so the layout
 * can be reviewed before the shoot; each is badged so it can't be mistaken
 * for the real property. Swap `image` for the delivered photo per tile —
 * the aspect ratios already match the site's landscape crop so nothing
 * reflows when they do.
 */

export function generateMetadata(): Metadata {
  return pageMetadata(pages.gallery, "pages.gallery");
}

type Shot = { caption: string; image?: { src: string; alt: string } };
type Category = { title: string; shots: Shot[] };

const CATEGORIES: Category[] = [
  {
    title: "Pool",
    shots: [
      {
        caption: "Wide shot showing the gazebo and fencing, golden hour",
        image: { src: "/temp-stock/pool-gazebo-fence.jpg", alt: "Stock photo standing in for the pool, gazebo and fencing" },
      },
      {
        caption: "Pool at night, lit",
        image: { src: "/temp-stock/pool-night.jpg", alt: "Stock photo standing in for the pool at night" },
      },
    ],
  },
  {
    title: "The villa",
    shots: [
      {
        caption: "Each bedroom, beds made, lights on",
        image: { src: "/temp-stock/bedroom.jpg", alt: "Stock photo standing in for a bedroom" },
      },
      {
        caption: "Full villa from the entrance approach",
        image: { src: "/temp-stock/villa-exterior-golden.jpg", alt: "Stock photo standing in for the villa entrance approach" },
      },
    ],
  },
  {
    title: "Ground & orchard",
    shots: [
      {
        caption: "The open ground, wide enough to show the full 150m",
        image: { src: "/temp-stock/open-ground.jpg", alt: "Stock photo standing in for the open ground" },
      },
      {
        caption: "The orchard",
        image: { src: "/temp-stock/orchard.jpg", alt: "Stock photo standing in for the orchard" },
      },
      {
        caption: "Drone shot — house, ground and trees together",
        image: { src: "/temp-stock/drone.jpg", alt: "Stock photo standing in for the drone shot" },
      },
    ],
  },
  {
    title: "Kitchen",
    shots: [
      {
        caption: "The guest kitchen",
        image: { src: "/temp-stock/kitchen.jpg", alt: "Stock photo standing in for the guest kitchen" },
      },
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

function PhotoTile({ caption, image }: Shot) {
  if (!image) {
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
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          style={{ objectFit: "cover" }}
        />
        <span className="stock-badge">Stock — temp</span>
      </div>
      <figcaption className="muted text-fine mt-2">{caption}</figcaption>
    </figure>
  );
}

export default function GalleryPage() {
  return (
    <main>
      <HorizonBand
        caption="DRONE — house, ground and orchard together"
        image={{ src: "/temp-stock/drone.jpg", alt: "Stock photo standing in for the drone shot" }}
      />

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
                <PhotoTile key={shot.caption} caption={shot.caption} image={shot.image} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
