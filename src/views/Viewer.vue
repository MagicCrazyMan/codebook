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
      <viewer-main class="flex-grow-1 flex-shrink-1 mt-4" :instance="instance"></viewer-main>
    </v-container>

    <!-- Display Error Page if Instance Not Found  -->
    <instance-not-found v-else></instance-not-found>
  </div>
</template>

<script setup lang="ts">
import { ExampleDescriptorType } from "@/apis/example";
import InstanceNotFound from "@/components/error/InstanceNotFound.vue";
import ViewerDescription from "@/components/viewer/ViewerDescription.vue";
import ViewerMain from "@/components/viewer/ViewerMain.vue";
import ViewerNavigator from "@/components/viewer/ViewerNavigator.vue";
import router from "@/router";
import { AppExampleInstance, useAppStore } from "@/store/app";
import { ref, watch } from "vue";

const appStore = useAppStore();

const instance = ref<AppExampleInstance | undefined>(undefined);
// Update instance ans HTML title when route changed
watch(
  router.currentRoute,
  (newRoute) => {
    const item = appStore.descriptorsMap.get(newRoute.path);
    if (item?.type === ExampleDescriptorType.Instance) {
      instance.value = item;
      document.title = `${item.title} - ${import.meta.env.VITE_TITLE}`;
    } else {
      instance.value = undefined;
      document.title = import.meta.env.VITE_TITLE;
    }
  },
  { immediate: true }
);
</script>
