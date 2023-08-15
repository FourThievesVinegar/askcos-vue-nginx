<template>
  <v-main style="background-color: #f5f5f5">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <default-footer />
  </v-main>
</template>

<script setup>
import DefaultFooter from "./Footer.vue";
</script>
