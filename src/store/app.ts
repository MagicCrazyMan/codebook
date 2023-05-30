// Utilities
import {
  ChapterDescriptor,
  ChapterDescriptorType,
  ChapterDirectory,
  ChapterInstance,
  concatenateChapterUrl,
  getPrelude,
} from "@/apis/chapter";
import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * App chapter descriptor
 */
export type AppChapterDescriptor = AppChapterInstance | AppChapterDirectory;

/**
 * App chapter instance
 */
export type AppChapterInstance = ChapterInstance & {
  fullEntry: string;
  title: string;
  importMaps: AppImportMap[];
  parents: AppChapterDirectory[];
};

/**
 * App chapter directory
 */
export type AppChapterDirectory = ChapterDirectory & {
  fullEntry: string;
  children: AppChapterDescriptor[];
  parents: AppChapterDirectory[];
};

/**
 * App import map type
 */
export enum AppImportMapType {
  Third,
  Local,
}

/**
 * App import map
 */
export type AppImportMap = {
  type: AppImportMapType;
  lib: string;
  url: string;
};

/**
 * Resolves instance relative imports into ECMAScript module import maps
 * @param thirdImportMaps Third party import maps
 * @param instance App chapter instance
 * @returns Import maps
 */
const resolveInstanceImportMaps = (
  thirdImportMaps: AppImportMap[],
  instance: AppChapterInstance
): AppImportMap[] => {
  const im: AppImportMap[] = [...thirdImportMaps];
  instance.libs.forEach((lib) => {
    // test chapter base url whether it is a valid url
    let url: string;
    try {
      url = new URL(concatenateChapterUrl(instance.fullEntry, lib)).toString();
    } catch {
      // if not, append location origin to it
      url = new URL(concatenateChapterUrl(instance.fullEntry, lib), location.origin).toString();
    }
    im.push({
      type: AppImportMapType.Local,
      lib,
      url,
    });
  });
  return im;
};

/**
 * Resolve chapter descriptor
 * @param thirdImportMaps Third party import maps
 * @param parents Parent descriptors
 * @param descriptor Descriptor object
 * @param chapterMaps Map for collecting chapter
 */
const resolveChapterDescriptor = (
  thirdImportMaps: AppImportMap[],
  parents: AppChapterDirectory[],
  descriptor: ChapterDescriptor,
  chapterMaps: Map<string, AppChapterDescriptor>
) => {
  const appDescriptor = descriptor as AppChapterDescriptor;
  const fullEntry =
    parents.length > 0
      ? `${parents[parents.length - 1].fullEntry}/${descriptor.entry}`
      : `/${descriptor.entry}`;
  appDescriptor.parents = parents;
  appDescriptor.title = appDescriptor.title ?? appDescriptor.entry;
  appDescriptor.fullEntry = fullEntry;

  chapterMaps.set(fullEntry, appDescriptor);

  if (descriptor.type === ChapterDescriptorType.Directory) {
    descriptor.children.forEach((child) => {
      resolveChapterDescriptor(
        thirdImportMaps,
        [...parents, appDescriptor as AppChapterDirectory],
        child,
        chapterMaps
      );
    });
  } else {
    const instance = appDescriptor as AppChapterInstance;
    instance.importMaps = resolveInstanceImportMaps(thirdImportMaps, instance);
  }
};

/**
 * Resolves descriptors tree by canalizes path,
 * and collect it into a map with a concatenated entry field as its key.
 * @param thirdImports Third party imports
 * @param tree Raw descriptors tree
 * @returns Descriptors map
 */
const resolveChaptersTree = (thirdImports: Record<string, string>, tree: ChapterDescriptor[]) => {
  const thirdImportMaps = Object.entries(thirdImports).map(([lib, url]) => ({
    type: AppImportMapType.Third,
    lib,
    url,
  }));
  const chapterMaps = new Map<string, AppChapterDescriptor>();
  tree.forEach((descriptor) => {
    resolveChapterDescriptor(thirdImportMaps, [], descriptor, chapterMaps);
  });

  return { tree: tree as AppChapterDescriptor[], map: chapterMaps };
};

export const useAppStore = defineStore("app", () => {
  const isEditing = ref(false);
  const setEditing = (editing: boolean) => {
    isEditing.value = editing;
  };

  const descriptorsTree = ref<AppChapterDescriptor[]>([]);
  const descriptorsMap = ref<Map<string, AppChapterDescriptor>>(new Map());
  const loadPrelude = async () => {
    const { descriptors, imports } = await getPrelude();
    const { tree, map } = resolveChaptersTree(imports, descriptors);
    descriptorsTree.value = tree;
    descriptorsMap.value = map;
  };

  return {
    isEditing,
    setEditing,
    descriptorsTree,
    descriptorsMap,
    loadPrelude,
  };
});
