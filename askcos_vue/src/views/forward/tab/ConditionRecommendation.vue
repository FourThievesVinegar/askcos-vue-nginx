<template>
    <v-container fluid class="pa-0">
        <v-sheet elevation="5" rounded="lg" width="100%" class="pa-6">
            <v-row align="center" justify="space-between" class="mx-auto my-auto">
                <v-col>
                    <h3 class="text-h5">Condition Recommendation</h3>
                    <b v-if=!!score>Reaction score: {{ score.toFixed(3) }}</b>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="auto">
                    <v-btn v-show="!!results.length" @click="handleClick" :disabled="evaluating" height="30px"
                        color="primary mx-2">
                        Evaluate Reaction(s)
                    </v-btn>
                    <v-btn @click="showDialog = true" height="30px" color="blue-grey mx-2">
                        Reference
                    </v-btn>
                </v-col>
            </v-row>

            <v-dialog v-model="showDialog" max-width="500px">
                <v-card>
                    <v-card-text class="px-8 py-8">
                        <p class="my-4">
                            Predict reagents, catalysts, solvents and temperature for a desired transformation using a
                            neural
                            network model.
                            <a href="https://doi.org/10.1021/acscentsci.8b00357">(ACS Cent. Sci., 2018, 4, 1465-1476)</a>
                        </p>
                        <p class="my-4">
                            <b>New in 2021.01:</b> Quantitative condition predictions now available using neural network v2
                            model. Select in <a>settings menu.</a>
                        </p>
                    </v-card-text>
                    <v-divider></v-divider>
                </v-card>
            </v-dialog>

            <v-data-table class="mx-auto my-auto " v-if="models === 'neuralnetwork' && !pending && results.length"
                :headers="headers" :items="results" v-show="results.length > 0" :items-per-page="10" height="600px">
                <template v-slot:item.index="{ index }">
                    {{ index + 1 }}
                </template>
                <template v-slot:item.evaluation="{ item }">
                    <td class="text-center">
                        <v-progress-circular indeterminate
                            v-if="pendingRank > 0 && item.columns.evaluation === undefined"></v-progress-circular>

                        <span v-else-if="item.columns.evaluation">
                            <v-icon>mdi-check</v-icon> (rank: {{ item.columns.evaluation }})
                        </span>

                        <span v-else-if="item.columns.evaluation !== undefined && !item.columns.evaluation">
                            <v-icon>mdi-close</v-icon> (rank: N/A)
                        </span>
                    </td>
                </template>
                <template v-slot:item.solvent_score="{ item }">
                    <v-chip :color="getColor(item.columns.solvent_score)">
                        {{ item.columns.solvent_score }}
                    </v-chip>
                </template>
                <template #item.reagent="{ item }">
                    <v-tooltip activator="parent" location="top">
                        <span>{{ item.columns.reagent }}</span>
                    </v-tooltip>
                    <smiles-image :smiles="item.columns.reagent" height="80px"></smiles-image>
                </template>
                <template #item.solvent="{ item }">
                    <v-tooltip activator="parent" location="top">
                        <span>{{ item.columns.solvent }}</span>
                    </v-tooltip>
                    <smiles-image :smiles="item.columns.solvent" height="80px"></smiles-image>
                </template>
                <template #item.temperature="{ item }">
                    {{ Math.round(item.columns.temperature) }} &deg;C
                </template>
                <template #item.catalyst_name_only="{ item }">
                    <div class="text-center">
                        <template v-if="!!item.columns.catalyst || !!item.columns.catalyst_name_only">
                            <smiles-image v-if="!!item.columns.catalyst" :smiles="item.columns.catalyst"></smiles-image>
                            {{ item.columns.catalyst_name_only }}
                        </template>
                        <template v-else>
                            None
                        </template>
                    </div>
                </template>
                <template #item.predict="{ item, index }">
                    <v-btn variant="tonal" @click="emitGoToForward(index)" :id="'predict-conditions-' + index"
                        title="Predict products">
                        <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                </template>
            </v-data-table>

            <v-data-table class="mx-auto my-auto " v-else-if="models === 'neuralnetworkv2' && !pending && results.length"
                :headers="headersAlt" :items="results" v-show="results.length > 0" :items-per-page="10" height="600px">
                <template v-slot:item.index="{ index }">
                    {{ index + 1 }}
                </template>
                <template v-slot:item.evaluation="{ item }">
                    <td class="text-center">
                        <v-progress-circular indeterminate
                            v-if="pendingRank > 0 && item.columns.evaluation === undefined"></v-progress-circular>

                        <span v-else-if="item.columns.evaluation">
                            <v-icon>mdi-check</v-icon> (rank: {{ item.columns.evaluation }})
                        </span>

                        <span v-else-if="item.columns.evaluation !== undefined && !item.columns.evaluation">
                            <v-icon>mdi-close</v-icon> (rank: N/A)
                        </span>
                    </td>
                </template>
                <template #item.reactants="{ item }">
                    <div v-for="(amount, rct) in item.columns.reactants" :key="rct">
                        <smiles-image :smiles="rct"></smiles-image>
                        ({{ amount.toFixed(2) }})
                    </div>
                </template>
                <template v-slot:item.reagents="{ item }">
                    <div v-if="!!item.columns.reagents" class="text-center" v-for="(amount, rgt) in item.columns.reagents"
                        :key="rgt">
                        <smiles-image :smiles="rgt"></smiles-image>
                        ({{ (amount > 0.01) ? amount.toFixed(2) : amount.toExponential(2) }})
                    </div>
                    <span v-else class="text-center">None</span>
                </template>
                <template #item.predict="{ item, index }">
                    <v-btn variant="tonal" @click="emitGoToForward(index)" :id="'predict-conditions-' + index"
                        title="Predict products">
                        <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                </template>
            </v-data-table>


            <v-skeleton-loader v-else-if="!!pending" class="mx-auto my-auto" min-height="80px" type="table">
            </v-skeleton-loader>
        </v-sheet>
    </v-container>
</template>


<script setup>
import SmilesImage from "@/components/SmilesImage.vue";
import { ref, watch } from 'vue'

const showDialog = ref(false)

console.log('Initial models:', models);

const { results, models, pending } = defineProps({
    inheritAttrs: false,
    results: {
        type: Array,
        default: [],
    },
    models: {
        type: String,
        default: ""
    },
    pending: {
        type: Number,
        default: 0
    },
    pendingRank: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: null
    },
    evaluating: {
        type: Boolean,
        default: false
    }
})

const headers = ref([
    { key: 'index', title: '#', align: 'center', },
    { key: 'evaluation', title: 'Rank', align: 'center', },
    { key: 'solvent', title: 'Solvent', align: 'center', },
    { key: 'reagent', title: 'Reagents', align: 'center', },
    { key: 'catalyst_name_only', title: 'Catalyst', align: 'center', },
    { key: 'temperature', title: 'Temperature', align: 'center', },
    { key: 'solvent_score', title: 'Solvent Score', align: 'center', },
    { key: 'predict', title: 'Predict with conditions', align: 'center', }
])


const headersAlt = ref([
    { key: 'index', title: '#', align: 'center', },
    { key: 'evaluation', title: 'Rank', align: 'center', },
    { key: 'reactants', title: 'Reactants (Amount)', align: 'center', },
    { key: 'reagents', title: 'Reagents (Amount)', align: 'center', },
    { key: 'predict', title: 'Predict with conditions', align: 'center', }
])


const getColor = (score) => {
    if (score === 1) return 'green'
    else return 'orange'
}

const emits = defineEmits()

const emitGoToForward = (index) => {
    emits('go-to-forward', index);
}

const handleClick = () => {
    emits('evaluate');
}

</script>
