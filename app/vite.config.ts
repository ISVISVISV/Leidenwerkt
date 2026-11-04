import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// "los" bouwt één zelfstandig HTML-bestand (om te mailen of offline te openen).
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: mode === "los" ? [react(), viteSingleFile()] : [react()],
  build: {
    outDir: mode === "los" ? "dist-los" : "dist",
    assetsInlineLimit: mode === "los" ? 100_000_000 : 4096,
  },
}));
