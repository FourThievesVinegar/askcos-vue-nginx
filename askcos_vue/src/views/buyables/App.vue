<template>
  <v-container fluid style="min-height: calc(100vh-50px)">
    <v-row style="min-height: 100vh" class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <v-sheet elevation="5" rounded="lg" class="pa-10">
          <h1 class="my-4">
            Buyable Compounds
          </h1>
          <v-row>
            <!-- Descriptions -->
            <v-col cols="12">
              <v-row>
                <v-col>
                  <p>
                    The chemicals and prices stored in our database are taken from Reaxys and are originally from
                    eMolecules, LabNetwork, or Sigma Aldrich. All compounds with an average price per gram listed at $100
                    or lower were included. Please note that prices in the database are unfortunately rounded to the
                    nearest integer. That is, the cheapest compounds are still listed as $1/g.
                  </p>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <p>
                    Note: The first search performed may take longer than expected.
                  </p>
                </v-col>
              </v-row>
            </v-col>
            <!-- Search, Filters, Buttons -->
            <v-col cols="12" class="my-4">
              <!-- Search -->
              <!-- Descriptions -->
              <v-row justify="center" class="mb-6">
                <v-col cols="12">
                  <!-- descriptions -->
                </v-col>
              </v-row>
              <!-- Search -->
              <v-row align="center" justify="space-between" class="mb-4">
                <v-text-field v-model="searchSmilesQuery" label="SMILES/SMARTS" prepend-inner-icon="mdi-magnify"
                  class="mx-2" />
                <v-checkbox v-model="searchRegex" label="Use SMARTS" class="mx-2" />
                <v-btn type="submit" color="primary" class="mx-2">
                  Search
                </v-btn>
              </v-row>
              <!-- Filters -->
              <v-row align="center" justify="space-between" class="mb-4">
                <v-text-field v-model="simThresh" label="Similarity Threshold" type="number" prepend-inner-icon="mdi-tune"
                  class="mx-2" />
                <v-text-field v-model="searchLimit" label="Limit Results" prepend-inner-icon="mdi-format-list-numbered"
                  class="mx-2" />
                <v-combobox v-model="searchSourceQuery" label="Buyable Sources" multiple chips
                  prepend-inner-icon="mdi-database-search" class="mx-2"></v-combobox>
              </v-row>
              <!-- Buttons -->
              <v-row justify="space-between">
                <v-btn color="success" class="mx-2">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn color="info" class="mx-2">
                  <v-icon>mdi-file-upload</v-icon>
                </v-btn>
              </v-row>
            </v-col>
          </v-row>

             <v-row>
          <v-col cols="12">
        
  <div>
        <v-data-table :headers="fields" :loading="loading"></v-data-table>
      </div>


          </v-col>
        </v-row>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// import { ref, computed, onMounted, watch } from 'vue';
// import SmilesImage from "@/components/SmilesImage";
// import { API } from "@/common/api";
// import { getBuyables } from "@/common/buyables";
// import CopyTooltip from "@/components/CopyTooltip";

// const buyables = ref([]);
// const uploadFile = ref(null);
// const searchSmilesQuery = ref('');
// const searchSourceQuery = ref([]);
// const searchRegex = ref(false);
// const searchLimit = ref(100);
// const simThresh = ref(1.0);
// const allowOverwrite = ref(true);
// const showAddModal = ref(false);
// const showUploadModal = ref(false);
// const addBuyableSmiles = ref('');
// const addBuyablePrice = ref(1);
// const addBuyableSource = ref('');
// const uploadFileFormat = ref('json');
// const pendingTasks = ref(0);
// const buyablesSources = ref([]);


// const canModifyBuyables = computed(() => {
//   return JSON.parse(document.getElementById('can-modify-buyables').textContent)
// });

// const fields = computed(() => {
//   let fields = [
//     { key: 'smiles', label: 'SMILES', class: 'text-center' },
//     { key: 'ppg', label: 'Price ($/g)', class: 'text-center' },
//     { key: 'source', label: 'Source', class: 'text-center' },
//     { key: 'tanimoto', label: 'Similarity', class: 'text-center' }
//   ]
//   if (canModifyBuyables.value) {
//     fields.push({ key: 'delete', label: '', class: 'text-center' })
//   }
//   return fields
// });

// const search = () => {
//   pendingTasks.value++;
//   getBuyables(
//     searchSmilesQuery.value,
//     searchSourceQuery.value,
//     searchRegex.value,
//     searchLimit.value,
//     simThresh.value
//   )
//     .then(json => {
//       buyables.value = json['result'];
//     })
//     .finally(() => {
//       pendingTasks.value--
//     })
// };

// onMounted(() => {
//   API.get('/api/v2/buyables/sources/')
//     .then(json => {
//       buyablesSources.value = json.sources
//     });
//   let urlParams = new URLSearchParams(window.location.search);
//   let query = urlParams.get('q');
//   if (query) {
//     searchSmilesQuery.value = query;
//     search();
//   }
// });


</script>