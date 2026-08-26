import type { Metadata } from "next";
import { pageMetadata, pages } from "@/content/property";
import HorizonBand from "../components/HorizonBand";

/**
 * No photography exists yet (BRIEF §9, CLAUDE.md working style) — every tile
 * is a placeholder naming the shot required, grouped the way the shoot brief
 * groups them. Swap each tile for a real `next/image` as photos land; the
 * aspect ratios below already match the site's landscape crop so nothing
 * reflows when they do.
 */

export function generateMetadata(): Metadata {
  return pageMetadata(pages.gallery, "pages.gallery");
}

type Category = { title: string; shots: string[] };

const CATEGORIES: Category[] = [
  {
    title: "Pool",
    shots: [
      "Wide shot showing the gazebo and fencing, golden hour",
      "Pool at night, lit",
    ],
  },
  {
    title: "The villa",
    shots: [
      "Each bedroom, beds made, lights on",
      "Full villa from the entrance approach",
    ],
  },
  {
    title: "Ground & orchard",
    shots: [
      "The open ground, wide enough to show the full 150m",
      "The orchard",
      "Drone shot — house, ground and trees together",
    ],
  },
  { title: "Kitchen", shots: ["The guest kitchen"] },
  {
    title: "Life at the villa",
    shots: ["A group actually using the space — not an empty house"],
  },
];

function PhotoTile({ caption }: { caption: string }) {
  return (
    <div className="photo-placeholder" style={{ aspectRatio: "4 / 3" }}>
      <p className="muted text-fine">{caption}</p>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <main>
      <HorizonBand caption="DRONE — house, ground and orchard together" />

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
                <PhotoTile key={shot} caption={shot} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
