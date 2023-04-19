<template>
  <div>
    <!-- Title & Edit Button -->
    <div class="d-flex align-center">
      <h1>
        {{ instance.title }}
      </h1>
      <v-progress-circular
        v-if="descriptionLoading"
        indeterminate
        size="24"
        class="ml-2"
      ></v-progress-circular>
    </div>

    <!-- Loading -->
    <template v-if="descriptionLoading"></template>

    <!-- Description -->
    <div v-else-if="description" v-html="description"></div>

    <!-- Display Error If Description Mark as Existing But Not Found -->
    <file-not-found v-else-if="descriptionNotFound" :filenames="['index.md']"></file-not-found>

    <!-- Display Introduction If Has No Description -->
    <p v-else-if="instance.intro">{{ instance.intro }}</p>
  </div>
</template>

<script setup lang="ts">
import { RequestError } from "@/apis";
import { getInstanceDescription } from "@/apis/example";
import { AppExampleInstance } from "@/store/app";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { PropType, ref, watch } from "vue";
import FileNotFound from "./error/FileNotFound.vue";

const props = defineProps({
  instance: {
    required: true,
    type: Object as PropType<AppExampleInstance>,
  },
});

const description = ref("");
const descriptionLoading = ref(false);
const descriptionNotFound = ref(false);
// Update description when instance changed
watch(
  () => props.instance,
  async (newInstance) => {
    description.value = "";
    descriptionLoading.value = true;
    descriptionNotFound.value = false;

    if (newInstance.hasDescription) {
      let desc: string | RequestError = await getInstanceDescription(newInstance.fullEntry).catch(
        (err) => err
      );
      // Avoids incorrect overriding
      if (newInstance.fullEntry !== props.instance.fullEntry) return;

      if (desc instanceof RequestError) {
        desc = "";
        descriptionNotFound.value = true;
      } else {
        description.value = DOMPurify.sanitize(marked(desc));
      }
    }

    descriptionLoading.value = false;
  },
  { immediate: true }
);
</script>
