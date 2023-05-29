<template>
  <div class="d-flex align-center">
    <v-btn icon="mdi-arrow-left" @click="toGuideline"></v-btn>
    <v-breadcrumbs :items="breadcrumbsItems"></v-breadcrumbs>
  </div>
</template>

<script setup lang="ts">
import { toGuideline } from "@/router";
import { AppChapterInstance } from "@/store/app";
import { PropType } from "vue";
import { computed } from "vue";

const props = defineProps({
  instance: {
    required: true,
    type: Object as PropType<AppChapterInstance>,
  },
});

const breadcrumbsItems = computed(() => [
  ...props.instance.parents.map(({ title }) => title),
  props.instance.title,
]);
</script>
