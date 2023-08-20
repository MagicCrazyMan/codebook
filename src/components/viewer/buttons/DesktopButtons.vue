<template>
  <div>
    <v-btn-group divided variant="outlined" density="comfortable">
      <!-- Edit Button -->
      <v-btn
        :icon="isEditing ? 'mdi-pencil-off' : 'mdi-pencil'"
        :loading="isCodesLoading"
        @click="appStore.setEditing(!isEditing)"
      >
      </v-btn>
      <!-- Capture Button -->
      <v-btn icon="mdi-camera" :loading="isCanvasLoading || isCodesLoading" @click="capture">
      </v-btn>
      <!-- Add Import Map Button -->
      <v-btn
        v-if="isEditing && selectedTab?.type === 'ImportMaps'"
        icon="mdi-plus"
        :loading="isCanvasLoading || isCodesLoading"
        @click="showImportMapDialog"
      >
      </v-btn>
      <!-- Reload Button -->
      <v-btn
        v-if="isEditing"
        icon="mdi-play"
        :loading="isCanvasLoading || isCodesLoading"
        @click="reload"
      >
      </v-btn>
    </v-btn-group>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/app";
import { PropType } from "vue";
import { Tab, TabType } from "../editor";

const appStore = useAppStore();
defineProps({
  selectedTab: {
    required: false,
    type: Object as PropType<Tab<keyof TabType>>,
  },
  reload: {
    required: true,
    type: Function as PropType<() => void>,
  },
  capture: {
    required: true,
    type: Function as PropType<() => void>,
  },
  showImportMapDialog: {
    required: true,
    type: Function as PropType<() => void>,
  },
  isEditing: {
    required: true,
    type: Boolean,
  },
  isCodesLoading: {
    required: true,
    type: Boolean,
  },
  isCanvasLoading: {
    required: true,
    type: Boolean,
  },
});
</script>
