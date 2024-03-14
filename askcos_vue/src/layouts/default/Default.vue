<template>
  <v-app class="overflow-auto">
    <v-layout style="min-width: 1150px;">
      <default-bar />

      <default-view />

    </v-layout>
  </v-app>
</template>

<script setup>
import { onMounted } from "vue";
import DefaultBar from "./AppBar.vue";
import DefaultView from "./View.vue";
import Confetti from "vue-confetti/src/confetti.js";
const confetti = new Confetti();

onMounted(() => {
  const isAccountCreatedNow = localStorage.getItem("newAccount")
  if (isAccountCreatedNow === "true") {
    confetti.start({
      particles: [
        {
          type: 'rect',
        },
        {
          type: 'circle',
        }
      ],
      colors: ["#FF6F61", "#004C83", "#55C6A9", "#FFC82B"],
      particlesPerFrame: 2,
    });
    setTimeout(() => { confetti.stop() }, 5000);
    localStorage.removeItem("newAccount")
  }
})

</script>

<style>
#confetti-canvas {
  z-index: 9999
}
</style>
