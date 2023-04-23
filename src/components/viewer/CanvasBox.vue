<template>
  <div ref="rootContainer" class="w-100 h-100 canvas-box">
    <iframe
      class="w-100 h-100 canvas-box__iframe"
      :enable-pointer-events="enablePointerEvents"
      ref="iframeContainer"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { v4 } from "uuid";
import { PropType, nextTick, onMounted, ref, watch } from "vue";
import { useTheme } from "vuetify";
import { ExampleInstanceScripts } from "./ViewerMain.vue";

const props = defineProps({
  codes: {
    required: false,
    type: Object as PropType<ExampleInstanceScripts>,
  },
  enablePointerEvents: {
    type: Boolean,
    required: false,
    default: false,
  },
  showSaveButton: {
    required: false,
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits<{
  (event: "loading"): void;
  (event: "loaded"): void;
}>();

let lastLoadId = v4();
const iframeContainer = ref<HTMLIFrameElement | null>(null);
const rootContainer = ref<HTMLDivElement | null>(null);

const setThemeCSSVariables = (document: Document) => {
  if (!rootContainer.value) return;

  const themeColor =
    getComputedStyle(rootContainer.value).getPropertyValue("--v-theme-surface") ?? "0,0,0";
  document.body.style.setProperty("--v-theme-surface", themeColor);
  document.body.setAttribute("dark-theme", theme.current.value.dark.toString());
};

const appendBasicElements = (document: Document) => {
  // Append canvas
  const canvas = document.createElement("canvas");
  canvas.classList.add("canvas-box__canvas");
  canvas.id = "canvas";
  document.body.appendChild(canvas);

  // Append default stylesheet
  const defaultStylesheet = document.createElement("style");
  defaultStylesheet.innerHTML = `
    html, body {
      width: 100vw;
      height: 100vh;
      padding: 0;
      margin: 0;
      overflow: hidden;
      background-color: rgb(var(--v-theme-surface))
    }

    body[dark-theme="true"] {
      .dark-color {
        color: white;
      }
    }

    .canvas-box__canvas {
      width: 100%;
      height: 100%;
      z-index: 1;
      position: absolute;
      top: 0;
      left: 0;
    }

    .canvas-box__controls {
      width: 100%;
      height: 100%;
      z-index: 2;
      position: absolute;
      top: 0;
      left: 0;

      pointer-events: none;

      > * {
        pointer-events: all;
      }

      > .control-item {
        margin: 1rem;
        width: fit-content;
      }
    }
`;
  document.body.appendChild(defaultStylesheet);
};

const appendImportsMap = (document: Document) => {
  const importMaps = props.codes?.importMaps;
  if (!importMaps) return;

  const imports = importMaps.reduce((result, { lib, url }) => {
    result[lib] = url;
    return result;
  }, {} as Record<string, string>);
  const importsMap = document.createElement("script");
  importsMap.type = "importmap";
  importsMap.innerHTML = JSON.stringify({ imports });
  document.body.appendChild(importsMap);
  document.currentScript?.after(importsMap);
};

const appendHTML = (document: Document) => {
  const code = props.codes?.html;
  if (!code) return;

  const container = document.createElement("div");
  container.classList.add("canvas-box__controls");
  container.innerHTML = code;
  document.body.appendChild(container);
};

const appendStylesheet = (document: Document) => {
  const code = props.codes?.stylesheet;
  if (!code) return;

  const stylesheet = document.createElement("style");
  stylesheet.innerHTML = code;
  document.body.appendChild(stylesheet);
};

const appendScript = (document: Document) => {
  const code = props.codes?.script;
  if (!code) return;

  const script = document.createElement("script");
  script.type = "module";
  script.innerHTML = code;
  document.body.appendChild(script);
};

/**
 * Reload code
 */
const reload = async () => {
  const iframe = iframeContainer.value;
  if (!iframe) return;
  let iframeWindow = iframe.contentWindow;
  if (!iframeWindow) return;

  emits("loading");

  const currentLoadId = v4();
  lastLoadId = currentLoadId;
  await new Promise((resolve) => {
    iframe.addEventListener("load", resolve, { once: true });
    if (iframeWindow) iframeWindow.location.reload();
  });

  // Avoids incorrect overriding
  if (currentLoadId !== lastLoadId) return;

  const iframeDocument = iframeWindow.document;
  setThemeCSSVariables(iframeDocument);
  appendImportsMap(iframeDocument);
  appendBasicElements(iframeDocument);
  appendHTML(iframeDocument);
  appendStylesheet(iframeDocument);
  // script must be appended after HTML and stylesheet loaded
  appendScript(iframeDocument);

  emits("loaded");
};

onMounted(() => {
  // Watch example, load example into iframe
  watch(() => props.codes, reload, { immediate: true });
});

// Switches iframe background-color when theme changed
// NOTE: doing this because allowtransparency not works after change page
const theme = useTheme();
watch(
  theme.current,
  () => {
    const iframe = iframeContainer.value?.contentWindow?.document;
    if (!iframe) return;

    // Wait next tick for theme completely updated
    nextTick(() => {
      setThemeCSSVariables(iframe);
    });
  },
  { immediate: true }
);

/**
 * Exports canvas content as image
 */
const capture = () => {
  const canvas = iframeContainer.value?.contentWindow?.document?.getElementById(
    "canvas"
  ) as HTMLCanvasElement;
  if (!canvas) return;

  const dataUrl = canvas.toDataURL("image/png");
  const downloader = document.createElement("a");
  downloader.href = dataUrl;
  downloader.download = `${new Date().toISOString()}.png`;
  downloader.click();
  URL.revokeObjectURL(dataUrl);
};

defineExpose({
  reload,
  capture,
});
</script>

<style lang="less" scoped>
.canvas-box {
  position: relative;
}

.canvas-box__iframe {
  z-index: 1000;
  border: 0;
  pointer-events: none;
  user-select: none;

  &[enable-pointer-events="true"] {
    pointer-events: all;
  }
}
</style>
