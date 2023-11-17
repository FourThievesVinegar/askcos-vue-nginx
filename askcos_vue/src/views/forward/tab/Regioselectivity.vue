<template>
    <v-container fluid class="pa-0">
        <v-sheet elevation="2" rounded="lg" width="100%" class="pa-6">
            <v-row align="center" justify="space-between" class="mx-auto my-auto">
                <v-col>
                    <span class="text-body-1 ml-2"><b>Regioselectivity Prediction</b> </span>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="auto">
                    <v-btn variant="flat" v-show="!!results.length" @click="dialog = true" height="30px"
                        color="primary mx-2">
                        Export
                    </v-btn>
                </v-col>
            </v-row>

            <v-data-table v-if="!pending && results.length" :headers="headers" :items="results" :items-per-page="10">
                <template #item.smiles="{ item }">
                    <copy-tooltip :data="item.columns.smiles" :title="'Click to copy: ' + item.columns.smiles">
                        <smiles-image :smiles="item.columns.smiles" max-height="125px"></smiles-image>
                    </copy-tooltip>
                </template>
                <template #item.prob="{ item }">
                    {{ item.columns.prob.toFixed(4) }}
                </template>
            </v-data-table>

            <v-skeleton-loader v-if="!!pending" class="mx-auto my-auto" min-height="80px" type="table">
            </v-skeleton-loader>

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
                                        Predict selectivity of regio-selective reactions. The QM-GNN model combines a WLN
                                        graph encoding
                                        with predicted quantum descriptors as input to a multitask neural network.
                                        <a href="https://doi.org/10.1039/D0SC04823B">(Chem. Sci., 2021, 12, 2198-2208)</a>
                                    </p>
                                </v-col>
                            </v-row>
                        </template>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-row>
            <v-dialog v-model="dialog" max-width="600px" persistent>
                <v-card>
                    <v-card-title class="headline">Export Results</v-card-title>
                    <v-card-text>
                        <v-text-field v-model="filename" @input="updateFilename($event.target.value)" density="comfortable"
                            variant="outlined" placeholder="Filename" hide-details clearable type="string"></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="red darken-1" text @click="dialog = false">Cancel</v-btn>
                        <v-btn color="green darken-1" text @click="() => { emitDownloadSelectivity; dialog = false }">Save</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-sheet>
    </v-container>
</template>


<script setup>
import { ref } from "vue";
import SmilesImage from "@/components/SmilesImage.vue";
import CopyTooltip from "@/components/CopyTooltip";

const panel = ref([0])
const disabled = ref(false)
const dialog = ref(false)
const filename = ref('selectivity.csv')

const { results, pending } = defineProps({
    results: {
        type: Array,
        default: [],
    },
    pending: {
        type: Number,
        default: 0
    },
})

const headers = ref([
    { key: 'rank', title: 'Rank', align: 'center', },
    { key: 'smiles', title: 'Product', align: 'center', },
    { key: 'prob', title: 'Probability', align: 'center', },
])

const emits = defineEmits()

const emitDownloadSelectivity = () => {
    emits('download-selectivity')
}

const updateFilename = (newFilename) => {
    emits('update:filename', newFilename);
};


</script>