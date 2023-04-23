/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_TITLE: string;
  readonly VITE_ENABLE_BASE_URL_EDITOR: string;
  readonly VITE_EXAMPLE_BASE_URL: string;
  readonly VITE_ENABLE_SSE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "marked-katex-extension" {
  import type { marked } from "marked";
  export default function (options?: { throwOnError?: boolean }): marked.MarkedExtension;
}
