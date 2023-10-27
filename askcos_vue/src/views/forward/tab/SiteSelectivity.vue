<template>
    <v-container fluid class="pa-0">
        <v-sheet elevation="2" rounded="lg" width="100%" class="pa-6">
            <v-row align="center" justify="space-between" class="mx-auto my-auto">
                <v-col>
                    <span class="text-body-1 ml-2"><b>Product Prediction</b> </span>
                </v-col>
                <v-spacer></v-spacer>
            </v-row>

            <v-dialog v-model="showDialog" max-width="500px">
                <v-card>
                    <v-card-text class="px-8 py-8">
                        <p class="my-4">
                            Predict site selectivity of aromatic C-H functionalization reactions with a multitask
                            neural
                            network that uses a WLN graph encoding.
                            <a href="https://doi.org/10.1039/D0RE00071J">(React. Chem. Eng., 2020, 5, 896-902)</a>
                        </p>
                    </v-card-text>
                    <v-divider></v-divider>
                </v-card>
            </v-dialog>

            <v-col cols="6" v-if="!pending && results.length">
                <v-text-field label="Filter Reactants" density="comfortable" variant="outlined" hide-details clearable
                    placeholder="Filter reactants based on substring match to SMILES." :value="resultsQuery" 
                    @input="$emit('update:resultsQuery', $event)"></v-text-field>
            </v-col>

            <v-data-table v-if="!pending && filteredResults.length" :headers="headers" :items="results" class="my-3"
                :items-per-page="5">
                <!-- <ketcher-min ref="ketcher-min" @change="siteSelectedAtoms = $event"></ketcher-min> -->
                <template v-slot:item.task="{ item }">
                    <smiles-image :smiles="item.columns.task"></smiles-image>
                </template>
                <template v-slot:item.smiles="{ item }">
                    <smiles-image :smiles="item.columns.smiles" :reactingAtoms="item.columns.atom_scores"></smiles-image>
                </template>
                <template v-slot:item.references="{ item }">
                    <div v-if="item.columns.references === undefined">
                        <v-btn outlined variant="tonal">
                            Get Training Reaction IDs
                        </v-btn>
                    </div>
                    <div v-else>
                        <p>{{ item.columns.references.length }} training reactions</p>
                        <v-btn outlined small class="mb-2">
                            <v-icon>mdi-content-copy</v-icon> Copy all reaction IDs
                        </v-btn>
                        <br>
                        <v-btn outlined small class="mb-2" :href="createReaxysUrl(item.columns.references.slice(0, 50))"
                            target="_blank">
                            <v-icon>mdi-open-in-new</v-icon> Find first 50 in Reaxys
                        </v-btn>
                        <br>
                        <v-btn outlined small>
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

const panel = ref([0])
const disabled = ref(false)


const { results, pending, resultsQuery } = defineProps({
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
    },
})

const headers = ref([
    { key: 'task', title: 'Reactant', align: 'center', },
    { key: 'smiles', title: 'Sites', align: 'center', },
    { key: 'references', title: 'References', align: 'center', },

])

const filteredResults = computed(() => {  
    if (!results.value) return [];
    if (!resultsQuery.value) {
        return results.value;  
    }
    return results.value.filter(item => {
        return item.columns.task.includes(resultsQuery.value);
    });
});

</script>