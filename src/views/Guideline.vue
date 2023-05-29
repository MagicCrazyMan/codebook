<template>
  <div>
    <v-container v-if="tree.length !== 0" class="pl-8">
      <guideline-item :descriptors-tree="tree"></guideline-item>
    </v-container>

    <chapters-list-empty class="h-screen" v-else></chapters-list-empty>
  </div>
</template>

<script setup lang="ts">
import ChaptersListEmpty from "@/components/error/ChaptersListEmpty.vue";
import GuidelineItem from "@/components/guideline/GuidelineItem.vue";
import { useAppStore } from "@/store/app";
import { computed } from "vue";
import { onMounted } from "vue";

const appStore = useAppStore();

const tree = computed(() => appStore.descriptorsTree);

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
