<template>
  <v-container fluid>
    <bread-crumbs pageTitle="Drawing" />
    <DrawingToolbar v-model:smiles="smiles"/>
    <v-row class="justify-center">
      <v-col cols="12" md="12" xl="10">
        <v-sheet class="elevation-2 pa-5" rounded="lg">
          <div v-if="smiles.length">
            <smiles-image :smiles="smiles" allow-copy></smiles-image>
            <p class="text-body-1 text-center">SMILES: {{ smiles }}</p>
          </div>
          <div v-else class="text-center">
            <v-img class="justify-center mx-auto mb-3" :width="400" src="@/assets/emptyDraw.svg"></v-img>
            <h2>Empty Board</h2>
            <p class="text-body-1">Utility for drawing images from molecule SMILES, reaction SMILES, and template
              SMARTS.
            </p>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import DrawingToolbar from "@/components/drawing/DrawingToolbar.vue"
import SmilesImage from "@/components/SmilesImage.vue";
import BreadCrumbs from "@/components/BreadCrumbs.vue"

const smiles = ref('')
</script>