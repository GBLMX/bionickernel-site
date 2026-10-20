# bionickernel.com

Static site served by nginx on Alibaba Cloud ECS (116.62.81.128) over the
`bionickernel.com` A record; `www` redirects to the apex. TLS from Let's Encrypt,
HTTP/2 + HTTP/3 (QUIC).

## Stack

[Astro](https://astro.build) with static output. `build.format: "preserve"` keeps the
existing URLs (`/books/`, `/skins/`, `/essays/history-and-math.html`). No UI framework:
four small vanilla scripts in `public/assets` handle the hero shader, sidebar, and
books filter. `scripts/postbuild.mjs` writes `robots.txt` and `sitemap.xml`;
`scripts/check-dist.mjs` validates links, head tags, and generated files.

## Commands

```sh
npm install
npm run dev      # dev server
npm run build    # dist/ + robots.txt + sitemap.xml
npm run check    # validate the built output
```

## Deploy

Pushing to `main` runs `.github/workflows/build.yml`: install, build, check, rsync
`dist/` to `/var/www/bionickernel.com/`, then compare live SHA-256 hashes with the
build. Pull requests run the build and checks only.

Required repository secrets: `DEPLOY_SSH_KEY` (private key for the `deployer` user),
`DEPLOY_KNOWN_HOSTS`, `DEPLOY_HOST`, `DEPLOY_USER`.

Manual deploy (same target, requires root or `deployer` access):

```sh
npm run build
rsync -az --delete --exclude=.well-known/ dist/ aliyun:/var/www/bionickernel.com/
ssh aliyun 'chown -R deployer:deployer /var/www/bionickernel.com'
```

## Server

`deploy/nginx/bionickernel.conf` is the source of truth for the nginx vhost. It sets
the `www` redirect, HSTS, CSP and the other security headers, a one-hour cache for
`/assets/`, and the `404.html` error page. Install it in
`/etc/nginx/sites-available/`, symlink into `sites-enabled/`, then
`nginx -t && systemctl reload nginx`.

## Content

- Essays live as HTML bodies in `src/content/essays/` and are registered in
  `src/data/essays.ts` (slug, title, description, date). Read time is computed from the
  body by `src/lib/reading-time.ts`; the index at `/essays/` and the RSS feed at
  `/rss.xml` are generated from the registry.
- Book entries are inline in `src/pages/books/index.astro`; topics drive the filter.
- Skins and their textures are in `public/assets/skins/`.
- `public/assets/og.png` (1200×630) is the social preview image. Regenerate with
  `magick` using the site palette if the identity changes.

## Structure

- `src/layouts/BaseLayout.astro` — head metadata (OG/Twitter/JSON-LD), RSS link,
  sidebar/footer, global scripts.
- `src/layouts/SubpageLayout.astro` — subpage shell: eyebrow, title, optional lede
  (prop or `lede` slot for rich text) and `meta` slot for bylines; wraps BaseLayout.
- `src/components/Sidebar.astro` — navigation, collapse toggle, `aria-current` state.
- `src/components/Footer.astro` — copyright, ICP, hosting line.
- `src/pages/index.astro` — landing page: hero art, sections, contact.
- `src/pages/books/index.astro` — recommended books: criteria, topics, entries.
- `src/pages/skins/index.astro` — interactive Minecraft skin renders.
- `src/pages/essays/index.astro` — essay list and reading times.
- `src/pages/essays/history-and-math.astro` — essay shell; body comes from content.
- `src/pages/404.astro` — branded not-found page.
- `src/pages/rss.xml.ts` — RSS 2.0 feed.
- `public/assets/site.css` — shared shell: tokens, sidebar layout (top bar at ≤900px,
  desktop rail toggle), typography, buttons, cards.
- `public/assets/sidebar.js` — collapse toggle (persisted in localStorage) and
  scrollspy for `#picks` / `#contact`.
- `public/assets/books.js` — books filter: topic chips + live search, progressive
  enhancement.
- `public/assets/fluid.js` — hero art: WebGL2 domain-warped noise; still frame under
  reduced motion, CSS gradient without WebGL2.
- `public/assets/skinview3d.bundle.js` — skinview3d 3.4.2 bundle (MIT).

Skins are original artwork by the site author; source files and the generation tool
are open-sourced in [skin-skill](https://github.com/GBLMX/skin-skill).
ICP: 苏ICP备2026079470号.
