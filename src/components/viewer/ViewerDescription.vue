<template>
  <div>
    <!-- Title & Edit Button -->
    <div class="d-flex align-center">
      <h1>
        {{ instance.title }}
      </h1>
      <v-progress-circular
        v-if="descriptionLoading"
        indeterminate
        size="24"
        class="ml-2"
      ></v-progress-circular>
    </div>

    <!-- GitHub Markdown Styles -->
    <component :is="'style'">{{ dark ? GitHubMarkdownDark : GitHubMarkdownLight }}</component>

    <!-- Loading -->
    <template v-if="descriptionLoading"></template>

    <!-- Display Error If Description Mark as Existing But Not Found -->
    <chapter-file-error
      v-else-if="descriptionError"
      filename="index.md"
      :error="descriptionError"
      @close="descriptionError = null"
    ></chapter-file-error>

    <!-- Description -->
    <div
      v-else-if="description"
      v-html="description"
      class="markdown-body"
      ref="descriptionContainer"
    ></div>

    <!-- Display Introduction If Has No Description -->
    <p v-else-if="!instance.hasDescription && instance.intro">{{ instance.intro }}</p>
  </div>
</template>

<script setup lang="ts">
import { concatenateChapterUrl, getInstanceDescription } from "@/apis/chapter";
import { AppChapterInstance } from "@/store/app";
import DOMPurify from "dompurify";
import GitHubMarkdownDark from "github-markdown-css/github-markdown-dark.css?raw";
import GitHubMarkdownLight from "github-markdown-css/github-markdown-light.css?raw";
import "katex/dist/katex.min.css";
import { Renderer, marked } from "marked";
import markedKatex from "marked-katex-extension";
import mermaid from "mermaid";
import { PropType, computed, ref, watch } from "vue";
import { useTheme } from "vuetify";
import ChapterFileError from "./error/ChapterFileError.vue";

marked.use(markedKatex());

const props = defineProps({
  instance: {
    required: true,
    type: Object as PropType<AppChapterInstance>,
  },
});

const dark = computed(() => useTheme().current.value.dark);

// Marked renderer
const markedRenderer = new Renderer();
const defaultCodeRenderer = markedRenderer.code;
markedRenderer.code = (code, language, isEscaped) => {
  if (language === "mermaid") {
    return '<pre class="mermaid">' + code + "</pre>";
  } else {
    return defaultCodeRenderer.call(markedRenderer, code, language, isEscaped);
  }
};

const description = ref("");
const descriptionLoading = ref(false);
const descriptionError = ref<Error | null>(null);
// Update description when instance changed
watch(
  () => props.instance,
  async (newInstance) => {
    description.value = "";
    descriptionLoading.value = true;
    descriptionError.value = null;

    if (newInstance.hasDescription) {
      let desc: string | Error = await getInstanceDescription(newInstance.fullEntry).catch(
        (err) => err
      );
      // Avoids incorrect overriding
      if (newInstance.fullEntry !== props.instance.fullEntry) return;

      if (desc instanceof Error) {
        descriptionError.value = desc;
      } else {
        description.value = DOMPurify.sanitize(
          marked(desc, {
            renderer: markedRenderer,
            walkTokens: (token) => {
              // normalize base url for images
              if (token.type === "image") {
                token.href = concatenateChapterUrl(token.href);
              }
            },
          })
        );
      }
    }

    descriptionLoading.value = false;
  },
  { immediate: true }
);

const descriptionContainer = ref<HTMLDivElement | null>(null);
watch(descriptionContainer, (container) => {
  if (!container) return;

  container.querySelectorAll(".mermaid").forEach(async (ele, index) => {
    const { svg, bindFunctions } = await mermaid.render(
      `mermaid_${index}`,
      (ele as HTMLPreElement).innerText
    );
    ele.outerHTML = svg;
    if (bindFunctions) {
      bindFunctions?.(ele);
    }
  });
});
</script>

<style lang="less" scoped>
.markdown-body {
  background-color: transparent;
}
</style>
