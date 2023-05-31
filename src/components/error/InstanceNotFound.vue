<template>
  <div class="d-flex flex-column justify-center align-center">
    <v-icon class="icon" size="6rem" icon="mdi-help-circle-outline"></v-icon>
    <h1 class="font-weight-bold font-italic mt-4">Chapter Not Found</h1>
    <v-btn class="mt-2" @click="toGuideline">
      <template v-slot:prepend>
        <v-icon icon="mdi-keyboard-return"></v-icon>
      </template>
      return to guideline
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { toGuideline } from "@/router";
</script>

<style lang="less" scoped>
.icon {
  transform: rotateZ(10deg);
}
</style>
