<template>
  <v-overlay
    location-strategy="connected"
    location="top center"
    origin="auto"
    width="30rem"
    :scrim="false"
  >
    <template #activator="{ props }">
      <v-btn
        variant="plain"
        icon="mdi-console-line"
        :ripple="false"
        v-bind="props"
        @click="open"
      ></v-btn>
    </template>

    <div class="container d-flex align-center pa-2">
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
  </v-overlay>
</template>

<script setup lang="ts">
import { getExampleBaseUrl, resetExampleBaseUrl, setExampleBaseUrl } from "@/apis/example";
import { ref } from "vue";

const url = ref(getExampleBaseUrl());
const open = () => {
  url.value = getExampleBaseUrl();
};
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
</script>

<style lang="less" scoped>
.container {
  background-color: rgb(var(--v-theme-surface));
  border-radius: 6px;
}
</style>
