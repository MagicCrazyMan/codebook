<template>
  <!-- Display loading until prelude loaded  -->
  <prelude-loading v-if="isPreludeLoading"></prelude-loading>

  <!-- Error page when prelude error -->
  <service-unavailable
    v-else-if="preludeError !== null"
    :error="preludeError"
  ></service-unavailable>

  <v-layout v-else class="app-layout" :mobile="mobile">
    <!-- Show App Bar in Mobile Mode -->
    <v-app-bar class="app-bar" v-if="mobile" :title="title">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      </template>

      <template v-slot:append>
        <!-- Chapter Base URL Editor -->
        <chapter-base-url-button v-if="enableChapterBaseUrlEditor"></chapter-base-url-button>
        <!-- Dark / Light Theme Switch Button -->
        <theme-switcher></theme-switcher>
      </template>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer">
      <navigation-menu></navigation-menu>

      <!-- Show Dark / Light Theme Switch Button if in Mobile Mode -->
      <template v-if="!mobile" v-slot:append>
        <!-- Dark / Light Theme Switch Button -->
        <theme-switcher></theme-switcher>
        <!-- Chapter Base URL Editor -->
        <chapter-base-url-button v-if="enableChapterBaseUrlEditor"></chapter-base-url-button>
      </template>
    </v-navigation-drawer>

    <!-- Main -->
    <v-main class="app-main">
      <router-view>
        <template v-slot="{ Component }">
          <v-slide-x-transition mode="out-in">
            <component :is="Component" />
          </v-slide-x-transition>
        </template>
      </router-view>
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref } from "vue";
import { useDisplay, useTheme } from "vuetify";
import ChapterBaseUrlButton from "./components/buttons/ChapterBaseUrlButton.vue";
import ThemeSwitcher from "./components/buttons/ThemeSwitcher.vue";
import ServiceUnavailable from "./components/error/ServiceUnavailable.vue";
import PreludeLoading from "./components/loading/PreludeLoading.vue";
import NavigationMenu from "./components/menu/NavigationMenu.vue";
import { useAppStore } from "./store/app";
import { useSSEStore } from "./store/sse";

const appStore = useAppStore();
const sseStore = useSSEStore();
const mobile = useDisplay().mobile;
const theme = useTheme();

const enableChapterBaseUrlEditor = import.meta.env.VITE_ENABLE_CHAPTERS_BASE_URL_EDITOR === "true";
const title = import.meta.env.VITE_TITLE;

// Update HTML title
document.title = import.meta.env.VITE_TITLE;

// Displays drawer, visible in default if in desktop mode
const drawer = ref(!mobile.value);

// Auto detect default theme when startup
if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
  theme.global.name.value = "dark";
}

// Loads prelude information immediately
const isPreludeLoading = ref(false);
const preludeError = ref<any | null>(null);
const loadPrelude = (showLoading = true) => {
  isPreludeLoading.value = showLoading;
  preludeError.value = null;

  appStore
    .loadPrelude()
    .catch((err) => {
      console.error(err);
      preludeError.value = err;
    })
    .finally(() => {
      isPreludeLoading.value = false;
    });
};
loadPrelude();

// Inits SSE
sseStore.init();
// Reloads prelude every rebuild
const sseId = sseStore.onRebuild(() => loadPrelude(false));
onBeforeUnmount(() => {
  sseStore.offRebuild(sseId);
});
</script>

<style lang="less">
html {
  // scroll behavior sets to smooth for hash locating
  scroll-behavior: smooth;
}

html,
body {
  min-width: 360px;
}

.app-layout {
  min-height: 100vh;

  &[mobile="false"] {
    // Sets scrollbar style in desktop mode
    ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    ::-webkit-scrollbar-button,
    ::-webkit-resizer {
      display: none;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 6px;
      background-color: #c0c0c0;
    }

    ::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }
}
</style>
