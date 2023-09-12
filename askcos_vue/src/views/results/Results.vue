<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <div class="mt-8 mb-5">
          <v-breadcrumbs class="pa-0" :items="['Home', 'Results']"></v-breadcrumbs>
          <h1>
            My Results
          </h1>
        </div>
      </v-col>
    </v-row>
    <v-row class="justify-center">
      <v-col cols="12" md="10">
        <v-sheet elevation="2" rounded="lg">
          <v-row class="px-5 pt-4 justify-center">
            <v-col cols="12" md="11">
              <v-text-field prepend-inner-icon="mdi mdi-flask" density="comfortable" variant="outlined"
                label="Search Result Descriptions" hide-details clearable>
                <template v-slot:append>
                  <v-btn color="primary" size="large">
                    Search
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row class="mb-3 px-3 justify-center">
            <v-col cols="12" md="11">
              <v-row class="px-5 py-4 justify-space-between">
                <v-btn icon class="bg-red">
                  <v-icon bg-purple-darken-2>mdi-trash-can-outline</v-icon>
                </v-btn>
                <v-btn icon class="bg-teal-lighten-3 white">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </v-row>
            </v-col>
          </v-row>


          <v-divider class="border-opacity-30"></v-divider>
          <v-card>
            <v-row v-if="buyables.length">
              <v-col cols="12">
                //datatable
              </v-col>
            </v-row>
            <v-row v-else class="px-10 py-10">
              <v-col cols="12" class="d-flex justify-center align-center">
                <div class="text-center">
                  <v-img :width="400" cover :src="results"></v-img>
                  <h2 class="mt-6">No Results Yet...</h2>
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
import results from "@/assets/results.svg";

const buyables = ref([]);

</script>

<style scoped>
.left-justify {
  text-align: justify;
  text-justify: inter-word;
}
</style>