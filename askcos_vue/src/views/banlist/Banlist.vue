<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <div class="mt-8 mb-5">
          <v-breadcrumbs class="pa-0" :items="['Home', 'Banlist']"></v-breadcrumbs>
          <h1>
            My Banlist
          </h1>
        </div>
      </v-col>
    </v-row>
    <v-row class="justify-center">
      <v-col cols="12" md="10">
        <v-sheet elevation="2" rounded="lg">
          <v-row class="mb-3 px-5 pt-2">
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
              <v-select v-if="tabItems.length || filterActive !== 'all'" v-model="filterActive" :items="filterOptions"
                item-text="title" item-value="key" label="Filter by status" density="comfortable" variant="outlined"
                hide-details clearable></v-select>
              <v-row v-if="tabItems.length">
                <v-col cols="12">
                  <v-data-table :headers="headers" :items="tabItems" :items-per-page="10" height="400px">
                    <template v-slot:item.active="{ item }">
                      <v-btn @click="toggleActivation(item, activeTab === 0 ? 'chemicals' : 'reactions')" small>
                        <v-icon v-if="item.columns.active">mdi-check-circle</v-icon>
                        <v-icon v-else>mdi-cancel</v-icon>
                        {{ item.columns.active ? 'Active' : 'Inactive' }}
                      </v-btn>
                    </template>
                    <template #item.smiles="{ item }">
                      <copy-tooltip :data="item.columns.smiles">
                        <smiles-image :smiles="item.columns.smiles"></smiles-image>
                      </copy-tooltip>
                    </template>
                    <template v-slot:item.delete="{ item }">
                      <v-icon @click="activeTab === 0 ? deleteChemical(item.key) : deleteReaction(item.key)"
                        class="text-center">mdi-delete</v-icon>
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
              <v-row v-else class="px-10 py-10">
                <v-col cols="12" class="d-flex justify-center align-center">
                  <div v-if="filterActive == 'all'" class="text-center">
                    <v-img :width="400" cover :src="banlist"></v-img>
                    <h2 class="mt-6">No Ban Items</h2>
                    <p class="text-body-1">Please check back later</p>
                  </div>
                  <div v-else class="text-center">
                    <v-img :width="400" cover :src="banlist"></v-img>
                    <h2 class="mt-6">No Ban Items</h2>
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
        <v-col cols="12">Add new banlist entry</v-col></v-card-title>

      <v-card-text class="text-justify">
        <v-row>
          <v-col cols="12">
            <v-select v-model="newType" item-text="key" item-value="title" :items="['chemicals', 'reactions']"
              label="Entry Type" density="comfortable" variant="outlined" hide-details clearable></v-select>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="newSmiles" label="SMILES" maxlength="150" autocomplete="off" density="comfortable"
              variant="outlined" hide-details clearable></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="newDesc" label="Description" maxlength="150" autocomplete="off" density="comfortable"
              variant="outlined" hide-details clearable></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="mb-2">
        <v-spacer></v-spacer>
        <v-btn color="success" @click="addEntry">Submit</v-btn>
        <v-btn text @click="showModal = false">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import banlist from "@/assets/banlist.svg";
import { ref, computed, onMounted, nextTick } from 'vue';
import SmilesImage from "@/components/SmilesImage.vue";
import CopyTooltip from "@/components/CopyTooltip";
import { API } from "@/common/api";
import dayjs from 'dayjs';

const activeTab = ref(0);
const chemicals = ref([]);
const reactions = ref([]);
const showModal = ref(false);
const newSmiles = ref('');
const newDesc = ref('');
const newActive = ref(true)
const newType = ref("chemicals");
const filterActive = ref('all');
const pendingTasks = ref(0);
const filterOptions = ref([
  { key: 'all', title: 'All' },
  { key: 'active', title: 'Active' },
  { key: 'inactive', title: 'Inactive' },
]);

const headers = computed(() => {
  const baseHeaders = [
    { key: 'active', title: 'Active' },
    { key: 'created', title: 'Created' },
    { key: 'smiles', title: 'Chemical' },
    { key: 'description', title: 'Description' },
    { key: 'delete', title: 'Delete' },
  ];

  if (activeTab.value === 1) {
    baseHeaders[2].title = 'Reaction';
  }

  return baseHeaders;
});

const loadCollection = (category) => {
  pendingTasks.value++;
  API.get(`/api/banlist/${category}/get`)
    .then(json => {
      json.forEach(function (doc) {
        doc.created = dayjs(doc.created).format('MMMM D, YYYY h:mm A');
      });
      if (category === 'chemicals') {
        chemicals.value = json
      } else {
        reactions.value = json
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
  let items = activeTab.value === 0 ? chemicals.value : reactions.value;
  switch (filterActive.value) {
    case 'active':
      return items.filter(item => item.active === true);
    case 'inactive':
      return items.filter(item => item.active === false);
    default:
      return items;
  }
});

const addEntry = () => {
  pendingTasks.value++;
  const body = new URLSearchParams({
    description: newDesc.value || 'no description',
    smiles: newSmiles.value,
    active: newActive.value
  }).toString().replace(/\+/g, '%20');
  API.post(`/api/banlist/${newType.value}/post?${body}`)
    .then(json => {
      json.created = dayjs(json.created).format('MMMM D, YYYY h:mm A');
      if (newType.value === 'chemicals') {
        chemicals.value.push(json);
      } else {
        reactions.value.push(json);
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      loadCollection(newType.value === 'chemicals' ? 'chemicals' : 'reactions');
      showModal.value = false;
      nextTick(() => {
        if (newType.value === 'chemicals') {
          activeTab.value = 0;
        } else {
          activeTab.value = 1;
        }
        pendingTasks.value--;
      });
    })
}

const deleteEntry = (id, category) => {
  pendingTasks.value++;

  if (window.confirm('Click "OK" to confirm deleting this entry')) {

    API.delete(`/api/banlist/${category}/delete?_id=${id}`)
      .then(json => {
        if (json['success']) {
          const collection = category === 'chemicals' ? chemicals.value : reactions.value;
          const index = collection.findIndex(item => item.id === id);
          if (index !== -1) {
            collection.splice(index, 1);
          }
        }
      })
      .finally(() => {
        pendingTasks.value--;
      });
  }
}
const deleteChemical = (id) => {
  deleteEntry(id, 'chemicals')
  loadCollection('chemicals');
}

const deleteReaction = (id) => {
  deleteEntry(id, 'reactions')
  loadCollection('reactions');
}

const toggleActivation = async (item, category) => {
  const action = item.columns.active ? 'deactivate' : 'activate';
  try {
    const response = await API.get(`/api/banlist/${category}/${action}`, {
      _id: item.raw.id
    });
    const data = await response.json();
    if (data.success) {
      item.columns.active = !item.columns.active;
    } else {
      console.error("Failed to toggle activation:", data.message);
    }
  } catch (error) {
    console.error("Error toggling activation:", error);
  }
  item.columns.active = !item.columns.active;
  loadCollection(category);
};

</script>

<style scoped>
.left-justify {
  text-justify: inter-word;
}
</style>