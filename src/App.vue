<template>
  <!-- Display loading until prelude loaded  -->
  <prelude-loading v-if="isPreludeLoading"></prelude-loading>

  <!-- Error page when prelude error -->
  <service-unavailable
    v-else-if="preludeErrorReason !== null"
    :reason="preludeErrorReason"
  ></service-unavailable>

  <v-layout v-else class="app-layout" :mobile="mobile">
    <!-- Show App Bar in Mobile Mode -->
    <v-app-bar class="app-bar" v-if="mobile" :title="title">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      </template>

      <template v-slot:append>
        <!-- Example Base URL Editor -->
        <example-base-url-editor v-if="enableExampleBaseUrlEditor"></example-base-url-editor>
        <!-- Dark / Light Theme Switch Button -->
        <theme-switcher></theme-switcher>
      </template>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer">
      <navigation-menu :descriptors="descriptors"></navigation-menu>

      <!-- Show Dark / Light Theme Switch Button if in Mobile Mode -->
      <template v-if="!mobile" v-slot:append>
        <!-- Dark / Light Theme Switch Button -->
        <theme-switcher></theme-switcher>
        <!-- Example Base URL Editor -->
        <example-base-url-editor v-if="enableExampleBaseUrlEditor"></example-base-url-editor>
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
import { computed, ref } from "vue";
import { useDisplay, useTheme } from "vuetify";
import { RequestError } from "./apis";
import ExampleBaseUrlEditor from "./components/buttons/ExampleBaseUrlEditor.vue";
import ThemeSwitcher from "./components/buttons/ThemeSwitcher.vue";
import ServiceUnavailable from "./components/error/ServiceUnavailable.vue";
import PreludeLoading from "./components/loading/PreludeLoading.vue";
import NavigationMenu from "./components/menu/NavigationMenu.vue";
import { useAppStore } from "./store/app";

const appStore = useAppStore();
const mobile = useDisplay().mobile;
const theme = useTheme();

const enableExampleBaseUrlEditor = import.meta.env.VITE_ENABLE_BASE_URL_EDITOR === "true";
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
const isPreludeLoading = ref(true);
const preludeErrorReason = ref<string | null>(null);
appStore
  .loadPrelude()
  .catch((err) => {
    console.error(err);

    if (err instanceof RequestError) {
      let reason: string;
      switch (err.status) {
        case 404:
          reason = "failed to load data";
          break;
        default:
          reason = err.message;
      }
      preludeErrorReason.value = reason;
    } else {
      preludeErrorReason.value = "internal error";
    }
  })
  .finally(() => {
    isPreludeLoading.value = false;
  });
const descriptors = computed(() => appStore.descriptorsTree);
</script>

<style lang="less">
html {
  // scroll behavior sets to smooth for hash locating
  scroll-behavior: smooth;
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
