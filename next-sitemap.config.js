/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // Keep in sync with identity.domain in content/property.ts.
  siteUrl: "https://sagarholidayhomes.com",
  outDir: "./out",
  generateRobotsTxt: true,
  // DESIGN.md: delete /styleguide before launch, or exclude it and noindex
  // it in the meantime. The page already sets robots: {index:false}; this
  // keeps it out of sitemap.xml too.
  exclude: ["/styleguide", "/styleguide/"],
};
