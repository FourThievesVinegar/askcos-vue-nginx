<template>
  <v-sheet elevation="5" rounded="lg" width="100%" class="pa-6">
    <v-card-title>
      <v-spacer></v-spacer>
      <h3 class="text-h5">Celery Worker Status</h3>
      <v-btn icon @click="getStatus" :disabled="loading" title="Refresh celery status">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>
<div>
    <v-data-table  :headers="headers" :items="data"></v-data-table>
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
    console.log(data.value)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => getStatus())
</script>