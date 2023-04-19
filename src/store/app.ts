// Utilities
import {
  ExampleDescriptor,
  ExampleDescriptorType,
  ExampleDirectory,
  ExampleInstance,
  concatenateExampleUrl,
  getPrelude,
} from "@/apis/example";
import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * App example descriptor
 */
export type AppExampleDescriptor = AppExampleInstance | AppExampleDirectory;

/**
 * App example instance
 */
export type AppExampleInstance = ExampleInstance & {
  fullEntry: string;
  title: string;
  importMaps: AppImportMap[];
  parents: AppExampleDirectory[];
};

/**
 * App example directory
 */
export type AppExampleDirectory = ExampleDirectory & {
  fullEntry: string;
  children: AppExampleDescriptor[];
  parents: AppExampleDirectory[];
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
 * @param instance App example instance
 * @returns Import maps
 */
const resolveInstanceImportMaps = (
  thirdImportMaps: AppImportMap[],
  instance: AppExampleInstance
): AppImportMap[] => {
  const im: AppImportMap[] = [...thirdImportMaps];
  instance.libs.forEach((lib) => {
    // test example base url whether it is a valid url
    let url: string;
    try {
      url = new URL(concatenateExampleUrl(instance.fullEntry, lib)).toString();
    } catch {
      // if not, append location origin to it
      url = new URL(concatenateExampleUrl(instance.fullEntry, lib), location.origin).toString();
    }
    im.push({
      lib: lib,
      type: AppImportMapType.Local,
      url,
    });
  });
  return im;
};

/**
 * Resolve example descriptor
 * @param thirdImportMaps Third party import maps
 * @param parents Parent descriptors
 * @param descriptor Descriptor object
 * @param exampleMaps Map for collecting example
 */
const resolveExampleDescriptor = (
  thirdImportMaps: AppImportMap[],
  parents: AppExampleDirectory[],
  descriptor: ExampleDescriptor,
  exampleMaps: Map<string, AppExampleDescriptor>
) => {
  const appDescriptor = descriptor as AppExampleDescriptor;
  const fullEntry =
    parents.length > 0
      ? `${parents[parents.length - 1].fullEntry}/${descriptor.entry}`
      : `/${descriptor.entry}`;
  appDescriptor.parents = parents;
  appDescriptor.title = appDescriptor.title ?? appDescriptor.entry;
  appDescriptor.fullEntry = fullEntry;

  exampleMaps.set(fullEntry, appDescriptor);

  if (descriptor.type === ExampleDescriptorType.Directory) {
    descriptor.children.forEach((child) => {
      resolveExampleDescriptor(
        thirdImportMaps,
        [...parents, appDescriptor as AppExampleDirectory],
        child,
        exampleMaps
      );
    });
  } else {
    const instance = appDescriptor as AppExampleInstance;
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
const resolveExamplesTree = (thirdImports: Record<string, string>, tree: ExampleDescriptor[]) => {
  const thirdImportMaps = Object.entries(thirdImports).map(([lib, url]) => ({
    type: AppImportMapType.Third,
    lib,
    url,
  }));
  const exampleMaps = new Map<string, AppExampleDescriptor>();
  tree.forEach((descriptor) => {
    resolveExampleDescriptor(thirdImportMaps, [], descriptor, exampleMaps);
  });

  return { tree: tree as AppExampleDescriptor[], map: exampleMaps };
};

export const useAppStore = defineStore("app", () => {
  const isEditing = ref(false);
  const setEditing = (editing: boolean) => {
    isEditing.value = editing;
  };

  const descriptorsTree = ref<AppExampleDescriptor[]>([]);
  const descriptorsMap = ref<Map<string, AppExampleDescriptor>>(new Map());
  const loadPrelude = async () => {
    const { descriptors, imports } = await getPrelude();
    const { tree, map } = resolveExamplesTree(imports, descriptors);
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
