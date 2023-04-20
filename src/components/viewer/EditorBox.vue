<template>
  <div class="h-100 d-flex flex-column">
    <!-- Files Selector -->
    <v-tabs
      :mandatory="!isCodesLoading"
      show-arrows
      class="editor-box__tabs flex-grow-0 flex-shrink-0"
      density="comfortable"
      v-model="currentSelectedTab"
    >
      <v-tab
        v-if="importMapsTab"
        class="editor-box__tab"
        :value="importMapsTab"
        :readonly="importMapsTab.readonly"
      >
        {{ hasEditedTitleFormatter(importMapsTab) }}
      </v-tab>
      <v-tab
        v-for="tab in editableCodesTabs"
        :key="tab.id"
        class="editor-box__tab"
        :value="tab"
        :readonly="tab.readonly"
      >
        {{ hasEditedTitleFormatter(tab) }}
      </v-tab>
      <v-tab
        v-for="(tab, index) of libraryCodesTabs"
        :key="tab.id"
        class="editor-box__tab"
        :value="tab"
        :readonly="tab.readonly"
      >
        {{ tab.title }}
        <v-btn
          class="ml-2"
          size="x-small"
          variant="text"
          density="compact"
          icon="mdi-close-circle"
          @click="removeLibraryCodeTabByIndex(index)"
        ></v-btn>
      </v-tab>
    </v-tabs>

    <!-- Draggable Divider  -->
    <v-divider></v-divider>

    <!-- Code Editor -->
    <code-editor
      v-show="
        currentSelectedTab?.type === 'EditableCode' || currentSelectedTab?.type === 'LibraryCode'
      "
      class="flex-grow-1 flex-shrink-1"
      :tab="currentSelectedTab"
    ></code-editor>
    <!-- Import Maps Editor -->
    <import-maps-editor
      ref="importMapsEditor"
      v-show="currentSelectedTab?.type === 'ImportMaps'"
      class="flex-grow-1 flex-shrink-1"
      :tab="currentSelectedTab"
      @review="addLibraryCodeTabByImportMap"
    ></import-maps-editor>
  </div>
</template>

<script setup lang="ts">
import { getTextFile } from "@/apis/example";
import { AppImportMap } from "@/store/app";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { Extension } from "@codemirror/state";
import { PropType, nextTick, ref, watch } from "vue";
import { ExampleInstanceScripts } from "./ViewerMain.vue";
import { Tab, TabEditor, TabType } from "./editor";
import CodeEditor from "./editor/CodeEditor.vue";
import ImportMapsEditor from "./editor/ImportMapsEditor.vue";

const EditableCodeType: Record<string, { id: string; lang: () => Extension }> = {
  Javascript: { id: "JAVASCRIPT", lang: javascript },
  HTML: { id: "HTML", lang: html },
  Stylesheet: { id: "STYLESHEET", lang: css },
};

/**
 * Creates a tab for editable code
 * @param param0 Editable code type
 * @param code Source code
 */
const createEditableCodeTab = <K extends keyof typeof EditableCodeType>(
  { id, lang }: (typeof EditableCodeType)[K],
  code: string
) => {
  return {
    type: "EditableCode",
    id,
    title: id,
    code,
    readonly: false,
    codeLoaded: true,
    hasModified: false,
    lang,
    editor: TabEditor.Code,
    setCode(newCode) {
      if (this.code !== newCode) {
        this.code = newCode;
        this.hasModified = true;
      }
    },
  } as Tab<"EditableCode">;
};
/**
 * Creates a tab for library code which is uneditable
 * @param id Tab id
 * @param title Tab title
 * @param url URL of the library code
 */
const createLibraryCodeTab = (id: string, title: string, url: string) => {
  return {
    type: "LibraryCode",
    id,
    title,
    readonly: true,
    codeLoaded: false,
    lang: javascript,
    editor: TabEditor.Code,
    async getCode() {
      if (!this.codeLoaded) {
        this.code = await getTextFile(url);
        this.codeLoaded = true;
      }

      return this.code;
    },
  } as Tab<"LibraryCode">;
};
/**
 * Creates a tab for import maps
 * @param importMaps Import maps
 */
const createImportMapsTab = (importMaps: AppImportMap[]) => {
  return {
    type: "ImportMaps",
    id: "IMPORT MAPS",
    title: "IMPORT MAPS",
    importMaps,
    readonly: false,
    hasModified: false,
    editor: TabEditor.ImportMaps,
    getImportMaps() {
      return this.importMaps!;
    },
    addImportMap(importMap) {
      this.importMaps.push(importMap);
      this.hasModified = true;
    },
    removeImportMapByIndex(index) {
      this.importMaps!.splice(index, 1);
      this.hasModified = true;
    },
  } as Tab<"ImportMaps">;
};

const props = defineProps({
  isCodesLoading: {
    required: true,
    type: Boolean,
  },
  codes: {
    required: false,
    type: Object as PropType<ExampleInstanceScripts>,
  },
});
const emits = defineEmits<{
  (event: "update:codes", codes: ExampleInstanceScripts): void;
  (event: "tab", tab?: Tab<keyof TabType>): void;
}>();

// Any code that has ever modified, display a star at last
const hasEditedTitleFormatter = (tab: Tab<"ImportMaps" | "EditableCode">) =>
  tab?.hasModified ? `${tab.title} *` : tab.title;

const importMapsTab = ref<Tab<"ImportMaps"> | undefined>(undefined);
const editableCodesTabs = ref<Tab<"EditableCode">[]>([]);
const libraryCodesTabs = ref<Tab<"LibraryCode">[]>([]);
const currentSelectedTab = ref<Tab<keyof TabType> | undefined>(undefined);
// Reloads tabs when codes reload
watch(
  () => props.isCodesLoading,
  (isCodesLoading) => {
    if (isCodesLoading) {
      importMapsTab.value = undefined;
      editableCodesTabs.value = [];
      libraryCodesTabs.value = [];
      currentSelectedTab.value = undefined;
    } else {
      const { importMaps, script, html, stylesheet } = props.codes!;
      importMapsTab.value = createImportMapsTab(importMaps);
      editableCodesTabs.value = [
        createEditableCodeTab(EditableCodeType.Javascript, script),
        createEditableCodeTab(EditableCodeType.HTML, html),
        createEditableCodeTab(EditableCodeType.Stylesheet, stylesheet),
      ];
      currentSelectedTab.value = editableCodesTabs.value[0];
    }
  },
  { immediate: true }
);
// Emits parent component when tab selection changed
watch(
  currentSelectedTab,
  (tab) => {
    emits("tab", tab);
  },
  { immediate: true }
);

/**
 * Save codes
 */
const save = () => {
  if (!importMapsTab.value || !editableCodesTabs.value) return;

  const importMaps = [...importMapsTab.value.importMaps];
  const [script, html, stylesheet] = editableCodesTabs.value.map((tab) => tab.code);

  emits("update:codes", {
    importMaps,
    script,
    html,
    stylesheet,
  });

  importMapsTab.value.hasModified = false;
  editableCodesTabs.value.forEach((tab) => {
    tab.hasModified = false;
  });
};

/**
 * Adds library code tab by import map
 * @param importMap Import map
 */
const addLibraryCodeTabByImportMap = ({ lib, url }: AppImportMap) => {
  if (!libraryCodesTabs.value) return;

  const tab = libraryCodesTabs.value.find(({ id }) => id === lib);
  if (tab) {
    currentSelectedTab.value = tab;
  } else {
    libraryCodesTabs.value.push(createLibraryCodeTab(lib, lib, url));
    nextTick(() => {
      currentSelectedTab.value = libraryCodesTabs.value[libraryCodesTabs.value.length - 1];
    });
  }
};
/**
 * Removes library code tab by index
 * @param index tab index
 */
const removeLibraryCodeTabByIndex = (index: number) => {
  libraryCodesTabs.value?.splice(index, 1);
  /**
   * Vuetify bug (or maybe it is a feature? i have no idea)
   *
   * After splicing tab from `libraryCodesTabs`,
   * v-model will update `currentSelectedTab` to `undefined` AFTER `nextTick` (even after multiple `nextTick`).
   * It is weird, but `setTimeout` solve this problem, so i use it here.
   */
  setTimeout(() => {
    currentSelectedTab.value =
      libraryCodesTabs.value?.[libraryCodesTabs.value.length - 1] ?? editableCodesTabs.value[2];
  }, 0);
};

const importMapsEditor = ref<InstanceType<typeof ImportMapsEditor> | null>(null);
defineExpose({
  save,
  showImportMapDialog: () => importMapsEditor.value?.showImportMapDialog(),
});
</script>

<style lang="less" scoped>
.editor-box__tabs {
  .v-btn {
    text-transform: none;
  }
}

.editor-box__tab {
  &[readonly] {
    font-style: italic;
    font-size: 400;
  }
}
</style>
