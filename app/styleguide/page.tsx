import type { Metadata } from "next";
import { identity } from "@/content/property";

/**
 * Throwaway route. DESIGN.md "Build order for the visual layer" step 3.
 *
 * Its job is to be reviewed on a phone before any of the eight real pages get
 * built, because two failure modes — laterite creeping into a leading role, and
 * type that reads as a boutique hotel rather than a family house — are cheap to
 * fix here and expensive once eight pages depend on them.
 *
 * Delete this directory before launch. Until then it is noindex and excluded
 * from the sitemap.
 *
 * No property facts appear on this page. Everything here describes the design
 * system itself, so nothing can drift from `content/property.ts` or contradict
 * BRIEF §2. The one exception is the site name, imported above.
 */

export function generateMetadata(): Metadata {
  return {
    title: `Styleguide — ${identity.name}`,
    description:
      "Internal reference for the Orchard & bone design direction: colour, type scale, buttons, links, focus states and the horizon band.",
    robots: { index: false, follow: false },
  };
}

/* --------------------------------------------------------------------------
   Contrast, measured rather than asserted.

   These run at build time against the same hex values the stylesheet uses, so
   a badge cannot go stale: change a token and the verdict changes with it.
   WCAG 2.1 relative luminance.
   -------------------------------------------------------------------------- */

const BONE = "#f0eadf";
const BONE_DEEP = "#e3dacb";
const INK = "#2a241c";

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const show = (n: number) => n.toFixed(2);

type Verdict = { label: string; passes: boolean };

/**
 * Judged against the worse of the two grounds. A colour that only passes on
 * `--bone` is not safe, because half the sections are `--bone-deep`.
 */
function verdict(hex: string): Verdict {
  const worst = Math.min(ratio(hex, BONE), ratio(hex, BONE_DEEP));
  if (worst >= 4.5) return { label: "text OK", passes: true };
  if (worst >= 3) return { label: "large text only", passes: false };
  return { label: "not for text", passes: false };
}

type Swatch = {
  token: string;
  hex: string;
  role: string;
  /** Grounds are judged by what sits on them, not by what they sit on. */
  ground?: boolean;
};

const SWATCHES: Swatch[] = [
  {
    token: "--canopy",
    hex: "#234f3e",
    role: "Primary. Headings, nav, CTAs, footer ground.",
  },
  { token: "--canopy-deep", hex: "#16362a", role: "Hover, heavy weight, footer." },
  {
    token: "--canopy-soft",
    hex: "#5c7f6e",
    role: "Dividers, hairlines, placeholder borders. Structural only.",
  },
  {
    token: "--canopy-muted",
    hex: "#4a6658",
    role: "Captions, labels, short metadata. Never a paragraph.",
  },
  {
    token: "--laterite",
    hex: "#8a3f2b",
    role: "Accent. Links, underlines, small marks. Never a section background.",
  },
  {
    token: "--alphonso",
    hex: "#e8a33d",
    role: "Focus rings and highlights. Sparing.",
  },
  {
    token: "--pool",
    hex: "#2e7c8f",
    role: "Tertiary fills, pool sections only. Structural.",
  },
  {
    token: "--pool-deep",
    hex: "#276878",
    role: "Text inside pool sections. The text-safe pool.",
  },
  { token: "--bone", hex: BONE, role: "Page ground.", ground: true },
  {
    token: "--bone-deep",
    hex: BONE_DEEP,
    role: "Alternating sections, raised cards.",
    ground: true,
  },
  {
    token: "--ink",
    hex: INK,
    role: "All running copy. Every paragraph on the site.",
  },
];

const SCALE = [
  {
    token: "--step-3",
    clamp: "clamp(2.4rem, 1.9rem + 2.4vw, 4.25rem)",
    face: "Fraunces · WONK 1 · opsz 72",
    className: "type-display type-display-lg",
    size: "var(--step-3)",
    specimen: identity.name,
  },
  {
    token: "--step-2",
    clamp: "clamp(1.8rem, 1.5rem + 1.4vw, 2.75rem)",
    face: "Fraunces · WONK 1 · opsz 72",
    className: "type-display type-display-lg",
    size: "var(--step-2)",
    specimen: "The ground comes first",
  },
  {
    token: "--step-1",
    clamp: "clamp(1.35rem, 1.2rem + 0.7vw, 1.75rem)",
    face: "Fraunces · WONK 0 · opsz 24",
    className: "type-display",
    size: "var(--step-1)",
    specimen: "Bone ground, canopy type",
  },
  {
    token: "--step-0",
    clamp: "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)",
    face: "Karla · body default",
    className: "",
    size: "var(--step-0)",
    specimen:
      "Body copy sits here, at a line height of 1.6 and a measure that stops at 68 characters. Read this paragraph on a phone at arm's length. If it feels like a brochure rather than someone telling you about their house, the type is wrong and this is the cheap moment to say so.",
  },
  {
    token: "--step--1",
    clamp: "clamp(0.83rem, 0.8rem + 0.15vw, 0.9rem)",
    face: "Karla · captions, labels, fine print",
    className: "",
    size: "var(--step--1)",
    specimen:
      "Captions, photo credits, the GST line under a rate. Registered as the utility text-fine.",
  },
];

/* -------------------------------------------------------------------------- */

function Section({
  title,
  intro,
  deep,
  children,
}: {
  title: string;
  intro?: string;
  deep?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`section ${deep ? "bg-bone-deep" : "bg-bone"}`}>
      <div className="shell">
        <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
          {title}
        </h2>
        {intro ? <p className="measure mt-4">{intro}</p> : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

function Badge({ label, passes }: Verdict) {
  return (
    <span
      className="hairline text-fine inline-block px-2 py-1 font-semibold"
      style={{ color: passes ? "var(--canopy)" : "var(--laterite)" }}
    >
      {label}
    </span>
  );
}

function SwatchRow({ token, hex, role, ground }: Swatch) {
  const onBone = ratio(hex, BONE);
  const onBoneDeep = ratio(hex, BONE_DEEP);

  return (
    <li className="flex gap-4">
      <span
        className="hairline h-16 w-16 shrink-0"
        style={{ backgroundColor: hex }}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="label" style={{ color: "var(--ink)" }}>
          <code>{token}</code>{" "}
          <span className="muted font-normal">{hex.toUpperCase()}</span>
        </p>
        <p className="muted mt-1 text-fine">{role}</p>

        {ground ? (
          <p className="mt-2 text-fine">
            <span className="muted">carries --ink at </span>
            {show(ratio(INK, hex))}:1 <Badge label="ground" passes />
          </p>
        ) : (
          <p className="mt-2 text-fine">
            <span className="muted">on bone </span>
            {show(onBone)}
            <span className="muted"> · on bone-deep </span>
            {show(onBoneDeep)} <Badge {...verdict(hex)} />
          </p>
        )}
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */

export default function StyleguidePage() {
  return (
    <main>
      {/* The signature, leading — because it leads on every real page too. */}
      <div className="band settle">
        <p className="band-caption">
          HERO — pool with orchard behind, golden hour
        </p>
        <div className="band-horizon" aria-hidden="true">
          <span>horizon · 62%</span>
        </div>
      </div>

      {/* Page title sits below the band, on bone. Never floated over it. */}
      <header className="shell settle-next" style={{ paddingBlock: "3rem" }}>
        <p className="label">Internal · not indexed · delete before launch</p>
        <h1
          className="type-display type-display-lg mt-3"
          style={{ fontSize: "var(--step-3)" }}
        >
          Styleguide
        </h1>
        <p className="measure mt-6">
          Every token in the Orchard &amp; bone direction, rendered at the size
          it will actually be used. Review this on a phone before building any
          page. Two questions: has laterite crept into a leading role, and does
          the type read as a family house rather than a boutique hotel?
        </p>
        <p className="measure mt-4 text-fine">
          The band above is 16:9 here and 21:9 from 768px. The horizon holds at
          62% in both, which is what makes moving between pages feel like
          walking the property. The dashed line is a build aid and never ships.
        </p>
      </header>

      <Section
        deep
        title="Colour"
        intro="Green leads in headings, nav and CTAs — but not in prose. Every paragraph on the site is --ink; green at paragraph length reads formal and tires the eye. Laterite stays a minor accent. Contrast is measured against the worse of the two grounds, because half the sections are bone-deep."
      >
        <ul className="grid gap-8 md:grid-cols-2">
          {SWATCHES.map((s) => (
            <SwatchRow key={s.token} {...s} />
          ))}
        </ul>
        <p className="measure mt-10 text-fine">
          Three colours fail the 4.5:1 floor and are structural only:
          --canopy-soft, --pool and --alphonso. Their text-safe siblings are
          --canopy-muted and --pool-deep; --alphonso has none, because at 1.80:1
          on bone no usable darkening of it stays alphonso. It is a focus ring,
          not a word.
        </p>
      </Section>

      <Section
        title="Type"
        intro="Fraunces for display, headings only. Karla for everything else. Headings sit tight at 1.05, body runs loose at 1.6."
      >
        <ol className="space-y-12">
          {SCALE.map((s) => (
            <li key={s.token}>
              <p className="label">
                <code>{s.token}</code> · {s.face}
              </p>
              <p className="muted text-fine mt-1">{s.clamp}</p>
              <p
                className={`measure ${s.className}`}
                style={{ fontSize: s.size, marginTop: "0.75rem" }}
              >
                {s.specimen}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        deep
        title="Buttons"
        intro="Labels say what happens. Minimum 44px tall, 2px corners, and hover changes colour only — no lift, no scale, no shadow."
      >
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className="btn btn-solid">
            Send enquiry
          </button>
          <button type="button" className="btn btn-outline">
            See the tariff
          </button>
          <button type="button" className="btn btn-quiet">
            Copy the phone number
          </button>
          <button type="button" className="btn" disabled>
            Sending…
          </button>
        </div>
        <p className="measure mt-8 text-fine">
          An action keeps its name through the whole flow: the button that says
          “Send enquiry” produces a confirmation that says “Enquiry sent”. The
          disabled state above is what the button reads mid-submit.
        </p>
      </Section>

      <Section
        title="Links"
        intro="Laterite, underlined, hovering to canopy-deep. Links are laterite's main job on the site; keeping it to underlines, rules and small marks is what stops the accent becoming the theme."
      >
        <div className="measure space-y-6">
          <p>
            The beach is a short drive from the house, and the{" "}
            <a href="#links" className="link">
              directions page
            </a>{" "}
            has the turn-by-turn. Inline links carry an underline at all times —
            colour alone is never the only signal.
          </p>
          <p>
            <a href="#links" className="link">
              A standalone link on its own line
            </a>
          </p>
          <p className="text-fine">
            Visited links are deliberately identical to unvisited ones. On an
            eight-page site a dimmed visited link reads as a dead link, and
            there is no navigational value in marking pages a guest has already
            seen.
          </p>
        </div>
      </Section>

      <Section
        deep
        title="Focus"
        intro="Tab through the row below. Every focusable thing takes a 2px alphonso outline at 2px offset — the one job alphonso has, since it can never be text."
      >
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className="btn btn-solid">
            Focus me
          </button>
          <a href="#focus" className="link">
            Then me
          </a>
          <label className="sr-only" htmlFor="sg-name">
            Your name
          </label>
          <input
            id="sg-name"
            className="field"
            style={{ maxWidth: "18rem" }}
            placeholder="Your name"
          />
        </div>
        <p className="measure mt-8 text-fine">
          The outline is set with :focus-visible inside :where(), so it applies
          everywhere at zero specificity and any component can still override it
          without an !important.
        </p>
      </Section>
    </main>
  );
}
