<template>
  <v-slide-y-transition mode="out-in">
    <v-btn
      v-if="visible"
      elevation="4"
      :icon="icon"
      :color="color"
      :loading="loading"
      @click="emits('click')"
    >
    </v-btn>
  </v-slide-y-transition>
</template>

<script setup lang="ts">
defineProps({
  visible: {
    required: false,
    type: Boolean,
    default: true,
  },
  icon: {
    required: true,
    type: String,
  },
  loading: {
    required: false,
    type: Boolean,
    default: false,
  },
  color: {
    required: false,
    type: String,
    default: "primary",
  },
});
const emits = defineEmits<{
  (event: "click"): void;
}>();
</script>
