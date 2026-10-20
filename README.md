# bionickernel.com

Static site served by nginx on Alibaba Cloud ECS (116.62.81.128) over the
`bionickernel.com` / `www` A records; TLS from Let's Encrypt, HTTP/2 + HTTP/3 (QUIC).

## Pages

- `/index.html` — landing page (KDE palette: CachyOS Nord dark, Breeze Light light).
- `/books/` — recommended-books page: inclusion criteria, topics, entry format.
- `/skins/` — interactive Minecraft skin renders, 3D via vendored `skinview3d`.

## Assets

- `assets/site.css` — shared shell: design tokens, sidebar layout (collapses to a top bar at ≤900px), typography, buttons, cards.
- `assets/skins/*.png` — cropped static previews (fallback when WebGL is off).
- `assets/skins/tex/*.png` — 64×64 skin textures used by the 3D viewer.
- `assets/skinview3d.bundle.js` — skinview3d 3.4.2 bundle (MIT).

Skins are original artwork by the site author; source files and the generation
tool are open-sourced in [skin-skill](https://github.com/GBLMX/skin-skill).
ICP: 苏ICP备2026079470号.
