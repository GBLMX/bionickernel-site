import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://bionickernel.com",
  build: { format: "preserve" },
  devToolbar: { enabled: false },
});
