<template>
  <div class="code-editor" ref="editorContainer">
    <!-- Display loading progress when lazy loading -->
    <v-progress-linear v-show="!tab?.codeLoaded" indeterminate></v-progress-linear>
  </div>
</template>

<script setup lang="ts">
import { defaultKeymap } from "@codemirror/commands";
import { EditorState, Extension } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { barf } from "thememirror";
import { v4 } from "uuid";
import { PropType, computed, onMounted, ref, watch } from "vue";
import { useTheme } from "vuetify";
import { Tab, TabType } from ".";

const theme = useTheme();
const props = defineProps({
  tab: {
    required: false,
    type: Object as PropType<Tab<keyof TabType>>,
  },
});

const tab = computed(() =>
  props.tab?.type === "EditableCode" || props.tab?.type === "LibraryCode"
    ? (props.tab as Tab<"EditableCode" | "LibraryCode">)
    : undefined
);
const editorContainer = ref<HTMLDivElement | null>(null);
let editor: EditorView | null = null;
let lastStateId = v4();
/**
 * Sets editor state by given tab item
 * @param tab Tab
 */
const setState = async (tab?: Tab<"EditableCode" | "LibraryCode">) => {
  if (!tab) return;
  if (!editor) return;

  let extensions: Extension[];
  let code: string;
  if (tab.type === "LibraryCode") {
    // Clear editor while loading
    editor.setState(EditorState.create({}));

    const t = tab as Tab<"LibraryCode">;
    const currentStateId = v4();
    lastStateId = currentStateId;
    code = await t.getCode();
    if (lastStateId !== currentStateId) return; // Avoids incorrect overriding

    extensions = [EditorState.readOnly.of(true)];
  } else {
    const t = tab as Tab<"EditableCode">;
    code = t.code;

    extensions = [
      EditorState.readOnly.of(false),
      EditorView.updateListener.of((e) => {
        t.setCode(e.state.doc.toString());
      }),
    ];
  }

  editor.setState(
    EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        keymap.of(defaultKeymap),
        theme.current.value.dark ? barf : EditorView.baseTheme({}),
        tab.lang(),
        ...extensions,
      ],
    })
  );
};
// Changes editor state when selection changed
watch(tab, setState);
// Switches editor theme when page theme changed
watch(theme.current, () => {
  setState(tab.value);
});

// Init editor
onMounted(() => {
  if (!editorContainer.value) return;

  editor = new EditorView({
    parent: editorContainer.value,
  });
  setState(tab.value);
});
</script>

<style lang="less" scoped>
.code-editor {
  position: relative;
  z-index: 1000;
  flex-basis: 0;
  overflow-y: auto;

  :deep(.ͼ1 .cm-scroller) {
    font-size: 14px;
    font-family: "Roboto Mono", monospace;
  }

  :deep(.ͼ1.cm-focused) {
    outline: none;
  }
}
</style>
