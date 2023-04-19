<template>
  <template v-if="descriptor.type === ExampleDescriptorType.Instance">
    <v-list-item
      :title="title"
      :value="descriptor.fullEntry"
      @click="toExample(descriptor.fullEntry)"
    ></v-list-item>
  </template>
  <template v-else-if="descriptor.type === ExampleDescriptorType.Directory">
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
import { ExampleDescriptorType } from "@/apis/example";
import { toExample } from "@/router";
import { AppExampleDescriptor } from "@/store/app";
import { computed } from "vue";
import { PropType } from "vue";

const props = defineProps({
  descriptor: {
    required: true,
    type: Object as PropType<AppExampleDescriptor>,
  },
});

const title = computed(() => props.descriptor.title ?? props.descriptor.entry);
</script>
