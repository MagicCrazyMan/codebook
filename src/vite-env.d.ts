/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  /**
   * Webpage title
   */
  readonly VITE_TITLE: string;
  /**
   * Chapter resources base url
   */
  readonly VITE_CHAPTERS_BASE_URL: string;
  /**
   * Enable chapter base url editor
   */
  readonly VITE_ENABLE_CHAPTERS_BASE_URL_EDITOR: string;
  /**
   * Enable Server-Side Event connection for live update
   */
  readonly VITE_ENABLE_CHAPTERS_SSE_LIVE_UPDATE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "marked-katex-extension" {
  import type { marked } from "marked";
  export default function (options?: { throwOnError?: boolean }): marked.MarkedExtension;
}
