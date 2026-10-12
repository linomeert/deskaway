import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 127.0.0.1 instead of localhost: on Windows localhost can resolve to ::1,
      // while the API listens on IPv4.
      "/api": "http://127.0.0.1:3000",
    },
  },
});
