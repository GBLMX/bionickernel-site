# bionickernel.com

Static site served by nginx on Alibaba Cloud ECS (116.62.81.128) over the
`bionickernel.com` / `www` A records; TLS from Let's Encrypt, HTTP/2 + HTTP/3 (QUIC).

## Pages

- `/index.html` — landing page (KDE palette: CachyOS Nord dark, Breeze Light light); hero backdrop is a WebGL2 fluid-noise canvas with pointer influence.
- `/books/` — recommended-books page: inclusion criteria, topics, entry format.
- `/skins/` — interactive Minecraft skin renders, 3D via vendored `skinview3d`.
- `/essays/history-and-math.html` — essay: history and mathematics as the two axes of learning a field.

## Assets

- `assets/books.js` — books page filter: topic chips + live search, progressive enhancement (all entries stay visible without JS).
- `assets/fluid.js` — hero art: WebGL2 domain-warped noise, palette from `--art-1..4`; still frame under reduced motion, CSS gradient without WebGL2.
- `assets/site.css` — shared shell: design tokens, sidebar layout (collapses to a top bar at ≤900px), typography, buttons, cards.
- `assets/skins/*.png` — cropped static previews (fallback when WebGL is off).
- `assets/skins/tex/*.png` — 64×64 skin textures used by the 3D viewer.
- `assets/skinview3d.bundle.js` — skinview3d 3.4.2 bundle (MIT).

Skins are original artwork by the site author; source files and the generation
tool are open-sourced in [skin-skill](https://github.com/GBLMX/skin-skill).
ICP: 苏ICP备2026079470号.
