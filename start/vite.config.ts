import { defineConfig } from "vite";

// Een gewone HTML-pagina zonder React: alleen de huisstijl en twee links.
export default defineConfig({
  base: "./",
  build: { outDir: "dist" },
});
