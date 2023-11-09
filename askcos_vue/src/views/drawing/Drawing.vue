<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <div class="mt-8 mb-5">
          <v-breadcrumbs class="pa-0" :items="['Home', 'Drawing']"></v-breadcrumbs>
          <h1>
            Drawing
          </h1>
        </div>
      </v-col>
    </v-row>

    <v-row class="justify-center">
      <v-col cols="12" md="10">
        <v-sheet elevation="2" rounded="lg" class="pa-5">
          <v-row class="justify-center" density="compact">
            <v-col cols="12" md="10" my="10">
              <v-text-field v-model="smiles" class="centered-input" variant="outlined"
                label="Enter a molecule or reaction SMILES to explore available tasks" prepend-inner-icon="mdi mdi-flask"
                placeholder="SMILES" hide-details clearable @click:clear="smiles = ''">
                <template v-slot:append>
                  <v-btn variant="flat" color="primary" prepend-icon="mdi mdi-web" size="large"
                    @click="canonicalize(smiles)">Canonicalize</v-btn>
                </template>
                <template v-slot:append-inner>
                  <v-btn variant="tonal" prepend-icon="mdi mdi-pencil" @click="openKetcher(smiles)">Draw</v-btn>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row class="justify-center" >
      <v-col cols="12" md="10">
        <v-sheet class="elevation-2 pa-5" rounded="lg">
          <div v-if="smiles.length">
            <smiles-image :smiles="smiles" allow-copy></smiles-image>
            <p class="text-body-1 text-center">SMILES: {{ smiles }}</p>
          </div>
          <div v-else class="text-center">
            <v-img class="justify-center mx-auto" :width="400" cover :src="results"></v-img>
            <h6 class="text-h6 mt-2">Empty Board</h6>
            <p class="mt-2 text-body-1">Utility for drawing images from molecule SMILES, reaction SMILES, and template SMARTS.</p>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
  <ketcher-modal ref="ketcherRef" v-model="showKetcher" :smiles="smiles" @input="showKetcher = false"
    @update:smiles="updateSmiles" />
</template>

<script setup>
import { API } from "@/common/api";
import { ref } from 'vue';
import SmilesImage from "@/components/SmilesImage.vue";
import results from "@/assets/emptyResults.svg";
import KetcherModal from "@/components/KetcherModal";


const smiles = ref('');
const showKetcher = ref(false);
const ketcherRef = ref(null);

const canonicalize = () => {
  API.post("/api/rdkit/canonicalize/", { smiles: smiles.value })
    .then((json) => {
      console.log(json);
      smiles.value = json.smiles;
    })
    .catch((error) => {
      console.log("Could not canonicalize: " + error);
    });
};

const openKetcher = (source) => {
  smiles.value = source;
  showKetcher.value = true;
  ketcherRef.value.smilesToKetcher();
};

const updateSmiles = (newSmiles) => {
  smiles.value = newSmiles;
}
</script>