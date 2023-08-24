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

    <v-data-table :headers="headers" :items="results" :items-per-page="10" v-if="results.length > 0" :loading="loading">

        <!-- <template v-slot:item.evaluation="{ item }">
            <v-progress-circular v-if="item.columns.evaluating" indeterminate color="primary"></v-progress-circular>

            <v-icon v-else-if="item.columns.evaluation" small color="success">
                mdi-check
            </v-icon>

            <v-icon v-else small color="error">
                mdi-close
            </v-icon>
        </template>

        <template v-slot:item.reagents="{ item }">
            <v-avatar v-if="item.columns.reagent">
                <v-img :src="getSmilesImg(item.columns.reagent)"></v-img>
            </v-avatar>
            {{ item.reagent_name_only }}
        </template>

        <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="predictForward(item)">
                mdi-arrow-right-bold
            </v-icon>
        </template> -->

    </v-data-table>
</template>


<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const showDialog = ref(false)

const props = defineProps({
    results: {
        type: Array,
        default: [],
        required: true
    },
    models: {
        type: Array,
        default: []
    },
})

const headers = [
    // { key: '#', title: 'index' },
    // { key: 'Rank', title: 'Rank' },
    { key: 'solvent', title: 'solvent' },
    { key: 'reagent', title: 'Reagents' },
    { key: 'temperature', title: 'Temperature' },
    { key: 'solvent_score', title: 'solvent_score' }
]

// const emits = defineEmits(['go-to-forward'])

// const goToForward = (index) => {
//     emits('go-to-forward', index)
// }

</script>