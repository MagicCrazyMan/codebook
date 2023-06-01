<template>
  <div class="h-screen d-flex flex-column justify-center align-center">
    <v-icon size="5rem" icon="mdi-alert-circle-outline"></v-icon>
    <h1 class="font-weight-bold font-italic mt-4">Service Unavailable</h1>
    <v-label class="font-italic">please retry later or contact website administrator</v-label>
    <v-label class="font-italic mt-2">REASON: {{ reason }}</v-label>

    <!-- Chapter Base URL Editor if Enabled -->
    <chapter-base-url-editor
      v-if="enableChapterBaseUrlEditor"
      class="editor mt-4"
      :mobile="mobile"
    ></chapter-base-url-editor>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import ChapterBaseUrlEditor from "../buttons/ChapterBaseUrlEditor.vue";
import { PropType } from "vue";
import { computed } from "vue";
import { RequestError } from "@/apis";

const props = defineProps({
  error: {
    required: true,
    type: Object as PropType<any>,
  },
});

const mobile = useDisplay().mobile;

const reason = computed(() => {
  if (props.error instanceof RequestError) {
    switch (props.error.status) {
      case 502:
      case 404:
        return "data server unavailable";
      default:
        return props.error.message;
    }
  } else if (props.error instanceof Error) {
    return "data server unavailable";
  } else {
    return props.error.toString();
  }
});
const enableChapterBaseUrlEditor = import.meta.env.VITE_ENABLE_CHAPTERS_BASE_URL_EDITOR === "true";
</script>

<style lang="less" scoped>
.editor {
  &[mobile="true"] {
    width: 100%;
    max-width: 20rem;
  }

  &[mobile="false"] {
    width: 40rem;
  }
}
</style>
