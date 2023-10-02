<template>
  <v-sheet elevation="2" rounded="lg" width="100%" class="pa-6">
    <v-card-title>
      <v-row align="center" justify="space-between">
        <v-col>
          <h3 class="text-h5">Celery Worker Status</h3>
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
          <v-btn icon data-cy="refresh-button" @click="getStatus" :disabled="loading">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <div v-if="!loading">
      <v-data-table :headers="headers" :items="data"></v-data-table>
    </div>
    <div v-if="loading">
      <v-skeleton-loader class="mx-auto" min-height="100px" type="table">
      </v-skeleton-loader>
    </div>
  </v-sheet>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API } from '@/common/api'

const data = ref([])
const date = ref(new Date())

const headers = [
  { title: 'Worker Queue', key: 'name' },
  { title: 'Pending Tasks', key: 'pending' },
  { title: 'Busy', key: 'busy' },
  { title: 'Available', key: 'available' }
]

const loading = ref(false)

const getStatus = async () => {
  loading.value = true

  try {
    const json = await API.get('/api/status/celery/get');
    data.value = json['queues'];
    date.value = new Date();
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => getStatus())
</script>