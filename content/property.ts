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

/** BRIEF §8, Location — name the landmarks people actually search for. */
export const nearbyPlaces = [
  `Saldure beach — ${facts.distances.saldureBeach.value.minutesByCar} minutes`,
  "Murud beach",
  "Harnai fish market",
  "Kelshi",
  "Suvarnadurg fort",
] as const;

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
  /** Pre-launch. Website and property go live together. */
  live: false,
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

export type RateCard = {
  readonly weekday: Inr;
  readonly weekend: Inr;
  readonly peak: Inr;
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
   * PLACEHOLDER, at the owner's request 17 Aug 2026 — NOT signed off.
   *
   * These are the midpoints of the BRIEF §4 benchmark bands (weekday
   * ₹10,000–12,000, weekend ₹15,000–18,000, peak ₹22,000–26,000), which were
   * set against Dapoli villas with pools and adjusted down for 3BHK and no sea
   * view. Held as `assumed` so /tariff can be built and previewed; it stays in
   * the open register, and assertLaunchReady() refuses to pass while any
   * assumed value remains.
   *
   * Treated as GST-INCLUSIVE, matching gst.displayTreatment. If the owner meant
   * these as pre-GST numbers, every figure below rises by 18%.
   */
  rateCard: assumed(
    { weekday: 11_000, weekend: 16_500, peak: 24_000 } satisfies RateCard,
    "PLACEHOLDER - midpoints of the BRIEF §4 benchmark bands, not owner-approved. Must be signed off before the site is public, and read as GST-inclusive. Any page rendering these should label them indicative."
  ),

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
   */
  launchOffer: assumed(
    {
      discountPercent: { from: 20, to: 25 },
      durationMonths: 3,
      condition: "In exchange for a Google review",
    },
    "Recommended launch offer (BRIEF §4). Owner may override the depth or drop it entirely; it must stay framed as a discount off the published rate."
  ),
} as const;

/**
 * CLAUDE.md hard rule 7: no rate appears without its GST treatment. Render this
 * next to every price on every page.
 */
export const gstNote = (): string =>
  requireFact(tariff.gst.displayTreatment, "tariff.gst.displayTreatment") ===
  "inclusive"
    ? `Inclusive of ${tariff.gst.ratePercent.value}% GST`
    : `Plus ${tariff.gst.ratePercent.value}% GST`;

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
  geo: confirmed({ lat: 17.786092, lng: 73.11703 }),
  /**
   * Confirmed 17 Aug 2026. Stored in E.164 so tel: links, wa.me links and the
   * OTA listings all read from one value. Display formatting belongs in the
   * component, not here.
   */
  phone: confirmed("+919833512020"),
  /** Same line as the phone number. */
  whatsapp: confirmed("+919833512020"),
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
} as const;

// ---------------------------------------------------------------------------
// Pages & SEO (BRIEF §8)
//
// Titles and descriptions are content, not markup — they belong here, not
// hardcoded into eight generateMetadata() functions. Each starts as a TBD owned
// by the developer and is replaced with confirmed() when that page is built, so
// a half-built site cannot ship a page with no title.
//
// One target query per page, deliberately. Two pages chasing the same phrase
// compete with each other.
// ---------------------------------------------------------------------------

const pendingCopy = (route: string) =>
  ({
    title: tbd<string>({
      question: `Write the <title> for ${route} — unique across the site.`,
      blocks: `${route} metadata`,
      severity: "content",
      owner: "developer",
    }),
    description: tbd<string>({
      question: `Write the meta description for ${route}.`,
      blocks: `${route} metadata`,
      severity: "content",
      owner: "developer",
    }),
  }) as const;

export const pages = {
  home: {
    route: confirmed("/"),
    job: "Positioning, hero image, key facts, enquiry CTA",
    targetQuery: confirmed("Dapoli villa for family groups"),
    ...pendingCopy("/"),
  },
  villa: {
    route: confirmed("/villa"),
    job: "Rooms, occupancy, amenities, floor logic",
    targetQuery: confirmed("3BHK villa Dapoli"),
    title: confirmed("The Villa — 3BHK, Sleeps 12 | Sagar Holiday Homes, Dapoli"),
    description: confirmed(
      "A whole-villa buyout in Dapoli — 3 air-conditioned bedrooms, 3 king beds, sleeps up to 12. Full kitchen, Wi-Fi, generator backup and more."
    ),
  },
  poolAndGrounds: {
    route: confirmed("/pool-and-grounds"),
    job: "Pool, gazebo, ground, orchard + safety disclosure",
    targetQuery: confirmed("villa with private pool in Dapoli"),
    title: confirmed(
      "Pool & Grounds — Private Pool, 150m Ground | Sagar Holiday Homes, Dapoli"
    ),
    description: confirmed(
      "A private pool under a gazebo, ~150m of open ground for cricket and football, and a 30-tree coconut-mango orchard. Pool dimensions, depth and the safety notice, stated plainly."
    ),
  },
  gallery: {
    route: confirmed("/gallery"),
    job: "Photo grid, categorised",
    ...pendingCopy("/gallery"),
  },
  food: {
    route: confirmed("/food"),
    job: "Kitchen, cook, sample menu, pricing",
    ...pendingCopy("/food"),
  },
  location: {
    route: confirmed("/location"),
    job: "Map, drive times, beaches, things to do nearby",
    targetQuery: confirmed("villa near Saldure beach"),
    title: confirmed(
      "Location — Villa Near Saldure Beach, Dapoli | Sagar Holiday Homes"
    ),
    description: confirmed(
      "Sagar Holiday Homes is in Saldure, Dapoli — 5 minutes from Saldure beach, about 4.5–5 hrs from Mumbai or Pune via NH66. Drive times, nearby beaches and landmarks, and how to find us."
    ),
  },
  tariff: {
    route: confirmed("/tariff"),
    job: "Rate card, policy, what's included",
    ...pendingCopy("/tariff"),
  },
  contact: {
    route: confirmed("/contact"),
    job: "Enquiry form, phone, WhatsApp, address",
    ...pendingCopy("/contact"),
  },
} as const;

/** All eight routes as plain strings — for the sitemap and nav. */
export const routes = Object.values(pages).map((p) => p.route.value);

export const seo = {
  schemaType: "LodgingBusiness",
  numberOfRooms: facts.bedrooms.value,
  /**
   * WhatsApp sharing is the primary distribution channel here, so this matters
   * more than usual. Per-page OG images can be added as photos arrive; until
   * then every page falls back to the hero shot (BRIEF §9).
   */
  defaultOgImage: assumed(
    "/og/placeholder-1200x630.png",
    "PLACEHOLDER - no photography exists yet (BRIEF §9). Replace with the hero shot, the pool with the orchard behind it, at 1200x630. Until then every WhatsApp share of this site previews a placeholder, so this must be swapped before the link is given to a guest."
  ),
} as const;

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
} as const;

/** Everything collectOpenItems() walks — public content plus internal decisions. */
const registry = { ...content, internalOnly };

export default content;
