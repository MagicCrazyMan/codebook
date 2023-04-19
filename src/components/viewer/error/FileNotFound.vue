<template>
  <div v-if="filenames.length !== 0">
    <v-alert closable type="error" border="start" variant="tonal" density="compact">
      <span class="font-weight-bold">{{ filenames[0] }}</span>
      <template v-for="filename of filenames.slice(1, filenames.length - 1)" :key="filename">
        <span>, </span>
        <span class="font-weight-bold">{{ filename }}</span>
      </template>
      <span v-if="filenames.length >= 2"> and </span>
      <span v-if="filenames.length >= 2" class="font-weight-bold">
        {{ filenames[filenames.length - 1] }}</span
      >
      <span> {{ filenames.length === 1 ? " is" : " are" }} marked as existing, but not found </span>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";

defineProps({
  filenames: {
    required: true,
    type: Array as PropType<string[]>,
  },
});
</script>
