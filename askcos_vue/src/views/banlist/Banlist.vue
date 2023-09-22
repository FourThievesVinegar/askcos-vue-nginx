<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <div class="mt-8 mb-2">
          <v-breadcrumbs class="pa-0" :items="['Home', 'Banlist']"></v-breadcrumbs>
          <h1>
            Your banned items
          </h1>
        </div>
      </v-col>
    </v-row>
    <v-row class="justify-center">
      <v-col cols="12" md="10">
        <v-sheet elevation="2" rounded="lg">
          <v-row class="mb-3 mt-3 px-5 pt-2">
            <v-col cols="12">
              <p class="text-body-3 left-justify">
                This page lists chemicals and reactions that you have identified as problematic in some way. Entries
                listed as active will be excluded from retrosynthetic predictions using the interactive path planner and
                tree builder. You can delete or deactivate any of these banned items at any time.
              </p>
            </v-col>
            <v-col cols="12" class="d-flex justify-center">
              <v-btn variant="tonal" color="teal-darken-1 " @click="showModal = true">Add New Entry</v-btn>
            </v-col>
          </v-row>


          <v-divider class="border-opacity-30"></v-divider>
          <v-card>
            <v-tabs v-model="activeTab" color="primary" align-tabs="center" grow class="mb-4">
              <v-tab>Chemicals</v-tab>
              <v-tab>Reactions</v-tab>
            </v-tabs>
            <v-sheet width="100%" class="pa-6">
              <v-row v-if="tabItems.length" >
                <v-col cols="12">
                  <v-data-table :headers="headers" :items="tabItems" :items-per-page="10" height="400px">
                    <template #item.smiles="{ item }">
                      <copy-tooltip :data="item.columns.smiles">
                        <smiles-image :smiles="item.columns.smiles" ></smiles-image>
                      </copy-tooltip>
                    </template>
                                    <template v-slot:item.delete="{ item }">
                    <v-icon @click="deleteBuyable(item._id)" class="text-center">mdi-delete</v-icon>
                  </template>
                  </v-data-table>
                </v-col>
              </v-row>
              <v-row v-else class="px-10 py-10">
                <v-col cols="12" class="d-flex justify-center align-center">
                  <div class="text-center">
                    <v-img :width="400" cover :src="banlist"></v-img>
                    <h2 class="mt-6">No Ban Items</h2>
                    <p class="text-body-1">Please check back later</p>
                  </div>
                </v-col>
              </v-row>
            </v-sheet>
          </v-card>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>

   <v-dialog v-model="showModal" max-width="600px">
    <v-card>
      <v-card-title class="mt-2">
                    <span class="headline">Add new banlist entry</span></v-card-title>
      <v-card-text class="text-justify">
          <v-row>
            <v-col cols="12">
              <p>
                File uploads should be in CSV format containing "smiles", "ppg", and "source" columns or
                in
                JSON format as an
                array of objects containing "smiles", "ppg", and "source" fields. Optionally, a
                "properties" field containing additional metadata can be specified as an array of JSON
                objects
                with "name" and
                "value" fields.
              </p>
            </v-col>
          </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
      <!-- <v-dialog v-model="dialog" activator="parent" max-width="600px">
          <v-card>
              <v-card-title class="mt-2">
                  <v-col cols="12">Send support email</v-col></v-card-title>

              <v-card-text class="text-justify">
                  <v-row >
                      <v-col cols="12">
                          <v-select v-model="selectedModule" :items="moduleOptions" item-text="text" item-value="value"
                              label="Select module" density="comfortable" variant="outlined" hide-details
                              clearable></v-select>
                      </v-col>
                      <v-col cols="12">
                          <v-select v-model="selectedCategory" :items="categoryOptions" item-text="text" item-value="value"
                              label="Select issue category" density="comfortable" variant="outlined" hide-details
                              clearable></v-select>
                      </v-col>
                      <v-col cols="12">
                          <v-text-field v-model="supportSubject" label="Email subject line"
                              placeholder="Subject line (max length: 150 characters)" maxlength="150" autocomplete="off"
                              density="comfortable" variant="outlined" hide-details clearable></v-text-field>
                      </v-col>
                      <v-col cols="12">
                          <v-checkbox v-model="supportShared"
                              label="I wish to share this information with other Consortium members" density="comfortable" hide-details></v-checkbox>
                      </v-col>
                      <v-col cols="12">
                      <span>
                          NOTE: Clicking "Submit" should launch your email client to send us an email. If this is blocked for some
                          reason, please include the above information in an email you compose separately to
                      </span>
                      </v-col>
                  </v-row>
              </v-card-text>
              <v-card-actions class="mb-2">
                  <v-spacer></v-spacer>
                  <v-btn color="success" @click="submitSupport, dialog = false">Submit</v-btn>
                  <v-btn text @click="dialog = false">Cancel</v-btn>
              </v-card-actions>
          </v-card>
      </v-dialog> -->
</template>

<script setup>
import banlist from "@/assets/banlist.svg";
import { ref, computed, onMounted, watch } from 'vue';
import SmilesImage from "@/components/SmilesImage.vue";
import CopyTooltip from "@/components/CopyTooltip";
import { API } from "@/common/api";
import dayjs from 'dayjs';


// const buyables = ref([]);
// const tab = ref("")
const activeTab = ref(0);
const chemicals = ref([]);
const reactions = ref([]);
const showModal = ref(false);
const newSmiles = ref('');
const newDesc = ref('');
const newActive = ref(true);
const newType = ref('chemicals');
const filterActive = ref('all');
const pendingTasks = ref(0);
const filterOptions = ref([
  { text: 'All', value: 'all' },
  { text: 'Active', value: 'active' },
  { text: 'Inactive', value: 'inactive' },
]);
const headers = ref([
  { key: 'active', title: 'Active' },
  { key: 'created', title: 'Created' },
  { key: 'smiles', title: 'Chemical' },
  { key: 'description', title: 'Description' },
  { key: 'delete', title: 'Delete' },
]);

const loadCollection = (category) => {
  pendingTasks.value++;
  API.get(`/api/banlist/${category}/get`)
    .then(json => {
      json.forEach(function (doc) {
        doc.created = dayjs(doc.created).format('MMMM D, YYYY h:mm A');
      });
      if (category === 'chemicals') {
        chemicals.value = json
        console.log(chemicals.value)
      } else {
        reactions.value = json
        console.log(reactions.value)
      }
    })
    .finally(() => {
      pendingTasks.value--;
    })
}

onMounted(() => {
  loadCollection('chemicals');
  loadCollection('reactions');
});

const tabItems = computed(() => {
  return activeTab.value === 0 ? chemicals.value : reactions.value;
});

const filteredChemicals = computed(() => {
  if (filterActive.value === 'active') {
    return chemicals.value.filter(entry => entry.active)
  } else if (filterActive.value === 'inactive') {
    return chemicals.value.filter(entry => !entry.active)
  } else {
    return chemicals.value
  }
});

const filteredReactions = computed(() => {
  if (filterActive.value === 'active') {
    return reactions.value.filter(entry => entry.active)
  } else if (filterActive.value === 'inactive') {
    return reactions.value.filter(entry => !entry.active)
  } else {
    return reactions.value
  }
});

const showLoader = computed(() => {
  return pendingTasks.value > 0
});

const addEntry = () => {
  pendingTasks.value++;
  const body = {
    smiles: newSmiles.value,
    description: newDesc.value || 'no description',
    active: newActive.value,
  };
  API.post(`/api/v2/banlist/${newType.value}/`, body)
    .then(json => {
      json.created = dayjs(json.created).format('MMMM D, YYYY h:mm A');
      if (newType.value === 'chemicals') {
        chemicals.value.push(json);
        activeTab.value = 0
      } else {
        reactions.value.push(json);
        activeTab.value = 1
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      pendingTasks.value--;
    })
}

const deleteEntry = (id, category) => {
  pendingTasks.value++;
  if (window.confirm('Click "OK" to confirm deleting this entry')) {
    API.delete(`/api/v2/banlist/${category}/${encodeURIComponent(id)}/`)
      .then(json => {
        if (json['success']) {
          const collection = category === 'chemicals' ? chemicals.value : reactions.value
          for (let i = 0; i < collection.length; i++) {
            if (collection[i]['id'] === id) {
              collection.splice(i, 1)
              break
            }
          }
        }
      })
      .finally(() => {
        pendingTasks.value--;
      })
  }
}

const deleteChemical = (id) => {
  deleteEntry(id, 'chemicals')
}

const deleteReaction = (id) => {
  deleteEntry(id, 'reactions')
}

// const toggleActivation = (id, category, action) => {
//   pendingTasks.value++;
//   API.get(`/api/v2/banlist/${category}/${encodeURIComponent(id)}/${action}/`)
//     .then(json => {
//       if (json['success']) {
//         const updatedEntry = json['data'];
//         updatedEntry.created = dayjs(updatedEntry.created).format('MMMM D, YYYY h:mm A');
//         const collection = category === 'chemicals' ? chemicals.value : reactions.value
//         for (let i = 0; i < collection.length; i++) {
//           if (collection[i]['id'] === id) {
//             collection.splice(i, 1, updatedEntry)
//             break
//           }
//         }
//       }
//     })
//     .finally(() => {
//       pendingTasks.value--;
//     })
// }

// const activateChemical = (id) => {
//   toggleActivation(id, 'chemicals', 'activate')
// }

// const deactivateChemical = (id) => {
//   toggleActivation(id, 'chemicals', 'deactivate')
// }

// const activateReaction = (id) => {
//   toggleActivation(id, 'reactions', 'activate')
// }

// const deactivateReaction = (id) => {
//   toggleActivation(id, 'reactions', 'deactivate')
// }

</script>

<style scoped>
.left-justify {
  text-justify: inter-word;
}
</style>