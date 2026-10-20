import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import obsidian from "./src/lib/obsidian-links.mjs";

export default defineConfig({
  site: "https://bionickernel.com",
  build: { format: "preserve" },
  devToolbar: { enabled: false },
  markdown: { processor: satteri({ mdastPlugins: [obsidian] }) },
});
