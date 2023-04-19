<template>
  <!-- Floating Buttons in Mobile Mode -->
  <teleport to="body">
    <div class="mobile-buttons-container">
      <div class="mobile-button d-flex flex-column">
        <!-- Add Import Map Button -->
        <transition-icon-button
          class="mt-2"
          icon="mdi-plus"
          :visible="!isCollapsed && isEditing && selectedTab?.type === 'ImportMaps'"
          :loading="isCanvasLoading || isCodesLoading"
          @click="showImportMapDialog"
        >
        </transition-icon-button>
        <!-- Reload Button -->
        <transition-icon-button
          class="mt-2"
          icon="mdi-play"
          :visible="!isCollapsed && isEditing"
          :loading="isCanvasLoading || isCodesLoading"
          @click="reload"
        >
        </transition-icon-button>
        <!-- Save Button -->
        <transition-icon-button
          class="mt-2"
          icon="mdi-content-save"
          :visible="!isCollapsed && isEditing"
          :loading="isCanvasLoading || isCodesLoading"
          @click="save"
        >
        </transition-icon-button>
        <!-- Edit Button -->
        <transition-icon-button
          class="mt-2"
          :icon="isEditing ? 'mdi-pencil-off' : 'mdi-pencil'"
          :visible="!isCollapsed"
          :loading="isCodesLoading"
          @click="appStore.setEditing(!isEditing)"
        >
        </transition-icon-button>
        <!-- Capture Button -->
        <transition-icon-button
          class="mt-2"
          icon="mdi-camera"
          :visible="!isCollapsed"
          :loading="isCanvasLoading || isCodesLoading"
          @click="capture"
        ></transition-icon-button>
        <!-- Menu Button -->
        <transition-icon-button
          class="mt-2"
          :icon="isCollapsed ? 'mdi-menu' : 'mdi-menu-open'"
          @click="isCollapsed = !isCollapsed"
        >
        </transition-icon-button>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/app";
import { PropType, ref } from "vue";
import TransitionIconButton from "../../buttons/TransitionIconButton.vue";
import { Tab, TabType } from "../editor";

const appStore = useAppStore();
defineProps({
  selectedTab: {
    required: false,
    type: Object as PropType<Tab<keyof TabType>>,
  },
  save: {
    required: true,
    type: Function as PropType<() => void>,
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

const isCollapsed = ref(true);
</script>

<style lang="less" scoped>
.mobile-buttons-container {
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 3;
  top: 0;
  left: 0;

  pointer-events: none;

  .mobile-button {
    position: fixed;
    right: 1rem;
    bottom: 1rem;

    pointer-events: all;
  }
}
</style>
