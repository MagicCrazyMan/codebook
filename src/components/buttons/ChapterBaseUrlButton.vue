<template>
  <v-overlay
    location-strategy="connected"
    location="top center"
    origin="auto"
    :width="mobile ? '20rem' : '30rem'"
    :scrim="false"
  >
    <template #activator="{ props }">
      <v-btn variant="plain" icon="mdi-console-line" :ripple="false" v-bind="props"></v-btn>
    </template>

    <chapter-base-url-editor class="editor pa-2"></chapter-base-url-editor>
  </v-overlay>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import ChapterBaseUrlEditor from "./ChapterBaseUrlEditor.vue";

const mobile = useDisplay().mobile;
</script>

<style lang="less" scoped>
.editor {
  background-color: rgb(var(--v-theme-surface));
  border-radius: 6px;
}
</style>
