<template>
  <div class="container" :mobile="mobile">
    <v-text-field
      class="text-field"
      variant="outlined"
      label="Base URL"
      density="compact"
      :hide-details="true"
      v-model="url"
    ></v-text-field>
    <v-btn class="reset-btn" :elevation="mobile ? 2 : undefined" @click="reset">reset</v-btn>
    <v-btn class="save-btn" :elevation="mobile ? 2 : undefined" @click="save">save</v-btn>
  </div>
</template>

<script setup lang="ts">
import { getChapterBaseUrl, resetChapterBaseUrl, setChapterBaseUrl } from "@/apis/chapter";
import { ref } from "vue";
import { useDisplay } from "vuetify";

const mobile = useDisplay().mobile;

const url = ref(getChapterBaseUrl());
const reset = () => {
  resetChapterBaseUrl();
  url.value = getChapterBaseUrl();
  window.location.reload();
};
const save = () => {
  setChapterBaseUrl(url.value);
  url.value = getChapterBaseUrl();
  window.location.reload();
};
</script>

<style lang="less" scoped>
.container {
  width: 100%;

  display: grid;
  row-gap: 0.5rem;
  column-gap: 0.5rem;

  &[mobile="true"] {
    grid-template-areas: "input input" "reset save";
  }

  &[mobile="false"] {
    grid-template-areas: "input reset save";
    grid-template-columns: auto min-content min-content;
  }
}

.text-field {
  grid-area: input;
}

.reset-btn {
  grid-area: reset;
}

.save-btn {
  grid-area: save;
}
</style>
