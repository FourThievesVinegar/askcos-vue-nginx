<template>
  <v-main style="background-color: #f0f2f5">
    <router-view v-slot="{ Component }">
      <keep-alive exclude="Results,AppBar,Banlist">
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <default-footer />
  </v-main>
</template>

<script setup>
import DefaultFooter from "./Footer.vue";
</script>
