<template>
  <v-sheet elevation="5" rounded="lg" width="100%" class="my-6 pa-6">
    <v-card-title>
      <v-row align="center" justify="space-between">
        <v-col>
          <h3 class="text-h5">Model Server Status</h3>
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
    <v-data-table :headers="headers" :items="data" :loading="loading">
      <template v-slot:item.ready="{ item }">
        <v-icon :color="item.ready ? 'error' : 'success'" :icon="item.ready ? 'mdi-alert-circle' : 'mdi-check-circle'" />
      </template>
    </v-data-table>
  </v-sheet>
</template>

<script setup>
import { API } from "@/common/api";
import { onMounted, ref } from "vue"
const data = ref([]);
const date = ref(new Date());

const headers = [
  { key: 'name', title: 'Model Name' },
  { key: 'description', title: 'Model Description' },
  { key: 'version', title: 'Model Versions', formatter: (value) => value.join(', ') },
  { key: 'ready', title: 'Online' },
];

const loading = ref(false);

const getStatus = async () => {
  loading.value = true;

  try {
    const json = await API.get('/api/v2/status/ml/');
    data.value = json['models'];
    date.value = new Date();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => getStatus())
</script>
