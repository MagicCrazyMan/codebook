<template>
  <div>
    <v-alert
      closable
      type="error"
      border="start"
      variant="tonal"
      density="compact"
      @click:close="emits('close')"
    >
      <span class="font-weight-bold">{{ filename }}</span>
      <span>&nbsp;</span>
      <span>{{ msg }}</span>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { RequestError } from "@/apis";
import { computed } from "vue";
import { PropType } from "vue";

const props = defineProps({
  filename: {
    required: true,
    type: String,
  },
  error: {
    required: true,
    type: Object as PropType<Error>,
  },
});
const emits = defineEmits<{
  (event: "close"): void;
}>();

const msg = computed(() => {
  if (props.error instanceof RequestError) {
    switch (props.error.status) {
      case 404:
        return `file marked as existing, but not found (${props.error.status})`;
      default:
        return `${props.error.statusText ?? "reason unknown"} (${props.error.status})`;
    }
  } else {
    return props.error.message;
  }
});
</script>
