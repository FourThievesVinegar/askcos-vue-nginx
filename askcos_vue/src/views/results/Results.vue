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
              <v-text-field prepend-inner-icon="mdi mdi-flask" density="comfortable" variant="outlined"
                label="Search Result Descriptions" hide-details clearable>
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
                  <v-icon bg-purple-darken-2>mdi-trash-can-outline</v-icon>
                </v-btn>
                <v-btn icon class="bg-teal-lighten-3 white">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </v-row>
            </v-col>
          </v-row>


          <v-divider class="border-opacity-30"></v-divider>
          <v-card>
            <v-row v-if="buyables.length">
              <v-col cols="12">
                //datatable
              </v-col>
            </v-row>
            <v-row v-else class="px-10 py-10">
              <v-col cols="12" class="d-flex justify-center align-center">
                <div class="text-center">
                  <v-img :width="400" cover :src="results"></v-img>
                  <h2 class="mt-6">No Results Yet...</h2>
                  <p class="text-body-1">Please check back later</p>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// import results from "@/assets/results.svg";
// import { ref, watch, computed, onMounted } from "vue";
// import ThePage from "@/components/ThePage";
// import CopyTooltip from "@/components/CopyTooltip";
// import TbSettingsTable from "@/components/TbSettingsTable";
// import { API } from "@/common/api";
// import { tbSettingsPyToApi } from "@/common/tb-settings";
// import dayjs from "dayjs";


// const allResults = ref([]);
// const selection = ref([]);
// const selectAll = ref(false);
// const fields = ref([
//   "selected",
//   { key: "description", label: "Result", sortable: true },
//   { key: "modified", label: "Modified", sortable: true, formatter: (val) => val.format("MMMM D, YYYY h:mm A") },
//   { key: "state", label: "State", sortable: true, formatter: (val) => val || "N/A" },
//   { key: "type", label: "Type", sortable: true },
//   { key: "public", label: "Shared", sortable: true, class: "text-center" },
// ]);
// const currentPage = ref(1);
// const totalItems = ref(1);
// const itemsPerPage = ref(50);
// const pendingTasks = ref(0);
// const searchQuery = ref("");
// const shareLink = ref("");
// const sharedResult = ref(null);
// const showShareModal = ref(false);
// const showSharedResultModal = ref(false);
// const viewSettings = ref(null);

// const showLoader = computed(() => pendingTasks.value > 0);

// watch(selectAll, (newVal) => {
//   if (newVal) {
//     // Box was checked
//     selection.value = allResults.value.map((res) => res.id);
//   } else {
//     // Box was unchecked
//     selection.value = [];
//   }
// });

// onMounted(async () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   let sharedId = urlParams.get("shared");
//   if (sharedId) {
//     await addSharedResult(sharedId);
//     await update();
//     showSharedResultModal.value = true;
//   } else {
//     await update();
//   }
// });

// async function update() {
//   pendingTasks.value += 1;
//   try {
//     const json = await API.get("/api/v2/results/");
//     json.results.forEach(function (doc) {
//       doc.created = dayjs(doc.created);
//       doc.modified = dayjs(doc.modified);
//     });
//     allResults.value = json.results;
//     totalItems.value = json.results.length;
//   } finally {
//     pendingTasks.value -= 1;
//   }
// }

// async function deleteResult(id, skipConfirm = false) {
//   if (skipConfirm || window.confirm('Click "OK" to confirm deleting this result')) {
//     pendingTasks.value += 1;
//     try {
//       const json = await API.delete(`/api/v2/results/${id}/`);
//       if (json.success) {
//         for (let i = 0; i < allResults.value.length; i++) {
//           if (allResults.value[i]["id"] === id) {
//             allResults.value.splice(i, 1);
//           }
//         }
//       }
//     } finally {
//       pendingTasks.value -= 1;
//     }
//   }
// }

// async function shareResult(id) {
//   pendingTasks.value += 1;
//   try {
//     const json = await API.get(`/api/v2/results/${id}/share/`);
//     shareLink.value = json.url;
//     showShareModal.value = true;
//     for (const res of allResults.value) {
//       if (res.id === id) {
//         res.public = true;
//         break;
//       }
//     }
//   } catch (error) {
//     alert("Could not share result: " + error);
//   } finally {
//     pendingTasks.value -= 1;
//   }
// }

// async function addSharedResult(id) {
//   pendingTasks.value += 1;
//   try {
//     const json = await API.get(`/api/v2/results/${id}/add/`);
//     json.result.created = dayjs(json.result.created);
//     json.result.modified = dayjs(json.result.modified);
//     sharedResult.value = json.result;
//   } catch (error) {
//     alert("Could not add shared result: " + error);
//   } finally {
//     pendingTasks.value -= 1;
//   }
// }

// async function deleteSelection() {
//   if (window.confirm(`This will permanently delete ${selection.value.length} results. Continue?`)) {
//     pendingTasks.value += 1;
//     for (const id of selection.value) {
//       await deleteResult(id, true);
//     }
//     selection.value = [];
//     pendingTasks.value -= 1;
//   }
// }

// function onFiltered(items) {
//   totalItems.value = items.length;
// }

// function sortCompare(aObj, bObj, field) {
//   const a = aObj[field];
//   const b = bObj[field];
//   if (field === "created" || field === "modified") {
//     return a.isAfter(b) - a.isBefore(b);
//   } else {
//     return (a > b) - (a < b);
//   }
// }

// async function sendTreeBuilderJob(description, settings) {
//   const url = "/api/v2/tree-builder/";
//   const body = {
//     description: description,
//     store_results: true,
//     json_format: "nodelink",
//   };
//   Object.assign(body, tbSettingsPyToApi(settings));
//   try {
//     await API.post(url, body);
//     await update();
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