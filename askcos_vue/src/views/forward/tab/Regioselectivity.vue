<template>
    <v-sheet elevation="5" rounded="lg" width="100%" class="pa-6">
        <v-row align="center" justify="space-between">
            <v-col>
                <h3 class="text-h5">Regioselectivity Prediction</h3>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto">
                <v-btn @click="showDialog = true" height="30px" color="blue-grey mx-2">
                    Reference
                </v-btn>
            </v-col>
        </v-row>

    <v-dialog v-model="showDialog" max-width="500px">
        <v-card>
            <v-card-text>
                   <div class="card border-info mb-3">
                      <div class="card-body">
                        <p class="card-text"><em>
                          Predict selectivity of regio-selective reactions. The QM-GNN model combines a WLN graph encoding
                          with predicted quantum descriptors as input to a multitask neural network.
                          <a href="https://doi.org/10.1039/D0SC04823B">(Chem. Sci., 2021, 12, 2198-2208)</a>
                        </em></p>
                      </div>
                    </div>
            </v-card-text>
            <v-divider></v-divider>
        </v-card>
    </v-dialog>
        </v-sheet>
</template>


<script setup>
import { ref } from "vue";

const showDialog = ref(false)
</script>