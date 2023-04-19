import { AppImportMap } from "@/store/app";
import { Extension } from "@codemirror/state";

/**
 * Tab type
 */
export type TabType = {
  EditableCode: {
    code: string;
    codeLoaded: boolean;
    hasModified: boolean;
    lang: () => Extension;
    setCode(code: string): void;
  };
  LibraryCode: {
    code?: string;
    codeLoaded: boolean;
    lang: () => Extension;
    getCode(): Promise<string>;
  };
  ImportMaps: {
    importMaps: AppImportMap[];
    hasModified: boolean;
    addImportMap(importMap: AppImportMap): void;
    removeImportMapByIndex(index: number): void;
  };
};

/**
 * Editor that the tab should use
 */
export enum TabEditor {
  Code,
  ImportMaps,
}

/**
 * Tab
 */
export type Tab<K extends keyof TabType> = {
  type: K;
  id: string;
  title: string;
  readonly: boolean;
  editor: TabEditor;
} & TabType[K];
