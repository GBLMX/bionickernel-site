// Writes robots.txt and sitemap.xml from the built HTML.
// Runs automatically via npm's postbuild hook after `npm run build`.
import fs from "node:fs";
import path from "node:path";

const DIST = "dist";
const ORIGIN = "https://bionickernel.com";

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const urls = walk(DIST)
  .filter((file) => file.endsWith(".html"))
  .map((file) => path.relative(DIST, file).split(path.sep).join("/"))
  .filter((rel) => rel !== "404.html")
  .map((rel) => {
    if (rel === "index.html") return "/";
    if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
    return `/${rel}`;
  })
  .sort();

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${ORIGIN}${url}</loc></url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;

fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(DIST, "robots.txt"), robots);
console.log(`postbuild: sitemap.xml (${urls.length} urls), robots.txt`);
