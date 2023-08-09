<template>
  <template
    v-if="
      descriptor.type === ChapterDescriptorType.Code ||
      descriptor.type === ChapterDescriptorType.Intro
    "
  >
    <v-list-item
      :title="title"
      :value="descriptor.fullEntry"
      @click="toChapter(descriptor.fullEntry)"
    ></v-list-item>
  </template>
  <template v-else-if="descriptor.type === ChapterDescriptorType.Directory">
    <v-list-group :value="descriptor.entry">
      <template v-slot:activator="{ props }">
        <v-list-item class="font-weight-bold" v-bind="props" :title="title"></v-list-item>
      </template>

      <navigation-menu-item
        v-for="child of descriptor.children"
        :key="child.entry"
        :descriptor="child"
      ></navigation-menu-item>
    </v-list-group>
  </template>
</template>

<script setup lang="ts">
import { ChapterDescriptorType } from "@/apis/chapter";
import { toChapter } from "@/router";
import { AppChapterDescriptor } from "@/store/app";
import { computed } from "vue";
import { PropType } from "vue";

const props = defineProps({
  descriptor: {
    required: true,
    type: Object as PropType<AppChapterDescriptor>,
  },
});

const title = computed(() => props.descriptor.title ?? props.descriptor.entry);
</script>
