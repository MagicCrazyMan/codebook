<template>
  <div class="h-screen d-flex flex-column justify-center align-center">
    <v-icon size="5rem" icon="mdi-alert-circle-outline"></v-icon>
    <h1 class="font-weight-bold font-italic mt-4">Service Unavailable</h1>
    <v-label class="font-italic">please retry later or contact website administrator</v-label>
    <v-label class="font-italic mt-2">REASON: {{ reason }}</v-label>

    <!-- Example Base URL Editor if Enabled -->
    <div v-if="enableExampleBaseUrlEditor" class="w-50 d-flex align-center mt-10">
      <v-text-field
        variant="outlined"
        label="Base URL"
        density="compact"
        :hide-details="true"
        v-model="url"
      ></v-text-field>
      <v-btn text class="ml-2" @click="reset">reset</v-btn>
      <v-btn text class="ml-2" @click="save">save</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getExampleBaseUrl, resetExampleBaseUrl, setExampleBaseUrl } from "@/apis/example";
import { ref } from "vue";

defineProps({
  reason: {
    required: true,
    type: String,
  },
});

const url = ref(getExampleBaseUrl());
const reset = () => {
  resetExampleBaseUrl();
  url.value = getExampleBaseUrl();
  window.location.reload();
};
const save = () => {
  setExampleBaseUrl(url.value);
  url.value = getExampleBaseUrl();
  window.location.reload();
};
const enableExampleBaseUrlEditor = import.meta.env.VITE_ENABLE_BASE_URL_EDITOR === "true";
</script>
