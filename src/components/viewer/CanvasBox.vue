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
import { ChapterInstanceCodes } from "./ViewerMain.vue";
import { concatenateChapterUrl } from "@/apis/chapter";

const props = defineProps({
  codes: {
    required: false,
    type: Object as PropType<ChapterInstanceCodes>,
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
  document.body.classList.add(theme.current.value.dark ? "sl-theme-dark" : "sl-theme-light");
  document.body.classList.remove(theme.current.value.dark ? "sl-theme-light" : "sl-theme-dark");
  document.body.setAttribute("dark", theme.current.value.dark.toString());
};

const wrapIframeFetch = (window: Window) => {
  const nativeFetch = window.fetch;
  const wrappedFetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    if (url.startsWith("data:")) {
      return nativeFetch(url, init);
    } else {
      return nativeFetch(concatenateChapterUrl(input.toString()), init);
    }
  };
  window.fetch = wrappedFetch;
};

const appendBasicElements = (document: Document) => {
  // Append shoelace
  const shoelace = document.createElement("script");
  shoelace.type = "module";
  shoelace.src = "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.7.0/cdn/shoelace.js";
  document.body.appendChild(shoelace);

  // Append canvas
  const canvas = document.createElement("canvas");
  canvas.classList.add("canvas-box__canvas");
  canvas.id = "canvas";
  document.body.appendChild(canvas);

  // Append default stylesheet
  const defaultStylesheet = document.createElement("style");
  defaultStylesheet.innerHTML = `
    @import url("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.7.0/cdn/themes/dark.css");
    @import url("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.7.0/cdn/themes/light.css");

    html, body {
      width: 100vw;
      height: 100vh;
      padding: 0;
      margin: 0;
      overflow: hidden;
      background-color: rgb(var(--v-theme-surface))
    }

    body[dark="true"] {
      color: white;
    }

    .canvas-box__canvas {
      width: 100%;
      height: 100%;
      z-index: 1;
      position: absolute;
      top: 0;
      left: 0;
    }

    .canvas-box__controllers {
      width: 100%;
      height: 100%;
      z-index: 2;
      position: absolute;
      top: 0;
      left: 0;

      pointer-events: none;
    }
    
    .controllers {
      width: fit-content;

      margin: 0.5rem;
      padding: 0.5rem;
      
      background-color: rgba(var(--v-theme-surface), 0.8);
      border-radius: 6px;
      box-shadow: 1px 1px 4px grey;
      pointer-events: all;

      display: grid;
      grid-template-columns: max-content auto;
      align-items: center;
      row-gap: 0.5rem;
      column-gap: 1rem;
    }

    .controller {
      display: flex;
    }


    .controller__title {
      font-weight: bold;
    }

    .components {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .component {
      display: flex;
      justify-content: start;
      align-items: center;
      column-gap: 0.5rem;
    }
`;
  document.body.appendChild(defaultStylesheet);
};

const appendImportsMap = (document: Document) => {
  const importMaps = props.codes?.importMaps;
  if (!importMaps) return;

  const imports = importMaps.reduce(
    (result, { lib, url }) => {
      result[lib] = url;
      return result;
    },
    {} as Record<string, string>
  );
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
  container.classList.add("canvas-box__controllers");
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

  wrapIframeFetch(iframeWindow);

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
  // Watch chapter, load chapter into iframe
  watch(() => props.codes, reload, { immediate: true });
});

// Switches iframe background-color when theme changed
// NOTE: doing this because allowtransparency not works after changing page
const theme = useTheme();
watch(
  theme.current,
  () => {
    const iframeDocument = iframeContainer.value?.contentWindow?.document;
    if (!iframeDocument) return;

    // Wait for theme completely updated
    nextTick(() => {
      setThemeCSSVariables(iframeDocument);
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
