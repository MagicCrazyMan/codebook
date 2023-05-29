<template>
  <div class="chapter-viewer__divider px-1" @mousedown="startResize"></div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { getCurrentInstance } from "vue";

defineProps({
  modelValue: {
    required: true,
    type: Number,
  },
});
const emits = defineEmits<{
  (event: "update:modelValue", percent: number): void;
}>();

// Divide limitations
const MAX_DIVIDE_PERCENT = 0.7;
const MIN_DIVIDE_PERCENT = 0.3;

let parentContainer: HTMLElement | undefined;
onMounted(() => {
  parentContainer = getCurrentInstance()?.parent?.vnode.el as HTMLElement;
});
const startResize = () => {
  document.body.setAttribute("horizontal-resizing", "true");
  document.addEventListener("mousemove", resizing);
  document.addEventListener("mouseup", stopResizing, { once: true });
};
const resizing = (e: MouseEvent) => {
  if (!parentContainer) return;
  const { clientX: pointerX } = e;
  const { left, width } = parentContainer.getBoundingClientRect();
  const deltaX = pointerX - left;
  const ratio = deltaX / width;
  emits("update:modelValue", Math.min(Math.max(ratio, MIN_DIVIDE_PERCENT), MAX_DIVIDE_PERCENT));
};
const stopResizing = () => {
  document.body.removeAttribute("horizontal-resizing");
  document.removeEventListener("mousemove", resizing);
  document.removeEventListener("mouseup", stopResizing);
};
</script>

<style lang="less" scoped>
.chapter-viewer__divider {
  cursor: col-resize;
}
</style>

<style lang="less">
body[horizontal-resizing="true"] {
  cursor: col-resize;

  & * {
    pointer-events: none !important;
  }
}
</style>
