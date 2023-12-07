<template>
  <v-app class="overflow-auto">
    <v-layout style="min-width: 1150px;">
      <default-bar />

      <default-view />

    </v-layout>
  </v-app>
</template>

<script setup>
import DefaultBar from "./AppBar.vue";
import DefaultView from "./View.vue";



</script>
