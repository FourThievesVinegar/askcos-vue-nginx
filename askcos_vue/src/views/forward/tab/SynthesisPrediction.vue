<template>
        <v-container fluid class="pa-0">
            <v-sheet elevation="2" rounded="lg" width="100%" class="pa-6">
                <v-row align="center" justify="space-between" class="mx-auto my-auto">
                <v-col>
                    <span class="text-body-1 ml-2"><b>Product Prediction</b> </span>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="auto">
                    <v-btn variant="flat" v-show="!!results.length" @click="emitDownloadForward" height="30px"
                        color="primary mx-2">
                        Export
                    </v-btn>
                </v-col>
            </v-row>

            <v-data-table v-if="!pending && results.length" :headers="headers" :items="results" v-show="results.length > 0"
                :items-per-page="10" height="600px">
                <template #item.outcome="{ item }">
                    <v-tooltip activator="parent" location="top">
                        <span>{{ item.columns.outcome }}</span>
                    </v-tooltip>
                    <smiles-image :smiles="item.columns.outcome" height="80px"></smiles-image>
                </template>
                <template #item.prob="{ item }">
                    {{ item.columns.prob.toFixed(4) }}
                </template>
                <template #item.score="{ item }">
                    {{ item.columns.score.toFixed(3) }}
                </template>
                <template #item.mol_wt="{ item }">
                    {{ item.columns.mol_wt.toFixed(1) }}
                </template>
                <template #item.predict_impurities="{ item, index }">
                    <v-btn variant="tonal" @click="emitGoToImpurity(item.columns.outcome)"
                        :id="'predict-impurities-' + index" title="Predict products">
                        <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                </template>
                <template #item.predict_selectivity="{ item, index }">
                    <v-btn variant="tonal" @click="goToSelectivity(item.columns.outcome)" :id="'predict-regio-selectivities-' + index"
                        title="Predict products">
                        <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
            <v-skeleton-loader v-if="!!pending" class="mx-auto" min-height="100px" type="table"></v-skeleton-loader>
            <v-row align="center" justify="space-between" class="mx-auto my-3">
                <v-expansion-panels multiple density="compact" v-model="panel" :disabled="disabled">
                    <v-expansion-panel density="compact">
                        <template v-slot:title>
                            <span class="text-body-1 ml-2"><b>Reference</b></span>
                        </template>
                        <template v-slot:text>
                            <v-row>
                                <v-col>
                                    <p class="my-4">
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
                                    </p>
                                </v-col>
                            </v-row>
                        </template>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-row>
        </v-sheet>
    </v-container>
</template>

<script setup>
import SmilesImage from "@/components/SmilesImage.vue";
import { ref } from 'vue'

const panel = ref([0])
const disabled = ref(false)

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

const headers = ref([
    // { key: 'rank', title: 'Rank', align: 'center', },
    { key: 'outcome', title: 'Product', align: 'center', width: '300px' },
    { key: 'prob', title: 'Probability', align: 'center' },
    { key: 'score', title: 'Max. Score', align: 'center' },
    { key: 'mol_wt', title: 'Molecular Weight', align: 'center' },
    { key: 'predict_impurities', title: 'Predict impurities', align: 'center', },
    { key: 'predict_selectivity', title: 'Predict regio-selectivities', align: 'center', }
])

const emits = defineEmits()

const emitDownloadForward = () => {
    emits('download-forward')
}

const emitGoToImpurity = (index) => {
    emits('go-to-impurities', index);
    console.log(index)
}

const goToSelectivity = (index) => {
    emits('go-to-selectivity', index);
}
</script>
