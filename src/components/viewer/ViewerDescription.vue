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

    <!-- Display Error If Description Mark as Existing But Not Found -->
    <example-file-error
      v-else-if="descriptionError"
      filename="index.md"
      :error="descriptionError"
      @close="descriptionError = null"
    ></example-file-error>

    <!-- Description -->
    <div v-else-if="description" v-html="description"></div>

    <!-- Display Introduction If Has No Description -->
    <p v-else-if="!instance.hasDescription && instance.intro">{{ instance.intro }}</p>
  </div>
</template>

<script setup lang="ts">
import { getInstanceDescription } from "@/apis/example";
import { AppExampleInstance } from "@/store/app";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { PropType, ref, watch } from "vue";
import ExampleFileError from "./error/ExampleFileError.vue";

const props = defineProps({
  instance: {
    required: true,
    type: Object as PropType<AppExampleInstance>,
  },
});

const description = ref("");
const descriptionLoading = ref(false);
const descriptionError = ref<Error | null>(null);
// Update description when instance changed
watch(
  () => props.instance,
  async (newInstance) => {
    description.value = "";
    descriptionLoading.value = true;
    descriptionError.value = null;

    if (newInstance.hasDescription) {
      let desc: string | Error = await getInstanceDescription(newInstance.fullEntry).catch(
        (err) => err
      );
      // Avoids incorrect overriding
      if (newInstance.fullEntry !== props.instance.fullEntry) return;

      if (desc instanceof Error) {
        descriptionError.value = desc;
      } else {
        description.value = DOMPurify.sanitize(marked(desc));
      }
    }

    descriptionLoading.value = false;
  },
  { immediate: true }
);
</script>
