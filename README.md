# bionickernel.com

Static site served by nginx on Alibaba Cloud ECS (116.62.81.128) over the
`bionickernel.com` / `www` A records; TLS from Let's Encrypt, HTTP/2 + HTTP/3 (QUIC).

## Stack

[Astro](https://astro.build) with static output. `build.format: "preserve"` keeps the
existing URLs (`/books/`, `/skins/`, `/essays/history-and-math.html`). No UI framework:
three small vanilla scripts in `public/assets` handle the hero shader, sidebar, and
books filter.

## Commands

```sh
npm install
npm run dev      # dev server
npm run build    # writes dist/
```

Deploy (after `npm run build`):

```sh
rsync -az --delete dist/ aliyun:/var/www/bionickernel.com/
```

## Structure

- `src/layouts/BaseLayout.astro` — document head, meta, sidebar/footer, global scripts.
- `src/components/Sidebar.astro` — navigation, collapse toggle, `aria-current` state.
- `src/components/Footer.astro` — copyright, ICP, hosting line.
- `src/pages/index.astro` — landing page: hero art, sections, contact.
- `src/pages/books/index.astro` — recommended books: criteria, topics, entries.
- `src/pages/skins/index.astro` — interactive Minecraft skin renders.
- `src/pages/essays/history-and-math.astro` — essay: history and mathematics as the two axes of learning a field.
- `public/assets/site.css` — shared shell: design tokens, sidebar layout (collapses to a top bar at ≤900px; desktop rail toggle), typography, buttons, cards.
- `public/assets/sidebar.js` — collapse toggle (persisted in localStorage) and in-page scrollspy for `#picks` / `#contact`.
- `public/assets/books.js` — books page filter: topic chips + live search, progressive enhancement (all entries stay visible without JS).
- `public/assets/fluid.js` — hero art: WebGL2 domain-warped noise, palette from `--art-1..4`; still frame under reduced motion, CSS gradient without WebGL2.
- `public/assets/skins/*.png` — cropped static previews (fallback when WebGL is off).
- `public/assets/skins/tex/*.png` — 64×64 skin textures used by the 3D viewer.
- `public/assets/skinview3d.bundle.js` — skinview3d 3.4.2 bundle (MIT).

Skins are original artwork by the site author; source files and the generation
tool are open-sourced in [skin-skill](https://github.com/GBLMX/skin-skill).
ICP: 苏ICP备2026079470号.
