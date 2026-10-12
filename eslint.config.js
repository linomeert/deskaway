import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y-x";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/dist", "**/coverage"]),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          // vite.config.ts lives in tsconfig.node.json, not the nearest tsconfig.json.
          allowDefaultProject: ["apps/web/vite.config.ts"],
          defaultProject: "apps/web/tsconfig.node.json",
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Project rule: no `as` casts. Infer types from Zod schemas instead.
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
    },
  },
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    extends: [
      reactHooks.configs.flat["recommended-latest"],
      jsxA11y.configs.recommended,
    ],
    languageOptions: { globals: globals.browser },
  },
  {
    files: [
      "apps/api/**/*.ts",
      "packages/shared/**/*.ts",
      "*.config.ts",
      "apps/web/*.config.ts",
    ],
    languageOptions: { globals: globals.node },
  },
  prettier,
]);
