import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import pakket from "./package.json" with { type: "json" };

// "los" bouwt één zelfstandig HTML-bestand (om te bekijken zonder server, of te mailen).
export default defineConfig(({ mode }) => ({
  base: "./",
  define: { __VERSIE__: JSON.stringify(pakket.version) },
  plugins: mode === "los" ? [react(), viteSingleFile()] : [react()],
  build: {
    outDir: mode === "los" ? "dist-los" : "dist",
    assetsInlineLimit: mode === "los" ? 100_000_000 : 4096,
  },
}));
