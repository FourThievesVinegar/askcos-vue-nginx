<template>
  <v-sheet elevation="5" rounded="lg" width="100%" class="pa-6">
  <v-card-title>
    <v-row align="center" justify="space-between">
      <v-col>  
        <h3 class="text-h5">Celery Worker Status</h3>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="auto">
        <v-btn icon @click="getStatus" :disabled="loading">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-card-title>
    <div>
      <v-data-table :headers="headers" :items="data" :loading="loading"></v-data-table>
    </div>
  </v-sheet>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API } from '@/common/api'

const data = ref([])

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
    const json = await API.get('/api/v2/status/celery/');
    data.value = json['queues'];
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => getStatus())
</script>