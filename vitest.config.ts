import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        extends: "./apps/web/vite.config.ts",
        test: {
          name: "web",
          root: "./apps/web",
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
        },
      },
      {
        test: {
          name: "api",
          root: "./apps/api",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "shared",
          root: "./packages/shared",
          environment: "node",
          // Pin a timezone with DST so date math bugs fail locally and in CI alike.
          env: { TZ: "Europe/Amsterdam" },
          include: ["src/**/*.test.ts"],
        },
      },
    ],
  },
});
