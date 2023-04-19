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
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
