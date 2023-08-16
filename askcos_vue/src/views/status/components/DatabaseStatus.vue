<template>
  <v-sheet elevation="5" rounded="lg" width="100%" class="my-6 pa-6">
    <v-card-title>
      <v-row align="center" justify="center">
        <v-col cols="auto">
          <h3 class="text-h5">Database Status</h3>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="auto">
          <span class="text-body-2 mr-3">Last Update:
            <timeago :datetime="date" :converter-options="{
              includeSeconds: true,
              addSuffix: false,
              useStrict: false,
            }" auto-update />
            ago
          </span>
          <v-btn icon @click="getStatus" :disabled="loading">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <div>
      <v-data-table v-model:expanded="expanded" :headers="headers" :items="data" :loading="loading" show-expand
        item-value="name">

        <template v-slot:item.url="{ item }">
          <router-link v-if="item.columns.url" :to="item.columns.url">
            <v-btn color="primary">
              Search Collection
            </v-btn>
          </router-link>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
          <td :colspan="columns.length">
            <v-table density="compact" class="text-left">
              <thead>
                <tr>
                  <th class="text-left">{{ item.raw.field }}</th>
                  <th class="text-left">Documents</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(value, key) in item.raw.details" :key="key">
                  <td>{{ key }}</td>
                  <td>{{ value }}</td>
                </tr>
              </tbody>
            </v-table>
          </td>
        </template>

      </v-data-table>
    </div>
  </v-sheet>
</template>


<script setup>
import { API } from "@/common/api";
import { ref, onMounted } from "vue";
const data = ref([]);
const headers = [
  { key: 'name', title: 'Collection Name' },
  { key: 'description', title: 'Description' },
  { key: 'total', title: 'Total Documents' },
  { key: 'url', title: '' },
  { key: 'show_details', title: '' }];
const loading = ref(false);
const expanded = ref([])
const date = ref(new Date())

const getStatus = async () => {
  loading.value = true;
  try {
    const json = await API.get('/api/v2/status/database/');
    data.value = json['collections'];
    date.value = new Date();
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false;
  }
};

onMounted(() => getStatus())

</script>


