<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col cols="12" md="12" xl="10">
        <div class="my-4">
          <v-breadcrumbs class="pa-0 text-body-1" :items="breadCrumbItems">
            <template v-slot:prepend>
              <v-icon icon="mdi-home" size="small"></v-icon>
            </template>
          </v-breadcrumbs>
          <h4 class="text-h4 text-primary">
            Server Status
          </h4>
        </div>
      </v-col>
    </v-row>
    <v-row class="justify-center my-0">
      <v-col cols="12" md="12" xl="10">
        <CeleryStatus />
      </v-col>
    </v-row>
    <v-row class="justify-center my-0">
      <v-col cols="12" md="12" xl="10">
        <DatabaseStatus />
      </v-col>
    </v-row>
    <v-row class="justify-center my-0">
      <v-col cols="12" md="12" xl="10">
        <ModelStatus />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import CeleryStatus from "@/views/status/components/CeleryStatus.vue";
import ModelStatus from "@/views/status/components/ModelStatus.vue";
import DatabaseStatus from "@/views/status/components/DatabaseStatus.vue";
import { useRoute } from 'vue-router';
const route = useRoute();
const breadCrumbItems = [{ title: 'Home', to: "/" }, { title: route.meta.title }]


</script>
