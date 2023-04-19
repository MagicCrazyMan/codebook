<template>
  <v-btn :ripple="false" variant="plain" icon="mdi-theme-light-dark" @click="switchTheme"></v-btn>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify";

const theme = useTheme();

/**
 * Switches theme
 */
const switchTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
};
</script>
