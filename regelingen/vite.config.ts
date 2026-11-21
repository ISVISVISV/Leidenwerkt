import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pakket from "./package.json" with { type: "json" };

export default defineConfig({
  base: "./",
  define: { __VERSIE__: JSON.stringify(pakket.version) },
  plugins: [react()],
  build: { outDir: "dist" },
});
