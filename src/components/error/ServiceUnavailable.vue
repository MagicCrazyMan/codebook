<template>
  <div class="h-screen d-flex flex-column justify-center align-center">
    <v-icon size="5rem" icon="mdi-alert-circle-outline"></v-icon>
    <h1 class="font-weight-bold font-italic mt-4">Service Unavailable</h1>
    <v-label class="font-italic">please retry later or contact website administrator</v-label>
    <v-label class="font-italic mt-2">REASON: {{ reason }}</v-label>

    <!-- Example Base URL Editor if Enabled -->
    <example-base-url-editor
      v-if="enableExampleBaseUrlEditor"
      class="editor mt-4"
      :mobile="mobile"
    ></example-base-url-editor>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import ExampleBaseUrlEditor from "../buttons/ExampleBaseUrlEditor.vue";

defineProps({
  reason: {
    required: true,
    type: String,
  },
});

const mobile = useDisplay().mobile;

const enableExampleBaseUrlEditor = import.meta.env.VITE_ENABLE_BASE_URL_EDITOR === "true";
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
