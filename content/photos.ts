/**
 * Real villa photography. Files live in public/photos and are produced by
 * `node scripts/optimize-images.mjs` (AVIF + WebP at 480/960/1600px). Alt text
 * describes only what is visible in the frame — no inferred amenities, no
 * view claims (CLAUDE.md rules 2 and 5). Width/height are the intrinsic pixel
 * size, kept here so the markup can reserve space and avoid layout shift.
 */

type PhotoMeta = {
  file: string;
  width: number;
  height: number;
  alt: string;
  /** CSS object-position, for photos whose subject sits off-centre and gets cropped in wide bands. */
  focus?: string;
};

export const photos = {
  // Exterior
  "exterior-sunset": {
    file: "img-0494",
    width: 4032,
    height: 3024,
    alt: "Two-storey villa with a pitched roof and an outside staircase, with a tiled courtyard in front, at sunset",
  },
  "exterior-night": {
    file: "dsc3338",
    width: 6000,
    height: 4000,
    alt: "Two-storey villa lit up at night, with warm lights along the roofline and the outside staircase",
  },
  "aerial-dusk": {
    file: "dji-0955",
    width: 4032,
    height: 3024,
    alt: "Aerial view at dusk of the villa and its tiled approach, with green fields and trees all around",
    focus: "50% 78%",
  },
  "aerial-approach": {
    file: "dji-0957",
    width: 4032,
    height: 3024,
    alt: "Aerial view of the villa and the tiled path leading to it, with fields and trees on both sides",
    focus: "50% 75%",
  },
  "aerial-fields": {
    file: "dji-0958",
    width: 4032,
    height: 3024,
    alt: "Aerial view of the villa and its tiled path, with green fields and trees around and a neighbouring building in the foreground",
    focus: "50% 60%",
  },
  "exterior-night-lamp": {
    file: "dsc3343",
    width: 6000,
    height: 4000,
    alt: "Two-storey villa lit up at night, seen past a glowing courtyard lamp",
  },
  "bedroom-blue-dresser": {
    file: "dsc3366",
    width: 6000,
    height: 4000,
    alt: "Bedroom with blue walls, a wooden bed, a mirrored dressing table and a large wooden wardrobe",
  },
  "aerial-night": {
    file: "dji-0013",
    width: 4032,
    height: 3024,
    alt: "Aerial view of the villa lit up at night, with the tiled courtyard and trees around it",
  },

  // Pool terrace
  "pool-wide": {
    file: "dsc3392",
    width: 6000,
    height: 4000,
    alt: "Small tiled pool on a covered terrace with a steel railing, wooden loungers and a table, lit at night",
  },
  "pool-loungers": {
    file: "dsc3386",
    width: 6000,
    height: 4000,
    alt: "Tiled pool with wooden sun loungers and side tables beside it, on a covered terrace at night",
  },
  "pool-seating": {
    file: "dsc3395",
    width: 6000,
    height: 4000,
    alt: "Cane-and-wood chairs and a coffee table on the terrace beside the pool, at night",
  },
  "pool-edge-loungers": {
    file: "dsc3397",
    width: 6000,
    height: 4000,
    alt: "Two wooden sun loungers with a side table next to the edge of the pool, at night",
  },
  "terrace-seating": {
    file: "dsc3388",
    width: 6000,
    height: 4000,
    alt: "Terrace seating with rocking chairs, armchairs and a wooden coffee table under lights at night",
  },

  // Bedrooms
  "bedroom-blue": {
    file: "img-0501",
    width: 4032,
    height: 2268,
    alt: "Bedroom with blue walls, a wooden bed, a dressing table with a mirror and a large wooden wardrobe",
  },
  "bedroom-blue-ac": {
    file: "img-0500",
    width: 4032,
    height: 2268,
    alt: "Bedroom with blue walls, a wooden bed, an air conditioner and a wood-panelled ceiling",
  },
  "bedroom-lilac": {
    file: "img-0506",
    width: 4032,
    height: 2268,
    alt: "Bedroom with lilac walls, a wooden bed with a floral bedsheet and an air conditioner",
  },
  "bedroom-lilac-2": {
    file: "img-0507",
    width: 4032,
    height: 2268,
    alt: "Lilac bedroom with a wooden bed, a bedside table and a window",
  },
  "bedroom-cream": {
    file: "img-0519",
    width: 5712,
    height: 4284,
    alt: "Bedroom with cream walls, a wooden bed, a wall-mounted TV and a wooden wardrobe",
  },
  "bedroom-cream-2": {
    file: "img-0520",
    width: 4032,
    height: 3024,
    alt: "Cream-walled bedroom with a wooden bed, a wardrobe, a wall-mounted TV and an air conditioner",
  },
  "bedroom-cream-bed": {
    file: "img-0521",
    width: 5712,
    height: 4284,
    alt: "Wooden bed with a patterned bedsheet and a bedside table, next to a dressing table",
  },

  // Bathrooms
  "bathroom-patterned": {
    file: "img-0502",
    width: 4032,
    height: 2268,
    alt: "Bathroom with patterned wall tiles, a wash basin, a toilet and a water heater",
  },
  "bathroom-grey": {
    file: "img-0508",
    width: 4032,
    height: 2268,
    alt: "Bathroom with grey checked wall tiles, a wash basin and a toilet",
  },

  // Kitchen and sitting area
  "kitchen-counter": {
    file: "img-0512",
    width: 5712,
    height: 4284,
    alt: "Kitchen counter with a sink and blue cabinets, next to a refrigerator",
  },
  "sitting-kitchen": {
    file: "img-0509",
    width: 5712,
    height: 4284,
    alt: "Sitting area with a grey sofa, armchairs and a wooden coffee table, with a refrigerator beside the kitchen counter",
  },
  "sitting-sofa": {
    file: "img-0511",
    width: 5712,
    height: 4284,
    alt: "Grey sofa set and a wooden coffee table in the sitting area",
  },
} as const satisfies Record<string, PhotoMeta>;

export type PhotoId = keyof typeof photos;

export const PHOTO_WIDTHS = [480, 960, 1600] as const;

export function photoSrcSet(id: PhotoId, format: "avif" | "webp"): string {
  const { file } = photos[id];
  return PHOTO_WIDTHS.map((w) => `/photos/${file}-${w}.${format} ${w}w`).join(", ");
}

/** Fallback `src` for browsers that ignore `<source>`. */
export function photoFallback(id: PhotoId): string {
  return `/photos/${photos[id].file}-960.webp`;
}
