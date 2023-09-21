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
          <v-row class="mb-2 mt-3 px-5 pt-2">
            <v-col cols="12">
              <p class="text-body-3 left-justify">
                This page lists chemicals and reactions that you have identified as problematic in some way. Entries
                listed as active will be excluded from retrosynthetic predictions using the interactive path planner and
                tree builder. You can delete or deactivate any of these banned items at any time.
              </p>
            </v-col>
          </v-row>


          <v-divider class="border-opacity-30"></v-divider>
          <v-card>
            <v-tabs v-model="tab" color="primary" align-tabs="center" grow class="mb-4">
              <v-tab>Chemicals</v-tab>
              <v-tab>Reactions</v-tab>
            </v-tabs>

            <v-row v-if="buyables.length">
              <v-col cols="12">
                //datatable
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
          </v-card>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import banlist from "@/assets/banlist.svg";
import { ref, computed, onMounted } from 'vue';
import SmilesImage from "@/components/SmilesImage";
import { API } from "@/common/api";
import dayjs from 'dayjs';


const buyables = ref([]);
const tab = ref("")
const activeTab = ref(0);
const chemicals = ref([]);
const reactions = ref([]);
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

const toggleActivation = (id, category, action) => {
  pendingTasks.value++;
  API.get(`/api/v2/banlist/${category}/${encodeURIComponent(id)}/${action}/`)
    .then(json => {
      if (json['success']) {
        const updatedEntry = json['data'];
        updatedEntry.created = dayjs(updatedEntry.created).format('MMMM D, YYYY h:mm A');
        const collection = category === 'chemicals' ? chemicals.value : reactions.value
        for (let i = 0; i < collection.length; i++) {
          if (collection[i]['id'] === id) {
            collection.splice(i, 1, updatedEntry)
            break
          }
        }
      }
    })
    .finally(() => {
      pendingTasks.value--;
    })
}

const activateChemical = (id) => {
  toggleActivation(id, 'chemicals', 'activate')
}

const deactivateChemical = (id) => {
  toggleActivation(id, 'chemicals', 'deactivate')
}

const activateReaction = (id) => {
  toggleActivation(id, 'reactions', 'activate')
}

const deactivateReaction = (id) => {
  toggleActivation(id, 'reactions', 'deactivate')
}

</script>

<style scoped>
.left-justify {
  text-justify: inter-word;
}
</style>