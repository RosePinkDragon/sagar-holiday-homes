import { photoFallback, photoSrcSet, photos, type PhotoId } from "@/content/photos";

/**
 * Renders a pre-optimised villa photo (public/photos, built by
 * scripts/optimize-images.mjs). `next/image` can't help here — the site is a
 * static export with `unoptimized: true`, so it would ship the file as-is —
 * so this serves AVIF, then WebP, in three widths via <picture>.
 *
 * Fills its parent (position: relative + an aspect ratio on the parent),
 * like `next/image` with `fill`. Width/height are still set so the browser
 * knows the intrinsic ratio.
 */
export default function Photo({
  id,
  sizes,
  priority = false,
}: {
  id: PhotoId;
  sizes: string;
  priority?: boolean;
}) {
  const { alt, width, height } = photos[id];
  const focus = (photos[id] as { focus?: string }).focus;
  return (
    <picture>
      <source type="image/avif" srcSet={photoSrcSet(id, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={photoSrcSet(id, "webp")} sizes={sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoFallback(id)}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: focus,
        }}
      />
    </picture>
  );
}
