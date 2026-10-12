/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Set in vite.config.ts from the root package.json.
  readonly VITE_APP_VERSION: string;
}
