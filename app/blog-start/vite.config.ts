import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";
import font from "vite-plugin-font";
import tsconfigPaths from "vite-tsconfig-paths";

const explicitStaticPaths = [
  "/",
  "/post",
  "/archive",
  "/account/notification",
  "/feed.xml",
  "/sitemap-index.xml",
  "/sitemap-0.xml",
  "/robots.txt",
  "/404",
  "/achieve",
];

export default defineConfig({
  server: {
    port: 3000,
  },
  preview: {
    host: "127.0.0.1",
    port: 3000,
  },
  ssr: {
    external: ["sharp"],
  },
  plugins: [
    tsconfigPaths(),
    font.vite(),
    tanstackStart({
      rsc: {
        enabled: true,
      },
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        autoStaticPathsDiscovery: true,
        concurrency: 1,
        crawlLinks: true,
        failOnError: true,
        retryCount: 2,
        filter: ({ path }) => !path.startsWith("/api/"),
      },
      pages: explicitStaticPaths.map((path) => ({
        path,
        prerender: { enabled: true },
      })),
    }),
    rsc(),
    tailwindcss(),
    react(),
  ],
});
