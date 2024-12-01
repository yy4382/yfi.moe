// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/env.d.ts" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*?filepath" {
  const value: string;
  export default value;
}
