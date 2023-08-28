<template>
    <v-sheet elevation="5" width="100%" class="pa-6">
        <v-row align="center" justify="space-between">
            <v-col>
                <h3 class="text-h5">Condition Recommendation</h3>
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
                            Predict reagents, catalysts, solvents and temperature for a desired transformation using a
                            neural
                            network model.
                            <a href="https://doi.org/10.1021/acscentsci.8b00357">(ACS Cent. Sci., 2018, 4, 1465-1476)</a>
                        </em></p>
                    <p class="card-text">
                        <b>New in 2021.01:</b> Quantitative condition predictions now available using neural network v2
                        model. Select in <a v-b-modal.settings-modal href="#">settings menu.</a>
                    </p>
                </div>
            </v-card-text>
            <v-divider></v-divider>
        </v-card>
    </v-dialog>

    <!-- <pre>{{ JSON.stringify(results, null, 2) }}</pre> -->
    <div v-if="!pending">
        <v-data-table :headers="headers" :items="results" v-if="results.length" :items-per-page="10" height="400px">
            <template v-slot:item.solvent="{ item }">
                <smiles-image :smiles="item.columns.solvent" height="80px"></smiles-image>
            </template>
        </v-data-table>
    </div>
    <div v-if="pending">
        <v-skeleton-loader class="mx-auto" min-height="80px" type="table">
        </v-skeleton-loader>
    </div>
</template>


<script setup>
import SmilesImage from "@/components/SmilesImage.vue";
import { ref, defineProps, defineEmits } from 'vue'

const showDialog = ref(false)

const { results, models } = defineProps({
    results: {
        type: Array,
        default: [],
    },
    models: {
        type: Array,
        default: []
    },
    pending: {
        type: Number,
        default: 0
    },
})

const headers = ref([
    { key: 'solvent', title: 'Solvent' },
    { key: 'reagent', title: 'Reagents' },
    { key: 'temperature', title: 'Temperature' },
    { key: 'solvent_score', title: 'Solvent Score' }
])

const emits = defineEmits(['go-to-forward'])

// const goToForward = (index) => {
//     emits('go-to-forward', index)
// }

</script>