<template>
  <div class="pa-4 overflow-y-auto">
    <template v-if="tab">
      <v-card
        density="compact"
        class="editor-box__import-map"
        v-for="({ lib, url, type }, index) of tab.importMaps"
        :key="lib"
        :title="lib"
        :text="url"
      >
        <v-card-actions>
          <v-btn density="compact" color="error" @click="remove(index)"> Delete </v-btn>
          <v-btn
            v-if="type === AppImportMapType.Local"
            density="compact"
            color="primary"
            @click="review(index)"
          >
            Review
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>

    <!-- Dialog for Adding New Import Map -->
    <v-dialog :width="mobile ? '100%' : '30%'" v-model="dialogVisible">
      <v-card title="Add Import Map">
        <v-card-text>
          <v-form ref="formComponent" @submit.prevent>
            <!-- Library Name Text Field -->
            <v-text-field
              required
              density="comfortable"
              label="Library Name"
              variant="outlined"
              :error-messages="formLib.errorMessage.value"
              v-model="formLib.value.value"
            ></v-text-field>
            <!-- Library URL Text Field -->
            <v-text-field
              required
              class="mt-2"
              density="comfortable"
              label="Library URL"
              variant="outlined"
              :error-messages="formUrl.errorMessage.value"
              v-model="formUrl.value.value"
            ></v-text-field>

            <!-- Buttons -->
            <div class="mt-2">
              <v-btn class="me-4" color="primary" @click="add">Save</v-btn>
              <v-btn @click="cancel">Cancel</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { AppImportMap, AppImportMapType } from "@/store/app";
import { useField, useForm } from "vee-validate";
import { PropType, computed, ref } from "vue";
import type { VForm } from "vuetify/components";
import { useDisplay } from "vuetify";
import { Tab, TabType } from ".";

const mobile = useDisplay().mobile;
const props = defineProps({
  tab: {
    required: false,
    type: Object as PropType<Tab<keyof TabType>>,
  },
});
const emits = defineEmits<{
  (event: "review", importMap: AppImportMap): void;
}>();

const tab = computed(() =>
  props.tab?.type === "ImportMaps" ? (props.tab as Tab<"ImportMaps">) : undefined
);
const dialogVisible = ref(false);
const formComponent = ref<InstanceType<typeof VForm> | null>(null);
const { handleReset, handleSubmit } = useForm({
  validationSchema: {
    lib(value: string) {
      if (!value) return "Library name is required";
      if (tab.value?.importMaps.some(({ lib }) => lib === value))
        return "Library name already existed";
      return true;
    },
    url(value: string) {
      if (!value) return "Library URL is required";
      try {
        new URL(value);
        return true;
      } catch {
        return "Library URL invalid";
      }
    },
  },
});
const formLib = useField("lib");
const formUrl = useField("url");

/**
 * Add new import map from dialog form data
 */
const add = handleSubmit(({ lib, url }) => {
  if (!tab.value) return;

  tab.value.addImportMap({
    lib,
    url,
    type: AppImportMapType.Third,
  });
  dialogVisible.value = false;
});

/**
 * Cancel adding import map
 */
const cancel = () => {
  handleReset();
  dialogVisible.value = false;
};

/**
 * Remove import map
 * @param index Import map index
 */
const remove = (index: number) => {
  if (!tab.value) return;
  tab.value.removeImportMapByIndex(index);
};

/**
 * Review local library
 * @param index Import map index
 */
const review = (index: number) => {
  if (!tab.value) return;

  emits("review", tab.value.importMaps[index]);
};

defineExpose({
  showImportMapDialog: () => {
    dialogVisible.value = true;
  },
});
</script>

<style lang="less" scoped>
.editor-box__import-map {
  & + .editor-box__import-map {
    margin-top: 1rem;
  }
}
</style>
