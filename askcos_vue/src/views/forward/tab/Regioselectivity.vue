<template>
    <v-container fluid class="pa-0">
        <v-sheet elevation="5" rounded="lg" width="100%" class="pa-6">
            <v-row align="center" justify="space-between" class="mx-auto my-auto">
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
                    <v-card-text class="px-8 py-8">
                        <p class="my-4">
                            Predict selectivity of regio-selective reactions. The QM-GNN model combines a WLN
                            graph encoding
                            with predicted quantum descriptors as input to a multitask neural network.
                            <a href="https://doi.org/10.1039/D0SC04823B">(Chem. Sci., 2021, 12, 2198-2208)</a>
                        </p>
                    </v-card-text>
                    <v-divider></v-divider>
                </v-card>
            </v-dialog>

            <v-row>
                <v-col cols="12">
                    <v-data-table v-if="!pending && results.length" :headers="headers" :items="results" :items-per-page="10"
                        height="600px">
                    </v-data-table>


                    <v-skeleton-loader v-if="!!pending" class="mx-auto my-auto" min-height="80px" type="table">
                    </v-skeleton-loader>
                </v-col>
            </v-row>
        </v-sheet>
    </v-container>
</template>


<script setup>
import { ref } from "vue";
import SmilesImage from "@/components/SmilesImage.vue";

const showDialog = ref(false)

const headers = ref([
    { key: 'avg_insp_score', title: 'Inspector Score', align: 'center', },
    { key: 'similarity_to_major', title: 'Similarity Score', align: 'center', },
    { key: 'prd_mw', title: 'Molecular Weight', align: 'center', },
])

</script>