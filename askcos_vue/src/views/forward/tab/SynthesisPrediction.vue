<template>
    <v-sheet elevation="5" width="100%" class="pa-6">
        <v-row align="center" justify="space-between">
            <v-col>
                <h3 class="text-h5">Synthesis Recommendation</h3>
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
                        <p class="card-text">
                            <em>
                                Predict most likely outcomes of a chemical reaction using either
                                <br />
                                1) a template-free WLN model for predicting likely bond changes
                                <a href="https://doi.org/10.1039/C8SC04228D">
                                    (Chem. Sci., 2019, 10, 370-377)
                                </a>
                                , or
                                <br />
                                2) a template-free Graph2SMILES model for end-to-end prediction.
                                <a href="https://doi.org/10.1021/acs.jcim.2c00321">
                                    (J. Chem. Inf. Model. 2022, 62, 15, 3503–3513)
                                </a>
                            </em>
                        </p>
                        <p class="card-text">
                            <b>New in 2022.04:</b> Forward prediction model trained on Pistachio dataset. Select in
                            <a>settings menu</a>.
                        </p>
                        <p class="card-text">
                            <b>New in 2022.10:</b> Forward prediction model using Graph2SMILES. Select in
                            <a>settings menu</a>. This new model is capable of making chirality-aware prediction, though it
                            currently doesn't support impurity prediction.
                        </p>
                    </div>
                </div>
            </v-card-text>
            <v-divider></v-divider>
        </v-card>
    </v-dialog>

        <v-data-table v-if="!pending" :headers="headers" :items="results" v-show="results.length > 0" :items-per-page="10" height="400px">
            <template #item.smiles="{ item }">
                <smiles-image :smiles="item.columns.smiles" height="80px"></smiles-image>
            </template>
        </v-data-table>

        <v-skeleton-loader v-if="pending" class="mx-auto" min-height="100px" type="table"></v-skeleton-loader>
    </v-sheet>
</template>

<script setup>
import SmilesImage from "@/components/SmilesImage.vue";
import { ref, defineProps, defineOptions } from 'vue'

const { results, models, pending } = defineProps({
    inheritAttrs: false,
    results: {
        type: Array,
        default: []
    },
    models: {
        type: String,
        default: ''
    },
    pending: {
        type: Number,
        default: 0
    },
})

defineOptions({
    inheritAttrs: false,
});

const showDialog = ref(false)
const headers = ref([
    { key: 'rank', title: 'Rank' },
    { key: 'smiles', title: 'Product' },
    { key: 'prob', title: 'Probability' },
    { key: 'score', title: 'Max. Score' },
    { key: 'mol_wt', title: 'Molecular Weight' },
])
</script>
