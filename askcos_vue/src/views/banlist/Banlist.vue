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
import { ref } from 'vue';
import banlist from "@/assets/banlist.svg";

const buyables = ref([]);
const tab = ref("")

</script>

<style scoped>
.left-justify {
  text-justify: inter-word;
}
</style>