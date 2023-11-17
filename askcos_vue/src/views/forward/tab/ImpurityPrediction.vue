<template>
    <v-container fluid class="pa-0">
        <v-sheet elevation="5" rounded="lg" width="100%" class="pa-6">
            <v-row align="center" justify="space-between" class="mx-auto my-auto">
                <v-col>
                    <span class="text-body-1 ml-2"><b>Impurity Prediction</b> </span>
                    <p><span class="text-body-3 ml-2" v-if="!!pending">Progress: {{ progress.message }}</span></p>
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
                <template #item.prd_smiles="{ item }">
                    <copy-tooltip :data="item.columns.prd_smiles" :title="'Click to copy: ' + item.columns.prd_smiles">
                        <smiles-image :smiles="item.columns.prd_smiles" height="80px">
                        </smiles-image>
                    </copy-tooltip>
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
                                        Predict likely impurities for a chemical reaction. Considers minor products,
                                        over-reaction,
                                        dimerization, solvent adducts, and subsets of reactants.
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
                        <v-btn color="green darken-1" text @click="() => {emitDownloadImpurity; dialog = false} ">Save</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-sheet>
    </v-container>
</template>


<script setup>
import SmilesImage from "@/components/SmilesImage.vue";
import { ref } from 'vue';
import CopyTooltip from "@/components/CopyTooltip";


const panel = ref([0])
const disabled = ref(false)
const dialog = ref(false)
const filename = ref('impurity.csv')


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

const emits = defineEmits()

const emitDownloadImpurity = () => {
    emits('download-impurity')
}

const updateFilename = (newFilename) => {
    emits('update:filename', newFilename);
};

</script>