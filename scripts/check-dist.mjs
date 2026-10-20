// Validates the built site: local links resolve, required head tags exist,
// sitemap covers every page, and the social/robots files are present.
import fs from "node:fs";
import path from "node:path";

const DIST = "dist";
const ORIGIN = "https://bionickernel.com";
const errors = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function pageUrl(rel) {
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

function resolveLocal(ref) {
  const clean = decodeURIComponent(ref.split("#")[0].split("?")[0]);
  if (!clean.startsWith("/") || clean.startsWith("//")) return null;
  const base = path.join(DIST, clean);
  const candidates = clean.endsWith("/")
    ? [path.join(base, "index.html")]
    : [base, `${base}.html`, path.join(base, "index.html")];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? candidates[0];
}

const files = walk(DIST);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const pages = htmlFiles.map((file) => path.relative(DIST, file).split(path.sep).join("/"));

for (const file of htmlFiles) {
  const rel = path.relative(DIST, file).split(path.sep).join("/");
  const html = fs.readFileSync(file, "utf8");
  const url = pageUrl(rel);

  for (const [label, pattern] of [
    ["title", /<title>[^<]+<\/title>/],
    ["description", /<meta name="description" content="[^"]+"/],
    ["canonical", new RegExp(`<link rel="canonical" href="${ORIGIN.replace(/[.]/g, "\\.")}${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`)],
    ["og:image", /<meta property="og:image" content="https:\/\/bionickernel\.com\/assets\/og\.png"/],
    ["twitter card", /<meta name="twitter:card" content="summary_large_image"/],
    ["rss", /<link rel="alternate" type="application\/rss\+xml"/],
  ]) {
    if (!pattern.test(html)) errors.push(`${rel}: missing ${label}`);
  }

  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const target = resolveLocal(match[1]);
    if (target && !fs.existsSync(target)) errors.push(`${rel}: broken local ref ${match[1]}`);
  }
}

for (const required of ["robots.txt", "sitemap.xml", "404.html", "assets/og.png", "rss.xml"]) {
  if (!fs.existsSync(path.join(DIST, required))) errors.push(`missing ${required}`);
}

const sitemap = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
const robots = fs.readFileSync(path.join(DIST, "robots.txt"), "utf8");
for (const rel of pages.filter((rel) => rel !== "404.html")) {
  const loc = `${ORIGIN}${pageUrl(rel)}`;
  if (!sitemap.includes(`<loc>${loc}</loc>`)) errors.push(`sitemap missing ${loc}`);
}
if (!robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) errors.push("robots.txt missing sitemap line");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`check-dist: ${pages.length} pages ok`);
