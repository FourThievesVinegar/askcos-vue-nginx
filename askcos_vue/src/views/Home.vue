<template>
  <v-container class="fill-height" fluid style="min-height: calc(100vh-50px);">
    <v-row class="justify-center align-center">
      <v-col cols="12" md="12" xl="10" class="d-flex justify-center align-center flex-column">
        <v-expand-transition>
          <search-sheet v-show="show" />
        </v-expand-transition>
        <v-expand-transition>
          <info-sheet v-show="show" />
        </v-expand-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import InfoSheet from "@/components/home/InfoSheet";
import SearchSheet from "@/components/home/SearchSheet";

const show = ref(false);

onMounted(() => {
  show.value = true;
});
</script>
