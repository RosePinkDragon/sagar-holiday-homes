/** @type {import('next-sitemap').IConfig} */

// Mirrors identity.live in content/property.ts, which reads the same
// NEXT_PUBLIC_SITE_LIVE env var. Can't import that module directly — this
// is a plain CommonJS postbuild script and the repo has no ts-node, so the
// env var itself (not either file) is the actual shared source of truth.
//
// Local testing: `next build` auto-loads .env* files but next-sitemap has
// no dotenv dependency, so the "live" branch only runs locally if you
// `export NEXT_PUBLIC_SITE_LIVE=true` in the shell before `pnpm build`. On
// Vercel this is a non-issue — dashboard env vars cover the whole build
// command, including postbuild.
const siteIsLive = process.env.NEXT_PUBLIC_SITE_LIVE === "true";

module.exports = {
  // Keep in sync with identity.domain in content/property.ts.
  siteUrl: "https://sagarholidayhomes.com",
  outDir: "./out",
  generateRobotsTxt: true,
  // DESIGN.md: delete /styleguide before launch, or exclude it and noindex
  // it in the meantime. The page already sets robots: {index:false}; this
  // keeps it out of sitemap.xml too.
  exclude: ["/styleguide", "/styleguide/"],
  robotsTxtOptions: {
    policies: siteIsLive
      ? [{ userAgent: "*", allow: "/" }]
      : [{ userAgent: "*", disallow: "/" }],
  },
};
