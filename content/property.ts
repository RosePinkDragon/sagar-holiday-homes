/**
 * Sagar Holiday Homes — single source of truth for all property content.
 *
 * Derived from BRIEF.md. Every fact, rate, policy line and contact detail lives
 * here; components read from this module and never hardcode content (BRIEF §8,
 * "Editability"). Phase 2 swaps this one file for a CMS.
 *
 * RULE: do not publish anything that contradicts BRIEF §2.
 *
 * Anything a guest reads that contains a NUMBER is derived from `facts`, never
 * retyped. When occupancy changes, one edit changes every line that mentions it.
 */

// ---------------------------------------------------------------------------
// Confirmation state
//
// The brief distinguishes three states, and so does this module:
//
//   confirmed — signed off, safe to render.
//   assumed   — a recommendation with a real value (BRIEF "[ASSUMED]"). Renders,
//               but stays in the open-items register until it is overridden or
//               confirmed.
//   tbd       — no value exists (BRIEF "[TBD]"). Carries the open question, what
//               it blocks, and how badly. May carry a `proposed` draft for
//               internal sign-off sheets — never for public copy.
//
// A `Fact<T>` is deliberately NOT assignable to ReactNode. Writing
// `<p>{tariff.gst.displayTreatment}</p>` is a type error, not a blank on the
// page. Callers must narrow with isResolved() / resolved() / requireFact().
// ---------------------------------------------------------------------------

/**
 * How badly an unanswered question hurts.
 *
 *   content — a page cannot be built without it. Fails the build gate.
 *   launch  — the property must not take guests without it (insurance, gate
 *             hardware). Does not block a site build; does block go-live.
 *   ops     — back-office or OTA-listing detail. Tracked, never blocking.
 */
export type TbdSeverity = "content" | "launch" | "ops";

/** Who has to answer. Splits "waiting on the owner" from "waiting on us". */
export type TbdOwner = "owner" | "developer";

export type Confirmed<T> = {
  readonly status: "confirmed";
  readonly value: T;
};

export type Assumed<T> = {
  readonly status: "assumed";
  readonly value: T;
  /** Why this default was chosen, and what overriding it would change. */
  readonly note: string;
};

/**
 * `P` is the shape of the draft value, which is not always the shape of the
 * answer — the rate card's answer is three numbers, its draft is three bands.
 */
export type Tbd<T, P = T> = {
  readonly status: "tbd";
  /** The exact question to be answered. */
  readonly question: string;
  /** What cannot ship until it is. */
  readonly blocks: string;
  readonly severity: TbdSeverity;
  /** Defaults to "owner" when absent. */
  readonly owner?: TbdOwner;
  /** Draft/benchmark value. Internal sign-off only — never public copy. */
  readonly proposed?: P;
};

export type Fact<T> = Confirmed<T> | Assumed<T> | Tbd<T, unknown>;

/** A fact that carries a usable value. */
export type Resolved<T> = Confirmed<T> | Assumed<T>;

export const confirmed = <const T>(value: T): Confirmed<T> => ({
  status: "confirmed",
  value,
});

export const assumed = <const T>(value: T, note: string): Assumed<T> => ({
  status: "assumed",
  value,
  note,
});

export const tbd = <T, P = T>(spec: {
  question: string;
  blocks: string;
  severity: TbdSeverity;
  owner?: TbdOwner;
  proposed?: P;
}): Tbd<T, P> => ({ status: "tbd", ...spec });

export function isResolved<T>(fact: Fact<T>): fact is Resolved<T> {
  return fact.status !== "tbd";
}

export function isPending<T>(fact: Fact<T>): fact is Tbd<T, unknown> {
  return fact.status === "tbd";
}

/** Value if known, otherwise null. Use when the UI can omit the whole block. */
export function resolved<T>(fact: Fact<T>): T | null {
  return isResolved(fact) ? fact.value : null;
}

/**
 * Value if known, otherwise throw. Use on pages that are meaningless without
 * the data (e.g. /tariff without a rate card) so a static build fails loudly
 * instead of shipping an empty table.
 */
export function requireFact<T>(fact: Fact<T>, label: string): T {
  if (isPending(fact)) {
    throw new Error(
      `[content/property] "${label}" is still TBD: ${fact.question} (blocks: ${fact.blocks})`
    );
  }
  return fact.value;
}

export type OpenItem = {
  /** Dotted path into the content tree, e.g. "tariff.gst.displayTreatment". */
  readonly path: string;
  readonly status: "assumed" | "tbd";
  readonly detail: string;
  readonly blocks?: string;
  readonly severity?: TbdSeverity;
  readonly owner: TbdOwner;
};

const isFactNode = (v: unknown): v is Fact<unknown> =>
  typeof v === "object" &&
  v !== null &&
  "status" in v &&
  (v.status === "confirmed" || v.status === "assumed" || v.status === "tbd");

/**
 * Walks the content tree and returns every unsettled item.
 *
 * This is the live version of BRIEF §11, but wider: it also lists copy the
 * developer still has to write. Filter on `owner` before showing it to anyone.
 */
export function collectOpenItems(
  node: unknown = registry,
  path: string[] = []
): OpenItem[] {
  if (isFactNode(node)) {
    const here = path.join(".");
    if (node.status === "tbd") {
      const f = node as Tbd<unknown, unknown>;
      return [
        {
          path: here,
          status: "tbd",
          detail: f.question,
          blocks: f.blocks,
          severity: f.severity,
          owner: f.owner ?? "owner",
        },
      ];
    }
    if (node.status === "assumed") {
      const f = node as Assumed<unknown>;
      return [
        { path: here, status: "assumed", detail: f.note, owner: "owner" },
      ];
    }
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child, i) =>
      collectOpenItems(child, [...path, String(i)])
    );
  }
  if (typeof node === "object" && node !== null) {
    return Object.entries(node).flatMap(([key, child]) =>
      collectOpenItems(child, [...path, key])
    );
  }
  return [];
}

const failOn = (
  severities: readonly TbdSeverity[],
  gate: string,
  includeAssumed = false
): void => {
  const blocking = collectOpenItems().filter(
    (i) =>
      (i.status === "tbd" && i.severity && severities.includes(i.severity)) ||
      (includeAssumed && i.status === "assumed")
  );
  if (blocking.length > 0) {
    throw new Error(
      `[content/property] ${gate}: ${blocking.length} item(s) unresolved:\n` +
        blocking
          .map((i) => `  · [${i.owner}] ${i.path} — ${i.detail}`)
          .join("\n")
    );
  }
};

/**
 * Throws if any page-blocking content is missing. This is the pre-build gate —
 * it ignores operational items (insurance, gate hardware, Wi-Fi speed), which
 * a website can ship without.
 */
export function assertContentReady(): void {
  failOn(["content"], "content not ready");
}

/**
 * Throws if ANY open question remains, at any severity — page content, the
 * operational gates, and the back-office details that never blocked a build.
 * Not a build gate; run it before flipping `identity.live`.
 */
export function assertLaunchReady(): void {
  failOn(["content", "launch", "ops"], "not ready to launch", true);
}

// ---------------------------------------------------------------------------
// Money & formatting
// ---------------------------------------------------------------------------

/** Whole rupees. No paise anywhere on this property. */
export type Inr = number;

/** An unsigned-off price expressed as a band, e.g. ₹10,000 – ₹12,000. */
export type InrBand = { readonly from: Inr; readonly to: Inr };

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatInr = (amount: Inr): string => inrFormatter.format(amount);

export const formatInrBand = (band: InrBand): string =>
  `${formatInr(band.from)} – ${formatInr(band.to)}`;

/**
 * contact.phone is stored E.164 (BRIEF §8) so tel:/wa.me links and OTA
 * fields all read from one value — display formatting is deliberately left
 * to this helper rather than the callers. Only the +91 shape is known
 * today; anything else renders as-is.
 */
export function formatPhone(e164: string): string {
  const match = /^\+91(\d{5})(\d{5})$/.exec(e164);
  return match ? `+91 ${match[1]} ${match[2]}` : e164;
}

/** "cricket, football and badminton" */
const sentenceList = (items: readonly string[]): string =>
  items.length < 2
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

/** Species and activity lists are stored lowercase for mid-sentence use. */
const sentenceCase = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// ---------------------------------------------------------------------------
// Product facts (BRIEF §2) — the single source of truth
//
// Declared before everything else, because all guest-facing copy derives from
// it. Values that appear in prose are stored structured, not pre-written.
// ---------------------------------------------------------------------------

export const facts = {
  configuration: confirmed("3BHK"),
  bedrooms: confirmed(3),
  beds: confirmed({ count: 3, size: "king-size", sleepsEach: 3 }),
  mattresses: confirmed(3),
  occupancy: {
    /** Today's advertisable maximum. */
    max: confirmed(12),
    /** The number to design and photograph around. */
    comfortable: confirmed(9),
    /** Rates are quoted to this many guests; extras are charged. */
    base: confirmed(8),
  },
  saleModel: confirmed("Whole-villa buyout only. No per-room sales."),
  ground: confirmed({
    approxMetres: 150,
    activities: ["cricket", "football", "badminton"],
  }),
  /** BRIEF §1: "Alphonso country. April–May mango season is a marketable event." */
  orchard: confirmed({
    approxTrees: 30,
    species: ["coconut", "mango"],
    season: "Alphonso, ripe April–May",
  }),
  kitchen: confirmed("Full kitchen, guest-usable"),
  food: confirmed("Not included. Local cook available on order."),
  indoorGames: confirmed(["Carrom", "TV"]),
  /**
   * Added 17 Aug 2026 on the owner's word. NOT in BRIEF §2 - CLAUDE.md names
   * BBQ as an amenity never to assume, so this is here only because the owner
   * stated it exists.
   */
  barbecue: {
    available: confirmed(true),
    terms: tbd<string>({
      question:
        "Barbecue: free for guests or charged? Charcoal provided, and does the caretaker run it or do guests? Needed before the villa page describes how it works.",
      blocks: "Villa page detail - the amenity line itself can ship without it",
      severity: "ops",
    }),
  },
  /**
   * Villa page job (BRIEF §8) names "floor logic" alongside rooms and
   * occupancy, but no floor plan exists anywhere in BRIEF §2 or the owner's
   * notes. Not guessed — a wrong floor plan (e.g. claiming a ground-floor
   * bedroom that doesn't exist) is worse than omitting it.
   */
  floorLayout: tbd<string>({
    question:
      "How are the 3 bedrooms and common areas distributed across floors? (e.g. any ground-floor bedroom, useful for elderly guests)",
    blocks: "Villa page floor-plan detail — the page can ship without it",
    severity: "ops",
  }),
  kidsPlayArea: confirmed(false),
  parking: confirmed("Large open frontage — fits multiple cars and buses"),
  airConditioning: confirmed("All bedrooms"),
  hotWater: confirmed("Throughout"),
  wifi: {
    available: confirmed(true),
    speed: confirmed({ downloadMbps: 50 }),
  },
  backupPower: {
    available: confirmed("Generator"),
    coverage: confirmed("whole-villa"),
  },
  distances: {
    saldureBeach: confirmed({ minutesByCar: 5 }),
    driveTimes: confirmed([
      { from: "Mumbai", duration: "4.5 – 5 hrs" },
      { from: "Pune", duration: "4.5 – 5 hrs" },
    ]),
    /** Owner, 26 Aug 2026: mostly NH66; kept as one simple note rather than turn-by-turn. */
    routeNote: confirmed("Mostly via NH66"),
  },
} as const;

/**
 * Guest-facing phrasings of the facts above. Every string that contains a
 * number is built here, so a fact change propagates to all copy that uses it.
 */
export const describe = {
  occupancy: () =>
    `Sleeps ${facts.occupancy.max.value} across ${facts.bedrooms.value} bedrooms, all air-conditioned`,
  beds: () =>
    `${facts.beds.value.count} ${facts.beds.value.size} beds, sleeping up to ${facts.beds.value.sleepsEach} each`,
  ground: () =>
    `~${facts.ground.value.approxMetres}m of open ground for ${sentenceList(facts.ground.value.activities)}`,
  orchard: () =>
    `~${facts.orchard.value.approxTrees} ${sentenceList(facts.orchard.value.species)} trees`,
  beachDistance: () =>
    `${facts.distances.saldureBeach.value.minutesByCar} minutes by car`,
  wifi: () => `${facts.wifi.speed.value.downloadMbps} Mbps Wi-Fi`,
} as const;

export type NearbyPlace = {
  readonly name: string;
  /** Drive time, only where confirmed. */
  readonly detail?: string;
  /** Google Maps search text. A search, not a pin, until coordinates are confirmed. */
  readonly mapsQuery: string;
};

/** BRIEF §8, Location — name the landmarks people actually search for. */
export const nearbyPlaces: readonly NearbyPlace[] = [
  {
    name: "Saldure beach",
    detail: `${facts.distances.saldureBeach.value.minutesByCar} minutes`,
    mapsQuery: "Saldure beach, Dapoli",
  },
  { name: "Murud beach", mapsQuery: "Murud beach, Dapoli" },
  { name: "Harnai fish market", mapsQuery: "Harnai fish market, Dapoli" },
  { name: "Kelshi", mapsQuery: "Kelshi, Dapoli" },
  { name: "Suvarnadurg fort", mapsQuery: "Suvarnadurg fort, Harnai" },
  {
    name: "International cricket stadium at Royal Goldfield Club Resort",
    mapsQuery: "Royal Goldfield Club Resort, Dapoli",
  },
];

export const mapsSearchHref = (query: string): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

/**
 * Property-level amenity list (BRIEF §2). Deliberately NOT hotel-room inventory
 * — no mini fridge, no tea kettle, no luggage counter. Buyout guests ask
 * different questions.
 */
export const amenities = [
  describe.occupancy(),
  "Private pool, shaded, exclusive to your booking",
  "Full kitchen — cook your own or order from our local cook",
  "Barbecue on site",
  describe.ground(),
  sentenceCase(`${sentenceList(facts.orchard.value.species)} orchard`),
  "Parking for multiple cars and buses",
  "Generator backup, Wi-Fi, hot water throughout",
  sentenceList(facts.indoorGames.value),
  `Saldure beach, ${facts.distances.saldureBeach.value.minutesByCar} minutes away`,
] as const;

// ---------------------------------------------------------------------------
// Identity & positioning (BRIEF §1)
// ---------------------------------------------------------------------------

export const identity = {
  name: "Sagar Holiday Homes",
  domain: "sagarholidayhomes.com",
  /**
   * Pre-launch. Website and property go live together (BRIEF §10). Drives
   * `siteRobots()` below — noindex until this flips. Set
   * NEXT_PUBLIC_SITE_LIVE=true in the deploy environment at cutover.
   *
   * `next-sitemap.config.js` reads the same env var independently to keep
   * `robots.txt` in sync — it can't import this module (plain CommonJS
   * postbuild script, no ts-node in this repo), so the env var itself is
   * the shared source of truth, not this computed field.
   */
  live: process.env.NEXT_PUBLIC_SITE_LIVE === "true",
  positioning:
    "A private villa in a Konkan orchard — the whole house, the whole pool, and a ground big enough for a real cricket match. Beach five minutes away.",
  /** In priority order. The ground is the lead, not the beach. */
  differentiators: [
    {
      title: "Space",
      body: `${describe.ground()}. Most Konkan villas sit on small plots.`,
    },
    {
      title: "Private pool under a gazebo",
      body: "Shaded, fenced enclosure, exclusive to your booking — never shared with other guests.",
    },
    {
      title: "A working orchard",
      body: `${describe.orchard()} in Alphonso country. April and May are mango season.`,
    },
  ],
  supporting:
    "A full guest-usable kitchen plus an on-call local cook — self-cater or order in. Nearby resorts cannot offer this.",
  segments: [
    `Extended families, 8–${facts.occupancy.max.value} people`,
    "Friend groups from Mumbai and Pune",
    "Small corporate offsites",
  ],
  /** BRIEF §1 — a staffed line is a genuine differentiator here. Say so. */
  serviceClaim:
    "Someone answers the phone, 10am to 10pm, every day of the week.",
} as const;

// ---------------------------------------------------------------------------
// Pool — facts, access and safety disclosure (BRIEF §2, §3)
// ---------------------------------------------------------------------------

export const pool = {
  summary: confirmed(
    "Private pool under a gazebo, in a fenced enclosure, exclusive to your booking"
  ),
  depth: confirmed({ feet: 6, uniform: true }),
  /** Owner, 17 Aug 2026: 18 x 17 feet. */
  dimensions: confirmed({ lengthFt: 18, widthFt: 17 }),
  access: confirmed({ open: "07:00", close: "19:00", display: "7am – 7pm" }),
  lifeguard: confirmed(false),

  /**
   * BRIEF §3 — publish verbatim on the Pool & Grounds page and in the T&Cs.
   * Do not paraphrase, soften or shorten this.
   *
   * The "6 feet" here is intentionally NOT derived from `depth`. The wording is
   * fixed by the brief; if the depth ever changes, this sentence must be
   * re-approved rather than silently rewritten by a template.
   */
  disclosure: confirmed(
    "The pool is 6 feet deep throughout with no shallow end, and there is no lifeguard on duty. Children and non-swimmers must be supervised by an adult at all times. Pool access is open 7am–7pm. Use of the pool, ground and orchard is at guests' own risk."
  ),

  /** Operational gates, not site content. All must clear before go-live. */
  preLaunchChecks: {
    /**
     * Answered 17 Aug 2026: the gate is neither self-closing nor lockable. The
     * caretaker can lock it on request.
     *
     * BRIEF §3 lists "confirm the enclosure gate is self-closing and lockable"
     * as a required pre-launch action, and treats controlled access as the
     * mitigation for the main risk. The answer is "no", so recording it does
     * not close the item — see gateRemediation.
     */
    gate: confirmed({
      selfClosing: false,
      lockable: false,
      note: "Caretaker can lock the enclosure on request",
    }),
    gateRemediation: tbd<"fitted" | "risk-accepted">({
      question:
        "The pool gate is neither self-closing nor lockable, which is the mitigation BRIEF §3 assumes. Fit a self-closing lockable gate, or record a written decision to accept the risk?",
      blocks:
        "Go-live — 6ft uniform depth, no shallow end, no lifeguard, and nothing keeping a child out of the enclosure",
      severity: "launch",
    }),
    /**
     * Deferred by the owner on 17 Aug 2026 ("not now, will add later"). Left
     * open at launch severity because BRIEF §3 calls it non-negotiable at this
     * occupancy; it does not block a preview build, and it does block go-live.
     */
    publicLiabilityInsurance: tbd<{ insurer: string; policyNo: string }>({
      question:
        "Public liability insurance — deferred, still required before the first paying booking. Which insurer and policy number?",
      blocks: "Go-live — do not accept a booking without this",
      severity: "launch",
    }),
  },
} as const;

/** "18 x 17 feet" */
export const describePoolSize = (): string =>
  `${pool.dimensions.value.lengthFt} x ${pool.dimensions.value.widthFt} feet`;

/** "6 feet deep throughout, with no shallow end" */
export const describePoolDepth = (): string =>
  `${pool.depth.value.feet} feet deep${pool.depth.value.uniform ? " throughout, with no shallow end" : ""}`;

// ---------------------------------------------------------------------------
// Tariff (BRIEF §4) — owner sign-off required on everything below
// ---------------------------------------------------------------------------

/**
 * A published rate and the discounted rate guests actually pay. The site
 * shows `published` struck through beside `offer`; anything that needs a
 * single number (worked example, structured data) uses `offer`.
 */
export type Rate = {
  readonly published: Inr;
  readonly offer: Inr;
};

export type RateCard = {
  readonly weekday: Rate;
  readonly weekend: Rate;
  readonly peak: Rate;
};

export const tariff = {
  /**
   * BRIEF §4 + §11 item 1 — this blocks ALL site copy. Until it is answered,
   * no page may state a rate, because a rate without its GST treatment is
   * worse than no rate at all (BRIEF §8, Home).
   *
   * Accommodation above ₹7,500/night attracts 18% GST with input tax credit.
   * Every realistic rate here sits above that line, so 18% applies and the
   * build-out, furnishings and running costs become creditable.
   */
  gst: {
    ratePercent: confirmed(18),
    /**
     * Owner's decision, 17 Aug 2026: displayed rates are GST-inclusive. Every
     * rate on the site is therefore the amount the guest actually pays, and
     * must be rendered alongside gstNote(). Still worth confirming the
     * mechanics with a CA — see caQuestions below.
     */
    displayTreatment: confirmed("inclusive"),
    /** Raise these with the CA specifically (BRIEF §4). */
    caQuestions: [
      "TCS collected by OTAs under the e-commerce operator provisions — appears in GSTR-8 data, must be reconciled and claimed",
      "Reverse charge on commission billed by foreign OTA entities",
      "Credit-note treatment for refunds against issued invoices",
    ],
  },

  /**
   * Owner, 8 Oct 2026: published rate and discounted rate per band, both
   * GST-inclusive (matching gst.displayTreatment). Replaces the BRIEF §4
   * benchmark-midpoint placeholder.
   */
  rateCard: confirmed({
    weekday: { published: 12_000, offer: 10_000 },
    weekend: { published: 18_000, offer: 12_000 },
    peak: { published: 24_000, offer: 20_000 },
  } satisfies RateCard),

  periods: confirmed({
    weekday: "Monday – Thursday",
    weekend: "Friday – Sunday",
  }),

  peakDates: confirmed([
    "Diwali",
    "25 December – 2 January",
    "Holi",
    "All long weekends",
    "May summer holidays",
  ]),

  /**
   * Owner, 17 Aug 2026: ₹1,200 per extra guest per night above base occupancy
   * of 8, up to the maximum of 12. Above the ₹800–₹1,000 benchmark in BRIEF §4,
   * which is the owner's call. GST-inclusive, like every other rate here.
   */
  extraGuest: confirmed(1_200),

  /**
   * A discount OFF a published rate — never a lower base rate. Anchoring low
   * is hard to undo.
   *
   * Owner, 8 Oct 2026: the launch offer IS the gap between `published` and
   * `offer` in rateCard — already included in the rates, not stacked on top.
   * The percentage is derived by launchOfferPercent(), never typed here, and
   * no duration is stated on the site. Replaces the BRIEF §4 draft of 20–25%
   * in exchange for a Google review.
   */
  launchOffer: confirmed({ includedInRates: true }),
} as const;

/**
 * Launch-offer depth across the rate card, rounded DOWN so the site never
 * overstates the saving (e.g. ₹12,000 → ₹10,000 is 16.7%, shown as 16%).
 */
export function launchOfferPercent(): { from: number; to: number } | null {
  const rateCard = resolved(tariff.rateCard);
  if (!rateCard) return null;
  const percents = Object.values(rateCard).map(({ published, offer }) =>
    Math.floor(((published - offer) / published) * 100)
  );
  return { from: Math.min(...percents), to: Math.max(...percents) };
}

/** e.g. "16–33% off the published rate". Null when there's no rate card. */
export function describeLaunchOffer(): string | null {
  const range = launchOfferPercent();
  if (!range) return null;
  const span =
    range.from === range.to ? `${range.to}%` : `${range.from}–${range.to}%`;
  return `${span} off the published rate`;
}

/**
 * CLAUDE.md hard rule 7: no rate appears without its GST treatment. Render this
 * next to every price on every page.
 */
export const gstNote = (): string =>
  requireFact(tariff.gst.displayTreatment, "tariff.gst.displayTreatment") ===
  "inclusive"
    ? `Inclusive of ${tariff.gst.ratePercent.value}% GST`
    : `Plus ${tariff.gst.ratePercent.value}% GST`;

/**
 * BRIEF §4 / audit finding: the guest-count and pricing story (sleeps 12,
 * rates built around 8, 9 comfortable) is confusing without a worked
 * number. Computed from the same `tariff`/`facts` values the rate card
 * renders — never a second, hand-typed set of numbers — so it can't drift
 * from the table above it. Returns null while the rate card is still `tbd`
 * (it isn't today; stays defensive per the same pattern as
 * `lodgingBusinessJsonLd`).
 */
export function describeWorkedExample(): {
  nights: number;
  guests: number;
  extraGuests: number;
  nightlyRate: Inr;
  nightsTotal: Inr;
  extrasTotal: Inr;
  grandTotal: Inr;
  perPersonPerNight: Inr;
} | null {
  const rateCard = resolved(tariff.rateCard);
  if (!rateCard) return null;

  const nights = 2;
  const guests = facts.occupancy.max.value;
  const base = facts.occupancy.base.value;
  const extraGuests = guests - base;
  const nightlyRate = rateCard.weekend.offer;
  const nightsTotal = nightlyRate * nights;
  const extrasTotal = tariff.extraGuest.value * extraGuests * nights;
  const grandTotal = nightsTotal + extrasTotal;

  return {
    nights,
    guests,
    extraGuests,
    nightlyRate,
    nightsTotal,
    extrasTotal,
    grandTotal,
    perPersonPerNight: Math.round(grandTotal / guests / nights),
  };
}

/**
 * `Offer` schema for /tariff (audit §3.3). `priceRange` already renders
 * site-wide via `lodgingBusinessJsonLd()`; this is the page-specific,
 * more detailed sibling. Omits `price` entirely while the rate card is
 * still `assumed` rather than publish an unconfirmed figure as structured
 * data search engines may surface directly.
 */
export function tariffOfferJsonLd(): Record<string, unknown> | null {
  const fact: Fact<RateCard> = tariff.rateCard;
  if (fact.status !== "confirmed") return null;
  const rateCard = fact.value;
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    url: `https://${identity.domain}/tariff/`,
    priceCurrency: "INR",
    lowPrice: rateCard.weekday.offer,
    highPrice: rateCard.peak.offer,
    eligibleQuantity: {
      "@type": "QuantitativeValue",
      maxValue: facts.occupancy.max.value,
    },
  };
}

// ---------------------------------------------------------------------------
// Booking & cancellation policy (BRIEF §5)
// ---------------------------------------------------------------------------

export type CancellationTier = {
  readonly noticeBeforeCheckIn: string;
  readonly refundPercent: 100 | 50 | 25 | 0;
  readonly processingFeeInr?: Inr;
};

export const policy = {
  confirmation: confirmed({
    advancePercent: 30,
    balance: "Payable at check-in",
    holdHours: 24,
    line: "30% advance confirms your booking; the balance is due at check-in. Dates are held for 24 hours pending payment.",
  }),

  /** Refund is of the advance. Order matters — render top to bottom. */
  cancellation: confirmed([
    {
      noticeBeforeCheckIn: "15+ days",
      refundPercent: 100,
      processingFeeInr: 2_000,
    },
    { noticeBeforeCheckIn: "7 – 14 days", refundPercent: 50 },
    { noticeBeforeCheckIn: "3 – 6 days", refundPercent: 25 },
    { noticeBeforeCheckIn: "Under 3 days, or no-show", refundPercent: 0 },
  ] satisfies readonly CancellationTier[]),

  /** Offer this BEFORE a refund. It protects the calendar and most guests take it. */
  dateTransfer: confirmed({
    freeChanges: 1,
    minNoticeDays: 7,
    validForDays: 90,
    line: "One free date change if you tell us 7 or more days ahead, valid for 90 days, subject to availability. Any rate difference is payable.",
  }),

  stay: {
    checkIn: confirmed({ time: "13:00", display: "1pm" }),
    checkOut: confirmed({ time: "11:00", display: "11am" }),
    /** Costs nothing on an empty calendar; materially improves a 1-night stay. */
    flexibleTimings: confirmed({
      earlyCheckIn: "11am",
      lateCheckOut: "2pm",
      condition:
        "Free when the adjacent night is unbooked, on request. Given the five-hour drive, ask us.",
    }),
    minimumNights: confirmed({ standard: 1, peak: 2 }),
    /** A Saturday-only booking kills the Friday and the Sunday. */
    singleNightSaturdaySurchargePercent: confirmed(25),
    quietHours: confirmed({
      from: "22:00",
      line: "Music off by 10pm — this is a small village and noise complaints become real problems.",
    }),
  },

  securityDeposit: assumed(
    { amountInr: 5_000, refundWithinHours: 48 },
    "BRIEF §5 places this at ₹5,000, refunded within 48 hours of check-out. Owner to confirm the amount (open item #9)."
  ),

  otherTerms: confirmed([
    "Guests exceeding the declared count may be refused entry, or charged double the extra-guest rate.",
    "Use of the pool, ground and orchard is at guests' own risk. See the pool safety notice.",
  ]),

  /** Konkan monsoon makes this necessary, not optional. */
  forceMajeure: confirmed(
    "If landslides, cyclones or road closures prevent your travel, we will transfer your dates in full."
  ),

  /** OTA policies live in their own systems and will not match this exactly. */
  otaMapping: confirmed({ airbnbPreset: "Firm or Strict" }),
} as const;

// ---------------------------------------------------------------------------
// Food service (BRIEF §6)
// ---------------------------------------------------------------------------

export const food = {
  kitchen: confirmed("Full kitchen, yours to use"),
  cook: confirmed("Local cook available on order"),
  /** Owner, 17 Aug 2026: priced per dish, not per head. */
  pricingModel: confirmed("per-dish"),
  /**
   * Harnai landings decide what is available, so seafood cannot carry a fixed
   * price. Saying this plainly is better copy than a number that turns out to
   * be wrong on the day.
   */
  seafoodPricing: confirmed("Priced on the day, depending on the catch"),
  /**
   * Owner, 17 Aug 2026: printed menu cards are handed to guests at the villa.
   * No dish prices go on the website.
   *
   * CONFLICT WITH BRIEF §6, which states food "cannot go on the site as
   * 'budget range' - guests need numbers". Recorded as the owner's decision
   * rather than resolved silently, per CLAUDE.md working style. The cost is
   * that a group planning meals for 12 cannot budget before they book, so the
   * question moves to the enquiry call instead.
   */
  menu: assumed(
    {
      publishedOnSite: false,
      format: "Printed menu cards, handed over at the villa",
    },
    "Owner's decision not to publish food prices online, against BRIEF §6. Revisit if enquiry calls keep opening with 'how much is the food?'."
  ),
  /** Guests settle with the cook, not the villa. */
  paidTo: assumed(
    "cook-directly",
    "Owner said 'mostly paid to cook'. Site copy therefore says you settle with the cook directly. Confirm whether any cases are billed through the villa - if so the copy needs a second sentence, and those meals fall inside the villa's GST invoice rather than outside it."
  ),
  /** Roughly one meal's notice - tell the cook at breakfast for lunch. */
  noticeRequired: assumed(
    "one-meal-ahead",
    "Owner: about a meal's notice, and explicitly adjustable. Treat as an operating default rather than a fixed policy; the food page should say 'let the cook know a meal ahead' rather than stating a rule."
  ),
  speciality: tbd<string>({
    question:
      "Is there a Konkani or Harnai seafood speciality worth naming on the site?",
    blocks: "Food page colour — the page can ship without it",
    severity: "ops",
  }),
  /** Target copy once the numbers land (BRIEF §6). */
  draftCopy:
    "Our local cook prepares Konkani home food and fresh Harnai seafood on request — approx ₹XXX per person per meal. Order at booking or on arrival. The kitchen is yours to use if you'd rather cook.",
} as const;

// ---------------------------------------------------------------------------
// Contact (BRIEF §8) — phone is the primary channel
// ---------------------------------------------------------------------------

export const contact = {
  address: confirmed({
    property: "Sagar Holiday Homes",
    village: "Saldure",
    taluka: "Dapoli",
    district: "Ratnagiri",
    state: "Maharashtra",
    country: "IN",
    lines: ["Sagar Holiday Homes", "Saldure, Dapoli", "Ratnagiri, Maharashtra"],
  }),
  postalCode: confirmed("415713"),
  /** Pinned at the gate, not the village centre (BRIEF §8). */
  geo: confirmed({ lat: 17.786472, lng: 73.116167 }),
  /**
   * Updated 8 Oct 2026 (owner). Stored in E.164 so tel: links, wa.me links and the
   * OTA listings all read from one value. Display formatting belongs in the
   * component, not here.
   */
  phone: confirmed("+919657582999"),
  /** Same line as the phone number. */
  whatsapp: confirmed("+919657582999"),
  /**
   * Interim address — a Gmail, not one on sagarholidayhomes.com. Usable now,
   * so it renders; stays in the open-items register until a domain mailbox
   * exists, because a @gmail address on a ₹18,000/night listing reads as less
   * established than the property is.
   */
  email: assumed(
    "sagarholidayhomes@gmail.com",
    "Interim Gmail. Replace with an address on the property's own domain once domain email is set up; update the OTA listings and Google Business Profile at the same time."
  ),
  /** State this on the enquiry confirmation, verbatim. */
  callbackWindow: confirmed({
    open: "10:00",
    close: "22:00",
    display: "10am – 10pm",
    confirmationLine: "We'll call you back between 10am and 10pm.",
  }),
} as const;

/**
 * WhatsApp deep link prefilled with the property name (BRIEF §8). Returns null
 * while the number is TBD so callers must handle the pre-launch state rather
 * than rendering a dead link.
 */
export function whatsAppLink(
  message = `Hi, I'd like to enquire about booking ${identity.name}.`
): string | null {
  const number = resolved(contact.whatsapp);
  if (!number) return null;
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

// ---------------------------------------------------------------------------
// Enquiry form (BRIEF §8) — one screen, phone required, email not
// ---------------------------------------------------------------------------

export const enquiryForm = {
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    { name: "email", label: "Email", type: "email", required: false },
    { name: "checkIn", label: "Check-in", type: "date", required: true },
    { name: "checkOut", label: "Check-out", type: "date", required: true },
    {
      name: "guests",
      label: "Number of guests",
      type: "number",
      required: true,
    },
    {
      name: "meals",
      label: "Meals needed",
      type: "select",
      required: false,
      options: ["Yes", "No", "Tell me more"],
    },
    { name: "message", label: "Message", type: "textarea", required: false },
  ],
  maxGuests: facts.occupancy.max.value,
  /**
   * CLAUDE.md static export constraints: "The enquiry form posts to an
   * external endpoint (Web3Forms/Formspree)." The form itself is built and
   * submits to Web3Forms's public API from the browser (no server route
   * needed under `output: 'export'`), but it needs a real access key —
   * NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY — before an enquiry actually arrives
   * anywhere. Nothing to invent here; someone has to create the Web3Forms
   * account and set the env var.
   */
  endpointAccessKey: tbd<string>({
    question:
      "Create a Web3Forms account (or Formspree) and set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY in the deploy environment. Until then the Contact form renders but enquiries submitted through it go nowhere.",
    blocks: "Contact page — the site's primary job (BRIEF §8)",
    severity: "content",
    owner: "developer",
  }),
} as const;

// ---------------------------------------------------------------------------
// Pages & SEO (BRIEF §8)
//
// Titles and descriptions are content, not markup — they belong here, not
// hardcoded into eight generateMetadata() functions. All eight are written
// now that all eight pages are built.
//
// One target query per page, deliberately. Two pages chasing the same phrase
// compete with each other.
// ---------------------------------------------------------------------------

export const pages = {
  home: {
    route: confirmed("/"),
    job: "Positioning, hero image, key facts, enquiry CTA",
    targetQuery: confirmed("Dapoli villa for family groups"),
    title: confirmed(
      "Dapoli Private Pool Villa for Groups | Sagar Holiday Homes"
    ),
    description: confirmed(
      "A 3BHK private-pool villa near Dapoli, sleeping 12. Whole-villa buyout, a 150m cricket ground, orchard, and Saldure beach five minutes away."
    ),
  },
  villa: {
    route: confirmed("/villa"),
    job: "Rooms, occupancy, amenities, floor logic",
    targetQuery: confirmed("3BHK villa Dapoli"),
    title: confirmed("3BHK Villa in Dapoli, Sleeps 12 | Sagar Holiday Homes"),
    description: confirmed(
      "Three air-conditioned bedrooms, three king beds, sleeps 12. Full kitchen, Wi-Fi, generator backup. Whole-villa buyout only — no per-room sales."
    ),
  },
  poolAndGrounds: {
    route: confirmed("/pool-and-grounds"),
    job: "Pool, gazebo, ground, orchard + safety disclosure",
    targetQuery: confirmed("villa with private pool in Dapoli"),
    title: confirmed(
      "Private Pool & 150m Ground, Dapoli | Sagar Holiday Homes"
    ),
    description: confirmed(
      "A private pool under a gazebo, 150m of open ground for cricket, and a 30-tree orchard. Pool dimensions, depth and safety notes, stated plainly."
    ),
  },
  gallery: {
    route: confirmed("/gallery"),
    job: "Photo grid, categorised",
    title: confirmed("Photos — Dapoli Pool Villa | Sagar Holiday Homes"),
    description: confirmed(
      "Photographs of the villa, private pool, 150m ground and coconut-mango orchard at Sagar Holiday Homes in Saldure, Dapoli."
    ),
  },
  food: {
    route: confirmed("/food"),
    job: "Kitchen, cook, sample menu, pricing",
    title: confirmed("Kitchen & Konkani Cook | Sagar Holiday Homes, Dapoli"),
    description: confirmed(
      "A full guest kitchen plus a local cook for home-style Konkani food and fresh Harnai seafood on request. Priced per dish — you settle with the cook directly."
    ),
  },
  location: {
    route: confirmed("/location"),
    job: "Map, drive times, beaches, things to do nearby",
    targetQuery: confirmed("villa near Saldure beach"),
    title: confirmed(
      "Villa Near Saldure Beach, Dapoli | Sagar Holiday Homes"
    ),
    description: confirmed(
      "Sagar Holiday Homes is in Saldure, Dapoli — 5 minutes from Saldure beach, about 4.5–5 hrs from Mumbai or Pune via NH66. Drive times, nearby beaches and landmarks."
    ),
  },
  tariff: {
    route: confirmed("/tariff"),
    job: "Rate card, policy, what's included",
    title: confirmed(
      "Tariff & Booking — Dapoli Villa | Sagar Holiday Homes"
    ),
    description: confirmed(
      "Weekday, weekend and peak rates inclusive of GST, plus the cancellation policy, what the rate covers and stay details for our Dapoli villa."
    ),
  },
  contact: {
    route: confirmed("/contact"),
    job: "Enquiry form, phone, WhatsApp, address",
    title: confirmed("Contact & Enquiries | Sagar Holiday Homes, Dapoli"),
    description: confirmed(
      "Call, WhatsApp or send an enquiry — someone answers 10am to 10pm every day. Sagar Holiday Homes, Saldure, Dapoli, Ratnagiri."
    ),
  },
  faq: {
    route: confirmed("/faq"),
    job: "Answer booking-deciding questions with real, sourced facts",
    targetQuery: confirmed("Dapoli villa frequently asked questions"),
    title: confirmed("FAQ | Sagar Holiday Homes, Dapoli"),
    description: confirmed(
      "Capacity, pool safety, food, Wi-Fi, parking, mango season and booking policy — straight answers about Sagar Holiday Homes in Dapoli."
    ),
  },
} as const;

/** All eight routes as plain strings — for the sitemap and nav. */
export const routes = Object.values(pages).map((p) => p.route.value);

/**
 * Shared shape of `generateMetadata()` across every page: resolve the page's
 * title/description (throwing if either is still `tbd`, so a page can't
 * silently ship with no metadata — CLAUDE.md SEO requirements), and mirror
 * them into `openGraph` so WhatsApp/social previews show the page's own
 * copy rather than falling back to the site-wide default in layout.tsx.
 *
 * The OG image is repeated here rather than left to inherit from
 * layout.tsx: Next.js does not deep-merge a segment's `openGraph` object
 * with its parent's, it replaces it wholesale — so a page that sets
 * `openGraph.title` without also setting `openGraph.images` would silently
 * lose the image, not fall back to the site default.
 *
 * Not typed against next's `Metadata` here so this module stays
 * framework-free; the shape is structurally compatible and every caller
 * spreads it into one.
 */
export function pageMetadata(
  page: { title: Fact<string>; description: Fact<string>; route: Fact<string> },
  label: string
) {
  const title = requireFact(page.title, `${label}.title`);
  const description = requireFact(page.description, `${label}.description`);
  const route = requireFact(page.route, `${label}.route`);
  const ogImage = resolved(seo.defaultOgImage);
  // trailingSlash: true (next.config.ts) serves every route as
  // /path/index.html except the root — match that shape here so the
  // canonical URL matches how the page is actually served.
  const canonicalPath = route === "/" ? "/" : `${route}/`;
  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    robots: siteRobots(),
    openGraph: {
      title,
      description,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
        : [],
    },
  };
}

/**
 * Site-wide indexability gate (CLAUDE.md SEO requirements): noindex until
 * `identity.live` flips at launch. Applied per-page via `pageMetadata()`
 * and as the root-layout default so any route that skips `pageMetadata()`
 * (Next's own /_not-found, or a future page a developer forgets to wire up)
 * still inherits the safe default instead of Next's actual default
 * (indexable).
 */
export function siteRobots(): { index: boolean; follow: boolean } {
  return identity.live
    ? { index: true, follow: true }
    : { index: false, follow: false };
}

export const seo = {
  schemaType: "LodgingBusiness",
  numberOfRooms: facts.bedrooms.value,
  /**
   * WhatsApp sharing is the primary distribution channel here, so this matters
   * more than usual. Per-page OG images can be added as photos arrive; until
   * then every page falls back to the hero shot (BRIEF §9).
   */
  defaultOgImage: confirmed("/og/home-1200x630.jpg"),
} as const;

/**
 * BRIEF §8 SEO requirements: "LodgingBusiness JSON-LD: name, address, geo,
 * amenities, priceRange, numberOfRooms, photos." Rendered site-wide from the
 * root layout rather than per page — one business, one listing. Fields with
 * no resolved value (geo, priceRange while the rate card is still `assumed`
 * — it isn't today, but this stays defensive) are simply omitted:
 * JSON.stringify drops `undefined` properties on its own.
 */
export function lodgingBusinessJsonLd(): Record<string, unknown> {
  const address = contact.address.value;
  const geo = resolved(contact.geo);
  const phone = resolved(contact.phone);
  const email = resolved(contact.email);
  const rateCard = resolved(tariff.rateCard);
  const ogImage = resolved(seo.defaultOgImage);
  const siteUrl = `https://${identity.domain}`;

  return {
    "@context": "https://schema.org",
    "@type": seo.schemaType,
    name: identity.name,
    description: identity.positioning,
    url: `${siteUrl}/`,
    image: ogImage ? `${siteUrl}${ogImage}` : undefined,
    telephone: phone ?? undefined,
    email: email ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: address.village,
      addressRegion: address.state,
      postalCode: contact.postalCode.value,
      addressCountry: address.country,
    },
    geo: geo
      ? { "@type": "GeoCoordinates", latitude: geo.lat, longitude: geo.lng }
      : undefined,
    numberOfRooms: seo.numberOfRooms,
    priceRange: rateCard
      ? `${formatInr(rateCard.weekday.offer)} - ${formatInr(rateCard.peak.offer)}`
      : undefined,
    amenityFeature: amenities.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
    })),
  };
}

// ---------------------------------------------------------------------------
// FAQ (BRIEF §8 gap — audit finding) — every answer sourced from a fact
// already confirmed elsewhere in this module. CLAUDE.md rule 2: never invent
// a property fact. Questions the module has no confirmed answer for
// (unmarried couples/mixed groups, pets, alcohol, advance payment method,
// bringing an outside cook) are deliberately left off this list rather than
// guessed — a wrong published policy is worse than no FAQ entry.
// ---------------------------------------------------------------------------

export const faq: readonly { question: string; answer: string }[] = [
  {
    question: "How many guests does the villa sleep?",
    answer: `${describe.occupancy()}. Rates are built around ${facts.occupancy.base.value} guests, ${facts.occupancy.comfortable.value} is the comfortable number to plan a group around, and ${facts.occupancy.max.value} is the most the villa takes.`,
  },
  {
    question: "Is the pool private, or shared with other guests?",
    answer: `${pool.summary.value}. ${facts.saleModel.value}`,
  },
  {
    question: "Is the pool safe for children?",
    answer: pool.disclosure.value,
  },
  {
    question: "How far is the beach?",
    answer: `Saldure beach is ${describe.beachDistance()}. The villa itself is inland, in the orchard — not sea-facing.`,
  },
  {
    question: "Is there parking for a bus or tempo traveller?",
    answer: facts.parking.value,
  },
  {
    question: "What happens during a power cut?",
    answer: `${facts.backupPower.available.value} backup, covering the ${facts.backupPower.coverage.value}.`,
  },
  {
    question: "Is there Wi-Fi?",
    answer: `Yes — ${describe.wifi()}.`,
  },
  {
    question: "When is mango season?",
    answer: `The orchard's ${facts.orchard.value.season} — that's when the mangoes are ready to pick.`,
  },
  {
    question: "What are check-in and check-out times?",
    answer: `Check-in ${policy.stay.checkIn.value.display}, check-out ${policy.stay.checkOut.value.display}. ${policy.stay.flexibleTimings.value.condition} Early check-in from ${policy.stay.flexibleTimings.value.earlyCheckIn}, late check-out until ${policy.stay.flexibleTimings.value.lateCheckOut}.`,
  },
  {
    question: "Is there a caretaker on site?",
    answer:
      "Yes — a caretaker is on site and can secure the pool enclosure on request.",
  },
  {
    question: "Is there a minimum stay?",
    answer: `${policy.stay.minimumNights.value.standard} night by default, ${policy.stay.minimumNights.value.peak} nights on peak dates. A single-night Saturday carries a ${policy.stay.singleNightSaturdaySurchargePercent.value}% surcharge, since it blocks both the Friday and the Sunday.`,
  },
  {
    question: "Are loud music or late-night parties allowed?",
    answer: policy.stay.quietHours.value.line,
  },
  {
    question: "Is food included, and can we cook ourselves?",
    answer: `${food.kitchen.value}. ${food.cook.value} for home-style Konkani food and fresh Harnai seafood on request — priced per dish, and you settle with the cook directly.`,
  },
  {
    question: "How does booking work?",
    answer: policy.confirmation.value.line,
  },
] as const;

/**
 * FAQPage schema (audit §3.3) — rendered only on /faq, from the same list
 * the page itself displays, so the two can't drift apart.
 */
export function faqJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

// ---------------------------------------------------------------------------
// NOT FOR PUBLICATION
//
// Real facts that must never reach a page or an OTA field. Kept here so nobody
// rediscovers them from a WhatsApp thread and publishes them by accident.
//
// This object is exported for the launch-readiness view only. If a client
// component ever imports from this module, move it to `content/internal.ts` so
// it cannot reach the browser bundle.
// ---------------------------------------------------------------------------

export const internalOnly = {
  /**
   * Occupancy rises to 17 once mattresses go from 3 to 8. DO NOT ADVERTISE
   * until the mattresses are physically on site (BRIEF §2).
   */
  futureMaxOccupancy: 17,
  futureMattressCount: 8,
  /** The property is 3BHK. Never advertise as 4BHK, in any channel. */
  neverAdvertiseAs: ["4BHK"],
  /** Under consideration; would reduce the ground area, which is the lead differentiator. */
  kidsPlayAreaDecision: tbd<boolean>({
    question:
      "Build the kids' play area or drop it? It would eat into the ground, which is the property's lead differentiator.",
    blocks: "Positioning — blocks neither the build nor go-live",
    severity: "ops",
  }),
} as const;

// ---------------------------------------------------------------------------

export const content = {
  identity,
  facts,
  amenities,
  nearbyPlaces,
  pool,
  tariff,
  policy,
  food,
  contact,
  enquiryForm,
  pages,
  seo,
  faq,
} as const;

/** Everything collectOpenItems() walks — public content plus internal decisions. */
const registry = { ...content, internalOnly };

export default content;
