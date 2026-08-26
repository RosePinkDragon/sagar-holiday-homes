import { identity } from "@/content/property";

/**
 * Placeholder. Home is step 9 of the build order in CLAUDE.md — it goes last,
 * because it summarises the other seven pages. This stub exists so `/` is
 * honest while those get built, and is deleted when the real page lands.
 */
export default function HomePage() {
  return (
    <main className="shell section">
      <h1 className="type-display type-display-lg" style={{ fontSize: "var(--step-3)" }}>
        {identity.name}
      </h1>
      <p className="measure mt-6">
        The site is being built. Nothing here yet.
      </p>
      <p className="mt-8">
        <a href="/styleguide/" className="link">
          Design styleguide
        </a>
      </p>
    </main>
  );
}
