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
                <v-btn icon class="bg-red">
                  <v-icon white>mdi-delete</v-icon>
                </v-btn>
                <v-btn icon class="bg-teal-lighten-3 white">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </v-row>
            </v-col>
          </v-row>


          <v-divider class="border-opacity-30"></v-divider>
          <v-card>
             <v-sheet width="100%" class="pa-6">
            <v-row v-if="allResults.length">
              <v-col cols="12">
                <v-data-table :headers="headers" item-value="description" :items="allResults" show-select
                  v-model:expanded="expanded" show-expand v-model="selection" :items-per-page="10" height="400px">
                                    <template v-slot:item.delete="{ item }">
                      <v-icon @click="deleteResult(item.key)"
                        class="text-center">mdi-delete</v-icon>
                    </template>
                  <template #item.public="{ item }">
                    <v-icon  v-if="item.columns.public===true" >
                      mdi-share
                    </v-icon>
                  </template>
                  <template v-slot:expanded-row="{ columns, item }">
                  <tr>
                    <td :colspan="columns.length">
                        <div class="d-flex justify-space-evenly my-3">
                           <span class="text-center">Found {{ item.columns.description }} Tree</span>
                          <v-btn color="primary" variant="tonal">
                            View trees
                          </v-btn>
                          <v-btn color="primary" variant="tonal">
                            View in IPP
                          </v-btn>
                          <v-btn color="primary" variant="tonal">
                            View Settings
                          </v-btn>
                          <v-btn class="bg-teal-lighten-3" variant="tonal">
                            <v-icon color="white">
                              mdi-share
                            </v-icon>
                          </v-btn>
                        </div>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
            <v-row v-else class="px-10 py-10">
              <v-col cols="12" class="d-flex justify-center align-center">
                <div class="text-center">
                  <v-img :width="400" cover :src="results"></v-img>
                  <h2 class="mt-6">No Results Yet...</h2>
                </div>
              </v-col>
            </v-row>
            </v-sheet>
          </v-card>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import results from "@/assets/results.svg";
import { API } from "@/common/api";
import dayjs from "dayjs";

const allResults = ref([]);
const totalItems = ref(1);
const pendingTasks = ref(0);
const selection = ref([]);
const selectAll = ref(false);
const expanded = ref([]);
const searchQuery = ref("");

const headers = ref([
  { key: 'description', title: 'Result' },
  { key: 'modified', title: 'Modified' },
  { key: 'result_state', title: 'State' },
  { key: 'result_type', title: 'Type' },
  { key: 'public', title: 'Shared' },
  { key: 'delete', title: 'Delete' },
]);

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  // let sharedId = urlParams.get("shared");
  // if (sharedId) {
  //   await addSharedResult(sharedId);
  //   await update();
  //   showSharedResultModal.value = true;
  // } else {
  update();
  // }
});

watch(selectAll, (newVal) => {
  if (newVal) {
    selection.value = allResults.value.map((res) => res.result_id);
  } else {
    selection.value = [];
  }
});


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
      console.log(allResults.value)
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
      const json = API.delete(`/api/results/destroy?result_id=${id}/`);
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

</script>

<style scoped>
.left-justify {
  text-align: justify;
  text-justify: inter-word;
}
</style>