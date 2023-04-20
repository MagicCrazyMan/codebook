<template>
  <v-list
    nav
    class="navigation-menu"
    lines="one"
    density="compact"
    variant="text"
    active-color="primary"
    v-model:opened="opened"
    v-model:selected="selected"
  >
    <navigation-menu-item
      v-for="descriptor of descriptors"
      :key="descriptor.fullEntry"
      :descriptor="descriptor"
    ></navigation-menu-item>
  </v-list>
</template>

<script setup lang="ts">
import router, { RouteName } from "@/router";
import { useAppStore } from "@/store/app";
import { computed, ref, watch } from "vue";
import NavigationMenuItem from "./NavigationMenuItem.vue";

const appStore = useAppStore();

const descriptors = computed(() => appStore.descriptorsTree);

// Opened list itemsq
const opened = ref<string[]>([]);
// Selected list items
const selected = ref<string[]>([]);
// Updates opened and selected when route changed
watch(
  router.currentRoute,
  (newRoute) => {
    if (newRoute.name === RouteName.Guideline && newRoute.hash) {
      opened.value = newRoute.hash
        .slice(1)
        .split("/")
        .filter((path) => path);
    } else if (newRoute.name === RouteName.Viewer) {
      const { chapters } = newRoute.params as { chapters: string[] };
      opened.value = chapters.slice(0, chapters.length - 1);
      selected.value = [newRoute.path];
    } else {
      opened.value = [];
      selected.value = [];
    }
  },
  { immediate: true }
);
</script>
