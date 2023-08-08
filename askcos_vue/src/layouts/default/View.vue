<template>
  <v-main style="background-color: #f5f5f5;">
    <router-view />
    <default-footer />
  </v-main>
</template>

<script setup>
import DefaultFooter from "./Footer.vue";
</script>
