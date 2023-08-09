<template>
  <div class="h-100">
    <v-container v-if="instance" class="h-100 d-flex flex-column">
      <!-- Navigator -->
      <viewer-navigator class="flex-grow-0 flex-shrink-0" :instance="instance"></viewer-navigator>

      <!-- Description -->
      <viewer-description
        class="flex-grow-0 flex-shrink-0"
        :instance="instance"
      ></viewer-description>

      <!-- Main -->
      <viewer-main
        v-if="instance.type === ChapterDescriptorType.Code"
        class="flex-grow-1 flex-shrink-1 mt-4"
        :instance="instance"
      ></viewer-main>
    </v-container>

    <!-- Display Error Page if Instance Not Found  -->
    <instance-not-found class="h-100" v-else></instance-not-found>
  </div>
</template>

<script setup lang="ts">
import { ChapterDescriptorType } from "@/apis/chapter";
import InstanceNotFound from "@/components/error/InstanceNotFound.vue";
import ViewerDescription from "@/components/viewer/ViewerDescription.vue";
import ViewerMain from "@/components/viewer/ViewerMain.vue";
import ViewerNavigator from "@/components/viewer/ViewerNavigator.vue";
import router from "@/router";
import { AppChapterInstance, useAppStore } from "@/store/app";
import { ref, watch } from "vue";

const appStore = useAppStore();

const instance = ref<AppChapterInstance | undefined>(undefined);
/**
 * Finds instance and update HTML title
 */
const findInstance = () => {
  const item = appStore.descriptorsMap.get(router.currentRoute.value.path);
  if (item?.type === ChapterDescriptorType.Code || item?.type === ChapterDescriptorType.Intro) {
    instance.value = item;
    document.title = `${item.title} - ${import.meta.env.VITE_TITLE}`;
  } else if (item?.type === ChapterDescriptorType.Directory) {
    instance.value = undefined;
    document.title = import.meta.env.VITE_TITLE;
  }
};
findInstance();
// Update when route changed
watch(router.currentRoute, findInstance);
// Update when descriptors changed
watch(() => appStore.descriptorsMap, findInstance);
</script>
