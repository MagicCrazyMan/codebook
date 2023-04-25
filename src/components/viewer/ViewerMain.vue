<template>
  <div class="d-flex flex-column">
    <!-- Buttons in Desktop Mode -->
    <desktop-buttons
      v-if="!mobile"
      class="flex-grow-0 flex-shrink-0"
      :selected-tab="currentSelectTab"
      :save="save"
      :reload="reload"
      :capture="capture"
      :show-import-map-dialog="showImportMapDialog"
      :is-editing="isEditing"
      :is-codes-loading="isCodesLoading"
      :is-canvas-loading="isCanvasLoading"
    ></desktop-buttons>
    <!-- Buttons in Mobile Mode -->
    <mobile-buttons
      v-else
      :selected-tab="currentSelectTab"
      :save="save"
      :reload="reload"
      :capture="capture"
      :show-import-map-dialog="showImportMapDialog"
      :is-editing="isEditing"
      :is-codes-loading="isCodesLoading"
      :is-canvas-loading="isCanvasLoading"
    ></mobile-buttons>

    <!-- Example File Error -->
    <example-file-error
      v-for="({ filename, error }, index) of codesFileErrors"
      :key="filename"
      class="flex-grow-0 flex-shrink-0 mt-2"
      :filename="filename"
      :error="error"
      @close="codesFileErrors.splice(index, 1)"
    ></example-file-error>

    <div
      ref="viewerContainer"
      class="example-viewer flex-grow-1 flex-shrink-1 mt-2"
      :mobile="mobile"
    >
      <!-- Editor Box -->
      <v-card v-if="isEditing" :style="editorDivide" class="example-viewer__editor-box elevation-4">
        <v-progress-linear v-show="isCodesLoading" indeterminate></v-progress-linear>
        <editor-box
          v-show="!isCodesLoading"
          ref="editorBox"
          :is-codes-loading="isCodesLoading"
          v-model:codes="codes"
          @tab="(tab) => (currentSelectTab = tab)"
        ></editor-box>
      </v-card>

      <!-- Horizontal Resizer -->
      <horizontal-resizer v-if="!mobile && isEditing" v-model="divide"></horizontal-resizer>

      <!-- Canvas Box -->
      <v-card :style="canvasDivide" class="example-viewer__canvas-box elevation-4">
        <v-progress-linear v-show="isCodesLoading" indeterminate></v-progress-linear>
        <canvas-box
          v-show="!isCodesLoading"
          ref="canvasBox"
          show-save-button
          enable-pointer-events
          :codes="codes"
          @loading="isCanvasLoading = true"
          @loaded="isCanvasLoading = false"
        ></canvas-box>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  HTML_FILENAME,
  JAVASCRIPT_FILENAME,
  STYLESHEET_FILENAME,
  getInstanceHTML,
  getInstanceJavascript,
  getInstanceStylesheet,
} from "@/apis/example";
import CanvasBox from "@/components/viewer/CanvasBox.vue";
import EditorBox from "@/components/viewer/EditorBox.vue";
import { AppExampleInstance, AppImportMap, useAppStore } from "@/store/app";
import { PropType, computed, ref, watch } from "vue";
import { useDisplay } from "vuetify";
import HorizontalResizer from "./HorizontalResizer.vue";
import DesktopButtons from "./buttons/DesktopButtons.vue";
import MobileButtons from "./buttons/MobileButtons.vue";
import { Tab, TabType } from "./editor";
import ExampleFileError from "./error/ExampleFileError.vue";

/**
 * Example instance script codes
 */
export type ExampleInstanceScripts = {
  script: string;
  html: string;
  stylesheet: string;
  importMaps: AppImportMap[];
};

const mobile = useDisplay().mobile;
const appStore = useAppStore();
const props = defineProps({
  instance: {
    required: true,
    type: Object as PropType<AppExampleInstance>,
  },
});

// Horizontal sizing
const divide = ref(0.5);
const editorDivide = computed(() => `flex-basis: ${divide.value * 100}%`);
const canvasDivide = computed(() =>
  isEditing.value ? `flex-basis: ${(1 - divide.value) * 100}%` : "flex-basis: 100%"
);

const codes = ref<ExampleInstanceScripts | undefined>(undefined);
const codesFileErrors = ref<{ filename: string; error: Error }[]>([]);
const canvasBox = ref<InstanceType<typeof CanvasBox> | undefined>(undefined);
const editorBox = ref<InstanceType<typeof EditorBox> | undefined>(undefined);
const isEditing = computed(() => appStore.isEditing);
const isCodesLoading = ref(false);
const isCanvasLoading = ref(false);
const currentSelectTab = ref<Tab<keyof TabType> | undefined>(undefined);
// Reloads codes when instance changed
watch(
  () => props.instance,
  async (newInstance) => {
    isCodesLoading.value = true;
    codes.value = undefined;
    codesFileErrors.value = [];

    if (newInstance) {
      const promises: Promise<string | Error>[] = [];
      promises.push(getInstanceJavascript(newInstance.fullEntry).catch((err) => err));
      promises.push(
        newInstance.hasHTML
          ? getInstanceHTML(newInstance.fullEntry).catch((err) => err)
          : Promise.resolve("")
      );
      promises.push(
        newInstance.hasStylesheet
          ? getInstanceStylesheet(newInstance.fullEntry).catch((err) => err)
          : Promise.resolve("")
      );

      let [script, html, stylesheet] = await Promise.all(promises);
      // Avoids incorrect overriding
      if (newInstance.fullEntry !== props.instance.fullEntry) return;

      // filter error
      if (script instanceof Error) {
        codesFileErrors.value.push({ filename: JAVASCRIPT_FILENAME, error: script });
        script = "";
      }
      if (html instanceof Error) {
        codesFileErrors.value.push({ filename: HTML_FILENAME, error: html });
        html = "";
      }
      if (stylesheet instanceof Error) {
        codesFileErrors.value.push({ filename: STYLESHEET_FILENAME, error: stylesheet });
        stylesheet = "";
      }

      codes.value = {
        script,
        html,
        stylesheet,
        importMaps: [...newInstance.importMaps],
      };
      isCodesLoading.value = false;
    }
  },
  { immediate: true }
);

const save = () => {
  if (!editorBox.value) return;

  editorBox.value.save();
};
const reload = () => {
  if (!canvasBox.value) return;

  if (editorBox.value) editorBox.value.save();
  canvasBox.value.reload();
};
const capture = () => {
  if (!canvasBox.value) return;

  canvasBox.value.capture();
};
const showImportMapDialog = () => {
  if (!editorBox.value) return;

  editorBox.value.showImportMapDialog();
};
</script>

<style lang="less" scoped>
.example-viewer__editor-box {
  z-index: 2;
}

.example-viewer__canvas-box {
  z-index: 1;
}

.example-viewer {
  // Constrain code zone and canvas box separately in mobile mode
  &[mobile="true"] {
    .example-viewer__editor-box,
    .example-viewer__canvas-box {
      min-width: 22.5rem;
      height: 30rem;
    }

    .example-viewer__editor-box {
      margin-bottom: 2rem;
    }
  }

  // Constrain the size of the whole viewer in desktop mode
  // since code zone and canvas box in flexbox and row direction in mobile mode
  &[mobile="false"] {
    display: flex;
    flex-direction: row;
    min-width: 40rem;
    min-height: 22.5rem;
  }
}
</style>
