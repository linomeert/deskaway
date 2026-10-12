import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// The root package.json holds the release version (release-please bumps it).
import rootPackage from "../../package.json" with { type: "json" };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(rootPackage.version),
  },
  server: {
    proxy: {
      // 127.0.0.1 instead of localhost: on Windows localhost can resolve to ::1,
      // while the API listens on IPv4.
      "/api": "http://127.0.0.1:3000",
    },
  },
});
