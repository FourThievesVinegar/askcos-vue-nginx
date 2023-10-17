<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <div class="mt-8 mb-5">
          <v-breadcrumbs class="pa-0" :items="['Home', 'Results']"></v-breadcrumbs>
          <h1>
            My Results
          </h1>
        </div>
      </v-col>
    </v-row>
    <v-row class="justify-center">
      <v-col cols="12" md="10">
        <v-sheet elevation="2" rounded="lg">
          <v-row class="px-5 pt-4 justify-center">
            <v-col cols="12" md="11">
              <v-text-field v-model="searchQuery" prepend-inner-icon="mdi mdi-flask" density="comfortable"
                variant="outlined" label="Search Result Descriptions" hide-details clearable>
                <template v-slot:append>
                  <v-btn color="primary" size="large">
                    Search
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row class="mb-3 px-3 justify-center">
            <v-col cols="12" md="11">
              <v-row class="px-5 py-4 justify-space-between">
                <v-btn icon="mdi-delete" variant="flat" color="red" @click="deleteSelection"
                  :disabled="selection.length === 0">
                </v-btn>
                <v-btn icon="mdi-refresh" variant="tonal" @click="update">
                </v-btn>
              </v-row>
            </v-col>
          </v-row>

          <v-divider class="border-opacity-30"></v-divider>
          <v-card>
            <v-sheet width="100%" class="pa-6">
              <v-row>
                <v-col cols="12" class="d-flex justify-center align-center">
                  <v-data-table :headers="headers" item-value="result_id" :items="sortedAllResults" show-select
                    v-model:expanded="expanded" show-expand v-model="selection" :items-per-page="10" :search="searchQuery"
                    sort-by.sync="modified" sort-desc.sync="true" v-if="allResults.length">
                    <template v-slot:item.delete="{ item }">
                      <v-icon @click="deleteResult(item.raw.result_id)" class="text-center">mdi-delete</v-icon>
                    </template>
                    <template #item.public="{ item }">
                      <v-icon v-if="item.columns.public === true">
                        mdi-check
                      </v-icon>
                    </template>
                    <template v-slot:item.description="{ item }">
                      {{ item.columns.description || "No Description" }}
                    </template>
                    <template v-slot:expanded-row="{ columns, item }">
                      <tr>
                        <td :colspan="columns.length">
                          <div class="d-flex justify-space-evenly my-3">
                            <span class="text-center" v-if="item.columns.num_trees !== undefined">Found {{
                              item.columns.description }} Tree</span>
                            <span class="text-center" v-if="item.columns.result_type == 'ipp'">Tags:</span>
                            <v-btn color="primary" variant="tonal"
                              v-if="item.columns.result_type === 'tree_builder' && item.columns.result_state === 'completed'"
                              :href="`network?tab=TE&id=${item.raw.result_id}`">
                              View trees
                            </v-btn>
                            <v-btn color="primary" variant="tonal">
                              View in IPP
                            </v-btn>
                            <v-btn color="primary" variant="tonal" v-if="item.columns.result_type === 'tree_builder'"
                              @click="sendTreeBuilderJob(data.item.description, data.item.settings)">
                              View Settings
                            </v-btn>
                            <v-btn class="bg-teal-lighten-3" variant="tonal" @click="showShareModal = !showShareModal">
                              <v-icon color="white">
                                mdi-share
                              </v-icon>
                            </v-btn>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </v-data-table>
                  <div class="text-center" v-else>
                    <v-img :width="400" cover :src="emptyResults"></v-img>
                    <h6 class="text-h6 mt-6">No Results</h6>
                    <p class="text-body-1">All IPP/Tree-Builder job status shows here</p>
                  </div>
                </v-col>
              </v-row>
            </v-sheet>
          </v-card>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="showShareModal" max-width="600px">
    <v-card>
      <v-card-title class="headline">Share Result</v-card-title>
      <v-card-text>
        <p>Use the following link to share this result:</p>
        <v-text-field :value="shareLink" readonly append-icon="mdi-content-copy"
          @click:append="copyToClipboard"></v-text-field>
        <v-alert type="warning">Please note that shared results cannot be edited and saved simultaneously by multiple
          users.</v-alert>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="showShareModal = false">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import emptyResults from "@/assets/emptyResults.svg";
import { API } from "@/common/api";
import dayjs from "dayjs";

const allResults = ref([]);
const totalItems = ref(1);
const pendingTasks = ref(0);
const selection = ref([]);
const selectAll = ref(false);
const expanded = ref([]);
const searchQuery = ref("");
const showSharedResultModal = ref(false);
const showShareModal = ref(false);
const shareLink = ref("");
const sharedResult = ref(null);
const sortDescending = ref(true);

// const showLoader = computed(() => pendingTasks.value > 0);

const sortedAllResults = computed(() => {
  return allResults.value.sort((a, b) => {
    const dateA = new Date(a.modified);
    const dateB = new Date(b.modified);

    if (dateA < dateB) return sortDescending.value ? 1 : -1;
    if (dateA > dateB) return sortDescending.value ? -1 : 1;
    return 0;
  });
})
// const sortBy = ref([{ key: 'modified', order: 'desc' }])
const headers = ref([
  { key: 'description', title: 'Result', },
  { key: 'modified', title: 'Modified' },
  { key: 'result_state', title: 'State' },
  { key: 'result_type', title: 'Type' },
  { key: 'public', title: 'Shared' },
  { key: 'delete', title: 'Delete' },
]);

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  let sharedId = urlParams.get("shared");
  if (sharedId) {
    await addSharedResult(sharedId);
    await update();
    showSharedResultModal.value = true;
  } else {
    await update();
  }
});

watch(selectAll, (newVal) => {
  if (newVal) {
    selection.value = allResults.value.map((res) => res.result_id);
  } else {
    selection.value = [];
  }
});

async function shareResult(id) {
  pendingTasks.value += 1;
  try {
    const params = new URLSearchParams();
    params.append('result_id', id);
    const json = await API.get(`/api/results/share?${params.toString()}`);
    shareLink.value = json.url;
    showShareModal.value = true;
    for (const res of allResults.value) {
      if (res.id === id) {
        res.public = true;
        break;
      }
    }
  } catch (error) {
    alert("Could not share result: " + error);
  } finally {
    pendingTasks.value -= 1;
  }
}

async function addSharedResult(id) {
  pendingTasks.value += 1;
  try {
    const json = await API.get(`/api/v2/results/${id}/add/`);
    json.result.created = dayjs(json.result.created);
    json.result.modified = dayjs(json.result.modified);
    sharedResult.value = json.result;
  } catch (error) {
    alert("Could not add shared result: " + error);
  } finally {
    pendingTasks.value -= 1;
  }
}


const update = async () => {
  pendingTasks.value += 1;
  try {
    const response = await API.get("/api/results/list");
    if (Array.isArray(response)) {
      response.forEach(function (doc) {
        doc.created = dayjs(doc.created).format('MMMM D, YYYY h:mm A');
        doc.modified = dayjs(doc.modified).format('MMMM D, YYYY h:mm A');
      });
      allResults.value = response;
      totalItems.value = response.length;
    } else {
      console.error("API did not return an array as expected:", response);
    }
  } catch (error) {
    console.error("Error fetching results:", error);
  } finally {
    pendingTasks.value -= 1;
  }
}

const deleteSelection = () => {
  if (window.confirm(`This will permanently delete ${selection.value.length} results. Continue?`)) {
    pendingTasks.value += 1;
    for (const id of selection.value) {
      deleteResult(id, true);
    }
    selection.value = [];
    pendingTasks.value -= 1;
  }
}

const deleteResult = (id, skipConfirm = false) => {
  if (skipConfirm || window.confirm('Click "OK" to confirm deleting this result')) {
    pendingTasks.value += 1;
    try {
      const json = API.delete(`/api/results/destroy?result_id=${id}`);
      if (json.success) {
        for (let i = 0; i < allResults.value.length; i++) {
          if (allResults.value[i]["id"] === id) {
            allResults.value.splice(i, 1);
          }
        }
      }
    } finally {
      pendingTasks.value -= 1;
    }
  }
  update()
}

// const sendTreeBuilderJob = (description, settings) => {
//   const url = "/api/tree_search/mcts/call_async";
//   const body = {
//     description: description,
//     store_results: true,
//     json_format: "nodelink",
//   };
//   Object.assign(body, tbSettingsPyToApi(settings));
//   try {
//      API.post(url, body);
//      update();
//   } catch (error) {
//     alert("Failed to submit tree builder job: " + error);
//   }
// }

</script>

<style scoped>
.left-justify {
  text-align: justify;
  text-justify: inter-word;
}
</style>

