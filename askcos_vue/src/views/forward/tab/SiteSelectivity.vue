<template>
    <v-container fluid class="pa-0">
        <v-sheet elevation="2" rounded="lg" width="100%" class="pa-6">
            <v-row align="center" justify="space-between" class="mx-auto my-auto">
                <v-col>
                    <span class="text-body-1 ml-2"><b>Aromatic C-H functionalization</b> </span>
                </v-col>
                <v-spacer></v-spacer>
            </v-row>

            <v-row class="justify-center my-auto" density="compact" v-if="!pending && results.length">
                <v-col cols="12" md="8" justify-center>
                    <v-text-field label="Filter Reactants" density="compact" variant="outlined" hide-details clearable
                        placeholder="Filter reactants based on substring match to SMILES." v-model="resultsQuery"
                        @input="filterResult"></v-text-field>
                </v-col>
            </v-row>
            <v-row class="justify-center align-center" v-if="!pending && results.length">
                <v-col class="d-flex align-center justify-center" cols="12" md="10">
                    <ketcher-min ref="ketcherMinRef" @change="siteSelectedAtoms = $event"></ketcher-min>
                </v-col>
            </v-row>

            <v-data-table v-if="!pending && results.length" :headers="headers" :items="results" class="my-3"
                :items-per-page="5" height="600px">
                <template v-slot:item.task="{ item }">
                    <smiles-image :smiles="item.columns.task" max-height="120px"></smiles-image>
                </template>
                <template v-slot:item.smiles="{ item }">
                    <smiles-image :smiles="item.columns.smiles" :reacting-atoms="item.raw.atom_scores" :highlight=true
                        max-height="200px"></smiles-image>
                </template>
                <template v-slot:item.references="{ item }">
                    <div v-if="item.columns.references === undefined">
                        <v-btn outlined variant="tonal" @click="emitgetSitesRefs(item.raw.index)">
                            Get Training Reaction IDs
                        </v-btn>
                    </div>
                    <div v-else>
                        <p class="my-3">{{ item.columns.references.length }} training reactions</p>
                        <v-btn variant="outlined" @click="emitCopyToClipboard(item.columns.references.join('; '))">
                            <v-icon>mdi-content-copy</v-icon> Copy all reaction IDs
                        </v-btn>
                        <br>
                        <v-btn variant="outlined" class="my-2"
                            :href="createReaxysUrl(item.columns.references.slice(0, 50))">
                            <v-icon>mdi-open-in-new</v-icon> Find first 50 in Reaxys
                        </v-btn>
                        <br>
                        <v-btn variant="outlined" class="mb-3" @click="emitDownloadSitesRefs(item.columns)">
                            <v-icon>mdi-download</v-icon> Export all as Reaxys query
                        </v-btn>
                    </div>
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
                                        Predict site selectivity of aromatic C-H functionalization reactions with a
                                        multitask
                                        neural
                                        network that uses a WLN graph encoding.
                                        <a href="https://doi.org/10.1039/D0RE00071J">(React. Chem. Eng., 2020, 5,
                                            896-902)</a>
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
import KetcherMin from "@/components/KetcherMin.vue";
import { ref, computed } from 'vue'
import { createReaxysUrl } from "@/common/reaxys";

const panel = ref([0])
const disabled = ref(false)
const resultsQuery = ref('')
const ketcherMinRef = ref(null)

const { results, pending } = defineProps({
    results: {
        type: Array,
        default: [],
    },
    pending: {
        type: Number,
        default: 0
    },
    resultsQuery: {
        type: String,
        default: ''
    }
})

const emits = defineEmits()

const emitgetSitesRefs = async (index) => {
    emits('get-sites-refs', index)
}

const emitDownloadSitesRefs = (result) => {
    emits('download-sites-refs', result)
}
const emitCopyToClipboard = (index) => {
    emits('copy-to-clipboard', index)
}

const headers = ref([
    { key: 'task', title: 'Reactant', align: 'center', width: "400px" },
    { key: 'smiles', title: 'Sites', align: 'center', },
    { key: 'references', title: 'References', align: 'center', width: "500px" },

])

defineExpose({
    ketcherMinRef
})


</script>