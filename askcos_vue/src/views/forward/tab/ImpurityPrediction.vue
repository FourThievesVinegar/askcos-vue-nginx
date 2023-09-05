<template>
    <v-container fluid class="pa-0">
        <v-sheet elevation="5" rounded="lg" width="100%" class="pa-6">
            <v-row align="center" justify="space-between" class="mx-auto my-auto">
                <v-col>
                    <h3 class="text-h5">Impurity Prediction</h3>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="auto">
                    <v-btn v-show="!!result" @click="showDialog = true" height="30px" color="blue-grey mx-2">
                        Export
                    </v-btn>
                    <v-btn @click="showDialog = true" height="30px" color="blue-grey mx-2">
                        Reference
                    </v-btn>
                </v-col>
            </v-row>



            <v-dialog v-model="showDialog" max-width="500px">
                <v-card>
                    <v-card-text class="p-8">
                        <div class="card-body">
                            <p class="my-4">
                                Predict likely impurities for a chemical reaction. Considers minor products, over-reaction,
                                dimerization, solvent adducts, and subsets of reactants.
                            </p>
                        </div>
                    </v-card-text>
                    <v-divider></v-divider>
                </v-card>
            </v-dialog>

            <v-row>
                <v-col cols="12">
                    <v-data-table v-if="!pending && results.length" :headers="headers" :items="results" :items-per-page="10"
                        height="400px">
                        <template #item.prd_smiles="{ item }">
                            <v-tooltip activator="parent" location="top">
                                <span>{{ item.columns.prd_smiles }}</span>
                            </v-tooltip>
                            <smiles-image :smiles="item.columns.prd_smiles" height="80px">
                            </smiles-image>
                        </template>
                        <template #item.avg_insp_score="{ item }">
                            {{ item.columns.avg_insp_score.toFixed(3) }}
                        </template>
                        <template #item.similarity_to_major="{ item }">
                            {{ item.columns.similarity_to_major.toFixed(3) }}
                        </template>
                        <template #item.prd_mw="{ item }">
                            {{ item.columns.prd_mw.toFixed(3) }}
                        </template>
                    </v-data-table>

                      <p v-if="!!pending">Progress: {{ progress.message }}</p>
                </v-col>

            </v-row>
        </v-sheet>
    </v-container>
</template>


<script setup>
import SmilesImage from "@/components/SmilesImage.vue";
import { ref, defineProps, defineOptions } from 'vue'

const showDialog = ref(false)

const { results, models, progress } = defineProps({
    results: {
        type: Array,
        default: [],
    },
    pending: {
        type: Number,
        default: 0
    },
    progress: {
        type: Object,
        default: {}
    },
})

const headers = ref([
    { key: 'no', title: 'No.', align: 'center', },
    { key: 'prd_smiles', title: 'Predicted Impurities', align: 'center', },
    { key: 'modes_name', title: 'Possible Mechanisms', align: 'center', },
    { key: 'avg_insp_score', title: 'Inspector Score', align: 'center', },
    { key: 'similarity_to_major', title: 'Similarity Score', align: 'center', },
    { key: 'prd_mw', title: 'Molecular Weight', align: 'center', },
])
</script>