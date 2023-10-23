<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <div class="mt-8 mb-5">
          <v-breadcrumbs class="pa-0" :items="['Home', 'Buyables']"></v-breadcrumbs>
          <h1>
            Buyable Compounds
          </h1>
        </div>
      </v-col>
    </v-row>

    <v-row class="justify-center">
      <v-col cols="12" md="10">
        <v-sheet elevation="2">

          <v-row class="px-5 pt-5 justify-center" density="compact">
            <v-col cols="12" md="10" my="10">
              <v-text-field v-model="searchSmilesQuery" placeholder="SMILES/SMARTS" prepend-inner-icon="mdi mdi-flask"
                density="comfortable" variant="outlined" label="Enter SMILES/SMART to explore" hide-details clearable>
                <template v-slot:append>
                  <v-btn color="primary" @click="search" size="large">
                    Search
                  </v-btn>
                  <v-checkbox-btn v-model="searchRegex" label="Use SMARTS" hide-details>
                  </v-checkbox-btn>
                </template>
                <template v-slot:append-inner>
                  <v-btn variant="tonal" prepend-icon="mdi mdi-pencil"
                    @click="openKetcher(searchSmilesQuery)">Draw</v-btn>
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <ketcher-modal ref="ketcherRef" v-model="showKetcher" :smiles="searchSmilesQuery" @input="showKetcher = false"
            @update:smiles="updateSmiles" />

          <v-row class="mb-2 px-5 pt-5">
            <v-col cols="12" md="4">
              <v-slider hide-details v-model="simThresh" label="Similarity Threshold" min="0" max="1" step="0.0001"
                color="primary">
                <template v-slot:append>
                  <v-text-field data-cy="similarity-input-element" v-model="simThresh" type="number" style="width: 80px"
                    density="compact" hide-details variant="outlined"></v-text-field>
                </template>
              </v-slider>
            </v-col>
            <v-col cols="12" md="4">
              <v-slider hide-details v-model="searchLimit" label="Limit Results" min="1" max="100" step="1"
                color="primary">
                <template v-slot:append>
                  <v-text-field data-cy="result-input-element" v-model="searchLimit" type="number" style="width: 80px"
                    density="compact" hide-details variant="outlined"></v-text-field>
                </template>
              </v-slider>
            </v-col>
            <v-col cols="12" md="4" class="d-flex justify-space-evenly align-center">

              <v-menu location="bottom" :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" size="small" variant="flat" v-bind="props">
                    Select Sources
                  </v-btn>
                </template>
               <v-list>
    <v-list-item 
      v-for="source in buyablesSources" 
      :key="source" 
      v-model="searchSourceQuery"
      @click="selectSource(source)">

      <v-row align="center">
        <v-col cols="auto">
          <v-list-item-title >{{ source }}<v-icon class="ml-1 mb-2" v-show="selectedSource === source" icon="mdi-check"></v-icon></v-list-item-title>
        </v-col>
      </v-row>

    </v-list-item>
  </v-list>
              </v-menu>

              <v-menu location="bottom" id="tb-submit-settings" :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" prepend-icon="mdi mdi-menu-down" size="small" variant="flat" v-bind="props">
                    Upload
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item @click="showAddModal = !showAddModal">Add Compound</v-list-item>
                  <v-list-item @click="showUploadModal = !showUploadModal">Upload File</v-list-item>
                </v-list>
              </v-menu>

              <v-btn color="primary" variant="tonal" size="small" @click="clear()" :disabled="!buyables.length">
                Clear
              </v-btn>
            </v-col>
          </v-row>
          <v-divider class="border-opacity-25 mb-6"></v-divider>
          <v-row v-if="buyables.length">
            <v-col cols="12">
              <v-data-table :headers="headers" :items="buyables" :loading="showLoader">
                <template v-slot:item.smiles="{ item }">
                  <copy-tooltip :data="item.columns.smiles">
                    <smiles-image :smiles="item.columns.smiles" height="80px"></smiles-image>
                  </copy-tooltip>
                </template>
                <template v-slot:item.delete="{ item }">
                  <v-icon @click="deleteBuyable(item.raw._id)" class="text-center">mdi-delete</v-icon>
                </template>
              </v-data-table>
            </v-col>
          </v-row>
          <v-row v-else class="px-5 pb-5"> <v-col cols="12" class="d-flex justify-center align-center">
              <div>
                <v-img :width="400" cover :src="emptyCart"></v-img>
              </div>
            </v-col></v-row>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>

  <!-- <v-dialog v-model="showSourcesDialog" max-width="600px">
    <v-card>
      <v-card-title class="mt-2">
        <v-col cols="12">Select Sources</v-col>
      </v-card-title>
      <v-card-text class="text-justify">
        <v-row>
          <v-col cols="12">
            <v-checkbox data-cy="all-sources-checkbox" v-model="buyablesSourceAll" @change="searchSourceQuery = []"
              label="All"></v-checkbox>
            <v-checkbox v-for="source in buyablesSources" :key="source" v-model="searchSourceQuery" :value="source"
              :disabled="buyablesSourceAll" :label="source === NO_SOURCE ? NO_SOURCE_TEXT : source"></v-checkbox>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="mb-2">
        <v-spacer></v-spacer>
        <v-btn color="success" @click="showSourcesDialog = false">
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog> -->

  <v-dialog v-model="showAddModal" max-width="600px">
    <v-card>
      <v-card-title class="mt-2">
        <v-col cols="12">Add new buyable compound</v-col>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field data-cy="smiles-input" :rules="[v => !!v || 'SMILES is required']" label="SMILES"
              v-model="addBuyableSmiles" density="comfortable" variant="outlined" clearable></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-text-field id="pricePerGram" :rules="[v => !!v || 'Price is required']" label="Price per gram"
              v-model="addBuyablePrice" density="comfortable" variant="outlined" clearable></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-text-field id="source" label="Source" v-model="addBuyableSource"
              :rules="[v => !!v || 'Source is required']" density="comfortable" variant="outlined"
              clearable></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-checkbox label="Allow overwriting exisiting result" v-model="allowOverwrite"></v-checkbox>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="showAddModal = false">Close</v-btn>
        <v-btn color="green darken-1" text @click="addBuyable">Add Entry</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showUploadModal" max-width="600px">
    <v-card>
      <v-card-title class="mt-2">
        <v-col cols="12">Upload buyable compound file</v-col>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" class="mb-2">
            <span>
              File uploads should be in CSV format containing "smiles", "ppg", and "source" columns or
              in
              JSON format as an
              array of objects containing "smiles", "ppg", and "source" fields. Optionally, a
              "properties" field containing additional metadata can be specified as an array of JSON
              objects
              with "name" and
              "value" fields.
            </span>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-file-input label="File" v-model="uploadFile" :rules="[v => !!v || 'File is required']"
              density="comfortable" variant="outlined" clearable></v-file-input>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-select label="Format" v-model="uploadFileFormat" :items="['json', 'csv']" density="comfortable"
              variant="outlined" hide-details clearable></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-checkbox label="Allow overwriting exisiting result" v-model="allowOverwrite"></v-checkbox>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="showUploadModal = false">Close</v-btn>
        <v-btn color="green darken-1" text @click="handleUploadSubmit">Upload</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { API } from "@/common/api";
import { getBuyables } from "@/common/buyables";
import { ref, computed, onMounted, watch } from 'vue';
import SmilesImage from "@/components/SmilesImage.vue";
import CopyTooltip from "@/components/CopyTooltip";
import emptyCart from "@/assets/emptyCart.svg";
import KetcherModal from "@/components/KetcherModal";
import { useConfirm, useSnackbar } from 'vuetify-use-dialog';

// const showSourcesDialog = ref(false);
const buyables = ref([]);
const uploadFile = ref(null);
const searchSmilesQuery = ref('');
const searchSourceQuery = ref([]);
const searchRegex = ref(false);
const searchLimit = ref(100);
const simThresh = ref(1.0);
const allowOverwrite = ref(true);
const showAddModal = ref(false);
const showUploadModal = ref(false);
const addBuyableSmiles = ref('');
const addBuyablePrice = ref(1);
const addBuyableSource = ref('');
const uploadFileFormat = ref('json');
const pendingTasks = ref(0);
const buyablesSources = ref([]);
const showKetcher = ref(false);
const ketcherRef = ref(null);
const selectedSource = ref(null);
const createConfirm = useConfirm();
const createSnackbar = useSnackbar()

const headers = computed(() => {
  let headers = [
    { key: 'smiles', title: 'SMILES', align: 'center', width: '500px' },
    { key: 'ppg', title: 'Price ($/g)', align: 'center' },
    { key: 'source', title: 'Source', align: 'center' },
    { key: 'tanimoto', title: 'Similarity', align: 'center' }
  ]
  if (buyables.value.length > 0) {
    headers.push({
      key: 'delete', title: '', align: 'center'
    })
  }
  return headers
});

const clear = async (skipConfirm = false) => {
  if (!skipConfirm) {
    const isConfirmed = await createConfirm({
      title: 'Please Confirm',
      content: 'This will clear all of your current results. Continue anyway?',
      dialogProps: { width: "auto" }
    });
    if (!isConfirmed) return;
  }

  searchSmilesQuery.value = "",
    searchSourceQuery.value = [],
    buyables.value = [],
    searchLimit.value = 100,
    simThresh.value = 1
};

const showLoader = computed(() => {
  return pendingTasks.value > 0
});

const openKetcher = (source) => {
  searchSmilesQuery.value = source;
  showKetcher.value = true;
  ketcherRef.value.smilesToKetcher();
};

const updateSmiles = (newSmiles) => {
  searchSmilesQuery.value = newSmiles;
}

onMounted(() => {
  API.get('/api/buyables/sources')
    .then(json => {
      buyablesSources.value = json.sources
      console.log(buyablesSources.value)
    });
  let urlParams = new URLSearchParams(window.location.search);
  let query = urlParams.get('q');
  if (query) {
    searchSmilesQuery.value = query;
    search();
  }
});

const search = () => {
  pendingTasks.value++;
  getBuyables(
    searchSmilesQuery.value,
    searchSourceQuery.value,
    searchRegex.value,
    searchLimit.value,
    simThresh.value,
  )
    .then(json => {
      buyables.value = json['result'];
      console.log(buyables.value)
    })
    .finally(() => {
      pendingTasks.value--
    })
};


const handleUploadSubmit = () => {
  if (!uploadFile.value) {
    alert('Please select a file to upload');
    return;
  }
  pendingTasks.value++;

  let formData = new FormData();
  formData.append('file', uploadFile.value[0]);
  formData.append('format', uploadFileFormat.value);
  formData.append('allowOverwrite', allowOverwrite.value);
  formData.append('returnLimit', 200);
  console.log('Form Data', Object.fromEntries(formData.entries()));
  API.post('/api/buyables/upload', formData)
    .then(json => {
      if (json.error) {
        alert(json.error)
        return
      }
      createSnackbar({ text: 'Out of ' + json.total_count + ' entries, successfully added ' + json.inserted_count + ', updated ' + json.updated_count + ', and skipped ' + json.duplicate_count + ' duplicates. Only adding (up to) ' + 2 * searchLimit.value + ' documents to the list below', snackbarProps: { timeout: -1, vertical: true } })
      if (json.inserted.length > 0) {
        buyables.value.unshift(...json.inserted)
      }
      if (json.updated.length > 0) {
        for (const updated of json.updated) {
          let inList = false
          for (const buyable of buyables.value) {
            if (buyable._id === updated._id) {
              inList = true
              buyable.ppg = updated.ppg
              buyable.source = updated.source
              break
            }
          }
          if (!inList) {
            buyables.value.unshift(updated)
          }
        }
      }
    })
    .finally(() => {
      showUploadModal.value = false;
      uploadFile.value = null;
      pendingTasks.value--;
    });
};




const addBuyable = () => {
  pendingTasks.value++;
  let body = {
    smiles: addBuyableSmiles.value,
    ppg: addBuyablePrice.value,
    source: addBuyableSource.value,
    allowOverwrite: allowOverwrite.value,
  };
  API.post('/api/buyables/create', body)
    .then(json => {
      if (json.error || !json.success) {
        createSnackbar({ text: "Error adding buyable compound", snackbarProps: { timeout: -1, vertical: true } })
      } else {
        if (json.inserted) {
          buyables.value.unshift(json.result)
        }
        if (json.updated) {
          for (const buyable of buyables.value) {
            if (buyable._id === json.result._id) {
              buyable.ppg = json.result.ppg
              buyable.source = json.result.source
            }
          }
        }
        if (json.duplicate == true) {
          createSnackbar({ text: "Compound already exists in database! Check allow overwrite checkbox to allow overwriting!", snackbarProps: { timeout: -1, vertical: true } })
        }
        if (json.success) {
          createSnackbar({ text: "Complete!", snackbarProps: { timeout: -1, vertical: true } })
          showAddModal.value = !showAddModal.value;
        }
      }
    })
    .finally(() => {
      pendingTasks.value--;
    });
};


const deleteBuyable = (_id) => {
  const confirmDelete = async () => {
    const isConfirmed = await createConfirm({
      title: 'Please Confirm',
      content: 'Click "OK" to confirm deleting this entry',
      dialogProps: { width: "auto" }
    });

    if (!isConfirmed) return;

    // User confirmed, now call the API
    pendingTasks.value++;

    const params = new URLSearchParams();
    params.append('pk', encodeURIComponent(_id));

    return API.delete(`/api/buyables/destroy?${params.toString()}`)
  }

  confirmDelete()
    .then(json => {
      if (json['success'] === true) {
        const indexToDelete = buyables.value.findIndex(b => b._id === _id);
        if (indexToDelete !== -1) {
          console.log(buyables.value[indexToDelete]['_id']);
          buyables.value.splice(indexToDelete, 1);
          createSnackbar({ text: "Complete!", snackbarProps: { timeout: -1, vertical: true } })
        }
      }
      if (json.error !== null) {
        alert(json.error)
      }
    })
    .finally(() => {
      pendingTasks.value--;
    });
};

const selectSource = (source) => {
  if (selectedSource.value === source) {
    selectedSource.value = null;  // Deselect if already selected
  } else {
    selectedSource.value = source;  // Select if not already selected
  }
  searchSourceQuery.value = selectedSource.value;
};

watch(uploadFile, (file) => {
  if (file && file.name) {
    if (file.name.endsWith('.json')) {
      uploadFileFormat.value = 'json'
    } else if (file.name.endsWith('.csv')) {
      uploadFileFormat.value = 'csv'
    }
  }
});

watch(selectedSource, (newValue) => {
  console.log('Selected source changed:', newValue);
  if (newValue) {
    console.log('Source selected successfully:', newValue);
  } else {
    console.log('Source deselected');
  }
});

</script>

<style scoped>
.left-justify {
  text-align: justify;
  text-justify: inter-word;
}
</style>