<template>
  <!-- Instance Preview Zone -->
  <section v-if="instances.length > 0">
    <v-row>
      <v-col v-for="instance in instances" :key="instance.fullEntry" :cols="cols">
        <v-card
          link
          class="h-100"
          :title="instance.title ?? instance.entry"
          :text="instance.intro"
          @click="toExample(instance.fullEntry)"
        >
          <v-img
            v-if="instance.hasPreviewImage"
            :src="concatenateExampleUrl(instance.fullEntry, PREVIEW_IMAGE_FILENAME)"
          ></v-img>
        </v-card>
      </v-col>
    </v-row>

    <div class="my-4"></div>
  </section>

  <!-- Directory List -->
  <template v-for="dir in dirs" :key="dir.fullEntry">
    <!-- Title -->
    <section class="guideline-item" :id="dir.fullEntry">
      <h1 class="guideline-item__title">
        <a
          class="guideline-item__title-anchor"
          :href="getHashHref(dir.fullEntry)"
          @click="toHash(dir.fullEntry)"
        >
          <span>#</span>
        </a>
        {{ dir.title ?? dir.entry }}
      </h1>
      <p v-if="dir.intro">{{ dir.intro }}</p>

      <div class="my-2"></div>

      <guideline-item :descriptors-tree="dir.children"> </guideline-item>
    </section>
  </template>
</template>

<script setup lang="ts">
import {
  ExampleDescriptorType,
  PREVIEW_IMAGE_FILENAME,
  concatenateExampleUrl,
} from "@/apis/example";
import { toExample } from "@/router";
import { AppExampleDescriptor, AppExampleDirectory, AppExampleInstance } from "@/store/app";
import { PropType, computed } from "vue";
import { useDisplay } from "vuetify";

const props = defineProps({
  descriptorsTree: {
    required: true,
    type: Object as PropType<AppExampleDescriptor[]>,
  },
});

const { xs, mdAndDown, lg } = useDisplay();
const cols = computed(() => {
  if (xs.value) {
    return 12;
  } else if (mdAndDown.value) {
    return 6;
  } else {
    return 3;
  }
});

const instances = computed(() => {
  return props.descriptorsTree.filter(
    (descriptor) => descriptor.type === ExampleDescriptorType.Instance
  ) as AppExampleInstance[];
});
const dirs = computed(() => {
  return props.descriptorsTree.filter(
    (descriptor) => descriptor.type === ExampleDescriptorType.Directory
  ) as AppExampleDirectory[];
});

// Gets anchor href with id hash
const getHashHref = (id: string) => `${location.pathname}#${id}`;
// Goes to example (recording history into browser)
const toHash = (id: string) => {
  location.hash = id;
};
</script>

<style lang="less" scoped>
.guideline-item__title {
  position: relative;
  cursor: pointer;

  &:hover {
    .guideline-item__title-anchor {
      opacity: 1;
    }
  }
}

.guideline-item__title-anchor {
  display: inline-block;
  height: 100%;
  width: 100%;

  position: absolute;
  top: 0;
  left: 0;
  margin-left: -1rem;

  text-decoration: none;
  user-select: none;

  color: rgb(var(--v-theme-primary));
  opacity: 0;
}
</style>
