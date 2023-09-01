<template>
      <v-container fluid class="pa-0" >
        <v-sheet elevation="5" rounded="lg" width="100%" class="pa-6">
            <v-row align="center" justify="space-between" class="mx-auto my-auto">
            <v-col>
                <h3 class="text-h5">Impurity Prediction</h3>
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
    </v-sheet>
        </v-container>
</template>


<script setup>
import { ref } from "vue";

const showDialog = ref(false)

const headers = ref([
    { key: 'rank', title: 'Rank' },
    { key: 'smiles', title: 'Product' },
    { key: 'prob', title: 'Probability' },
    { key: 'score', title: 'Max. Score' },
    { key: 'mol_wt', title: 'Molecular Weight' },
])
</script>