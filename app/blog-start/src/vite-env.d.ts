/// <reference types="vite/client" />

declare module "*.svg?raw" {
  const content: string;
  export default content;
}

declare module "*.ttf?url" {
  const url: string;
  export default url;
}
