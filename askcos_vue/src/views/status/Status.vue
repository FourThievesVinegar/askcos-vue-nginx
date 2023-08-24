<template>
  <v-container fluid>
    <v-row style="min-height: 100vh" class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <div class="my-8">
          <v-breadcrumbs class="pa-0" :items="['Home', 'Status']"></v-breadcrumbs>
          <h1>
            Server Status
          </h1>
        </div>
        <CeleryStatus />
        <DatabaseStatus />
        <ModelStatus />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import CeleryStatus from "@/views/status/components/CeleryStatus.vue";
import ModelStatus from "@/views/status/components/ModelStatus.vue";
import DatabaseStatus from "@/views/status/components/DatabaseStatus.vue";


</script>
