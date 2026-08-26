import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  /**
   * Dev-only. Lets a phone on the same LAN load `next dev` via this
   * machine's local IP (http://192.168.0.113:PORT) — without it, Next 15's
   * cross-origin dev check silently breaks hydration for requests from any
   * origin other than localhost, so buttons render but their onClick never
   * gets wired up. No effect on the static export build.
   */
  // allowedDevOrigins: ["your-local-ip"],
};

export default nextConfig;
