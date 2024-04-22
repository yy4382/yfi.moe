/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly ALGOLIA_WRITE_API_KEY: string;
  readonly ARTICLE_PAT: string;
  // more env variables... 
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}