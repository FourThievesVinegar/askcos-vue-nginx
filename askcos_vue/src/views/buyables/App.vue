<template>
  <v-container fluid style="min-height: calc(25vh-13px)" class="my-10">
    <v-row style="min-height: 30vh" class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <v-sheet elevation="5" rounded="lg" class="pa-10 my-10">
          <h1 class="my-4">
            Buyable Compounds
          </h1>

          <v-row>
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

                  <p class="mdi mdi-information">
                    The first search performed may take longer than expected.
                  </p>
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" class="my-4">

              <v-row align="center" justify-end justify="space-between" class="mb-2">
                <v-text-field class="mr-auto mx-2 flex-grow-1" v-model="searchSmilesQuery" placeholder="SMILES/SMARTS"
                  prepend-inner-icon="mdi mdi-flask" density="compact" variant="outlined"
                  label="Enter SMILES/SMART to explore"></v-text-field>
                <v-checkbox v-model="searchRegex" label="Use SMARTS" class="mx-2 flex-grow-0">
                </v-checkbox>
                <v-btn color="primary" @click="search" class="mb-6 mx-2">
                  Search
                </v-btn>
              </v-row>

              <v-row align="center" justify="space-between" class="mb-2">

                <v-slider v-model="simThresh" label="Similarity Threshold" min="0" max="1" step="0.0001" class="mr-10"
                  thumb-label="true"></v-slider>

                <v-slider v-model="searchLimit" label="Limit Results" min="1" max="100" step="1" class="mx-4"
                  thumb-label="true"></v-slider>

              </v-row>

              <v-row align="center" justify="space-between" class="mb-3">
                <v-btn color="success" class="mx-2" rounded @click="showAddModal = !showAddModal">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn @click="showSourcesDialog = true" height="40px" color="blue-grey mx-2">
                  Select Sources
                </v-btn>

                <v-dialog v-model="showSourcesDialog" max-width="600px">
                  <v-card>
                    <v-card-title>
                      Select Sources
                    </v-card-title>
                    <v-card-text>
                      <v-checkbox v-model="buyablesSourceAll" @change="searchSourceQuery = []" label="All"></v-checkbox>
                      <v-checkbox v-for="source in buyablesSources" :key="source" v-model="searchSourceQuery"
                        :value="source" :disabled="buyablesSourceAll"
                        :label="source === NO_SOURCE ? NO_SOURCE_TEXT : source"></v-checkbox>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn @click="showSourcesDialog = false">
                        Select
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <v-btn color="info" class="mx-2" rounded @click="showUploadModal = !showUploadModal">
                  <v-icon>mdi-file-upload</v-icon>
                </v-btn>
              </v-row>

            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-dialog v-model="showAddModal" max-width="600px">
                <v-card>
                  <v-card-title>
                    <span class="headline">Add new buyable compound</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field label="SMILES" v-model="addBuyableSmiles"></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12">
                          <v-text-field label="Price per gram" v-model="addBuyablePrice"></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12">
                          <v-text-field label="Source" v-model="addBuyableSource"></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12">
                          <v-checkbox label="Allow overwrite" v-model="allowOverwrite"></v-checkbox>
                        </v-col>
                      </v-row>
                    </v-container>
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
                  <v-card-title>
                    <span class="headline">Upload buyable compound file</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12">
                          <p>
                            File uploads should be in CSV format containing "smiles", "ppg", and "source" columns or in
                            JSON format as an
                            array of objects containing "smiles", "ppg", and "source" fields. Optionally, a
                            "properties" field containing additional metadata can be specified as an array of JSON objects
                            with "name" and
                            "value" fields.
                          </p>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12">
                          <v-file-input label="File" v-model="uploadFile"></v-file-input>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12">
                          <v-select label="Format" v-model="uploadFileFormat" :items="['json', 'csv']"></v-select>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12">
                          <v-checkbox label="Allow overwrite" v-model="allowOverwrite"></v-checkbox>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="showUploadModal = false">Close</v-btn>
                    <v-btn color="green darken-1" text @click="handleUploadSubmit">Upload</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <div>
                <v-data-table v-if="buyables.length" :headers="headers" :items="buyables" :loading="showLoader">
                  <template v-slot:item.smiles="{ item }">
                    <copy-tooltip :data="item.columns.smiles">
                      <smiles-image :smiles="item.columns.smiles" height="80px"></smiles-image>
                    </copy-tooltip>
                  </template>
                  <template v-slot:item.delete="{ item }">
                    <v-icon @click="deleteBuyable(item._id)" class="text-center">mdi-delete</v-icon>
                  </template>
                </v-data-table>
              </div>

            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { API } from "@/common/api";
import { getBuyables } from "@/common/buyables";
import { ref, computed, onMounted, watch } from 'vue';
import SmilesImage from "@/components/SmilesImage.vue";
import CopyTooltip from "@/components/CopyTooltip";

const showSourcesDialog = ref(false);
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

const showLoader = computed(() => {
  return pendingTasks.value > 0
});


onMounted(() => {
  API.get('/api/v2/buyables/sources/')
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
    simThresh.value
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
  formData.append('file', uploadFile.value);
  formData.append('format', uploadFileFormat.value);
  formData.append('allowOverwrite', allowOverwrite.value);
  API.post('/api/v2/buyables/upload/', formData)
    .then(json => {
      if (json.error) {
        alert(json.error)
        return
      }
      alert('Out of ' + json.total_count + ' entries, successfully added ' + json.inserted_count + ', updated ' + json.updated_count + ', and skipped ' + json.duplicate_count + ' duplicates. Only adding (up to) ' + 2 * this.searchLimit + ' documents to the list below')
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
  API.post('/api/v2/buyables/', body)
    .then(json => {
      if (json.error || !json.success) {
        alert('Error adding buyable compound')
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
        if (json.duplicate) {
          alert('Compound already exists in database! Check allow overwrite checkbox to allow overwriting!')
        }
      }
    })
    .finally(() => {
      pendingTasks.value--;
    });
};


const deleteBuyable = (_id) => {
  if (!window.confirm('Click "OK" to confirm deleting this entry')) {
    return;
  }

  pendingTasks.value++;
  API.delete(`/api/v2/buyables/${encodeURIComponent(_id)}`)
  console.log(_id)
    .then(json => {
      if (json.error) {
        alert(json.error)
      }
      if (json['success']) {
        for (let i = 0; i < buyables.value.length; i++) {
          if (buyables.value[i]['_id'] === _id) {
            buyables.value.splice(i, 1)
          }
        }
      }
    })
    .finally(() => {
      pendingTasks.value--;
    });
};



watch(uploadFile, (file) => {
  if (file) {
    if (file.name.endsWith('.json')) {
      uploadFileFormat.value = 'json'
    } else if (file.name.endsWith('.csv')) {
      uploadFileFormat.value = 'csv'
    }
  }
});

</script>