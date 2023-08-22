<template>
    <v-sheet elevation="5" rounded="lg" width="100%" class="pa-6">
        <v-row align="center" justify="space-between">
            <v-col>
                <h3 class="text-h5">Site Selectivity Prediction</h3>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto">
                <v-btn @click="showDialog = true" height="30px" color="blue-grey mx-2">
                    Reference
                </v-btn>
            </v-col>
        </v-row>
    </v-sheet>


    <v-dialog v-model="showDialog" max-width="500px">
        <v-card>
            <v-card-text>
                <div class="card-body">
                        <p class="card-text"><em>
                          Predict site selectivity of aromatic C-H functionalization reactions with a multitask neural
                          network that uses a WLN graph encoding.
                          <a href="https://doi.org/10.1039/D0RE00071J">(React. Chem. Eng., 2020, 5, 896-902)</a>
                        </em></p>
                      </div>
            </v-card-text>
            <v-divider></v-divider>
        </v-card>
    </v-dialog>
</template>


<script setup>
import { ref } from "vue";

const showDialog = ref(false)
</script>