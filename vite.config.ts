import { defineConfig } from "vite";
export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/-mia-ruso/" : "/",
  define: { __STATIC_SITE__: JSON.stringify(mode === "pages") },
  server: { proxy: { "/api": "http://127.0.0.1:3000", "/join": "http://127.0.0.1:3000" } },
}));
