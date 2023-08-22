<template>
  <div ref="rootContainer" class="w-100 h-100 canvas-box">
    <iframe
      class="w-100 h-100 canvas-box__iframe"
      :enable-pointer-events="enablePointerEvents"
      :srcdoc="srcdoc"
      ref="iframeContainer"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { PropType, nextTick, onMounted, ref, watch } from "vue";
import { useTheme } from "vuetify";
import { ChapterInstanceCodes } from "./ViewerMain.vue";
import { createIframeDoc } from "./canvasbox";

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

const iframeContainer = ref<HTMLIFrameElement | null>(null);
const rootContainer = ref<HTMLDivElement | null>(null);

const setTheme = (document: Document) => {
  if (!rootContainer.value) return;

  const themeColor =
    getComputedStyle(rootContainer.value).getPropertyValue("--v-theme-surface") ?? "0,0,0";
  document.body.style.setProperty("--v-theme-surface", themeColor);
  document.body.classList.add(theme.current.value.dark ? "sl-theme-dark" : "sl-theme-light");
  document.body.classList.remove(theme.current.value.dark ? "sl-theme-light" : "sl-theme-dark");
  document.body.setAttribute("dark", theme.current.value.dark.toString());
};

/**
 * Reload iframe
 */
const srcdoc = ref("");
const reload = () => {
  const iframe = iframeContainer.value;
  if (!iframe) return;
  const root = rootContainer.value;
  if (!root) return;

  emits("loading");

  const doc = createIframeDoc(
    theme.current.value.dark,
    getComputedStyle(root).getPropertyValue("--v-theme-surface"),
    props.codes?.importMaps,
    props.codes?.html,
    props.codes?.stylesheet,
    props.codes?.script
  );

  if (doc !== srcdoc.value) {
    srcdoc.value = doc;
  } else {
    iframe.contentWindow?.location.reload();
  }

  iframe.addEventListener(
    "load",
    () => {
      const iframeWindow = iframe.contentWindow;
      const iframeDocument = iframe.contentDocument;
      if (!iframeWindow || !iframeDocument) return;

      setTheme(iframeDocument);

      emits("loaded");
    },
    { once: true }
  );
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
    // Wait for theme completely updated
    nextTick(() => {
      const iframeDocument = iframeContainer.value?.contentDocument;
      if (!iframeDocument) return;

      setTheme(iframeDocument);
    });
  },
  { immediate: true }
);

/**
 * Exports canvas content as image
 */
const capture = () => {
  const canvas = iframeContainer.value?.contentDocument?.getElementById(
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
