<template>
  <v-lazy>
    <v-container class="pl-8">
      <guideline-item :descriptors-tree="tree"></guideline-item>
    </v-container>
  </v-lazy>
</template>

<script setup lang="ts">
import GuidelineItem from "@/components/guideline/GuidelineItem.vue";
import { useAppStore } from "@/store/app";
import { onMounted } from "vue";

const appStore = useAppStore();
const tree = appStore.descriptorsTree;

const scrollToHash = () => {
  const hash = location.hash;
  if (!hash) return;

  // Waits 300 ms for smoother scroll
  setTimeout(() => {
    document.getElementById(hash.slice(1))?.scrollIntoView();
  }, 300);
};

// Autofocus to section if having a id hash
onMounted(() => {
  scrollToHash();
});
</script>
