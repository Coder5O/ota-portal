import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

// Every runtime dependency is pre-bundled at startup so a package first imported mid-session
// doesn't cause Vite to re-bundle and load a second React on the server.
// Excluded: React itself and TanStack Start/Router (their plugin bundles them).
const NOT_PREBUNDLED = new Set([
  "react",
  "react-dom",
  "@tanstack/react-start",
  "@tanstack/react-router",
  "@tanstack/react-router-ssr-query",
  "tailwindcss-animate",
]);
const { dependencies } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const PREBUNDLE = Object.keys(dependencies).filter((name) => !NOT_PREBUNDLED.has(name));

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  optimizeDeps: { include: PREBUNDLE },
  plugins: [
    tanstackStart({ srcDirectory: "src" }),
    nitro(),
    react(),
  ],
});
