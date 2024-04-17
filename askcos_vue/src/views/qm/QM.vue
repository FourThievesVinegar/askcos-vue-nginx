<template>
    <v-container fluid>
        <v-row class="justify-center">
            <v-col cols="12" md="12" xl="10">
                <div class="my-4">
                    <v-breadcrumbs class="pa-0 text-body-1" :items="['Home', 'QM Descriptor']"></v-breadcrumbs>
                    <h4 class="text-h4 text-primary">
                        QM Descriptor
                    </h4>
                </div>
            </v-col>
        </v-row>

        <v-row class="justify-center">
            <v-col cols="12" md="12" xl="10">
                <v-sheet elevation="2" rounded="lg" class="pa-5">
                    <v-row class="justify-center" density="compact">
                        <v-col cols="12" md="10" my="10">
                            <v-text-field v-model="smiles" class="centered-input" variant="outlined"
                                label="Enter a molecule or reaction SMILES" prepend-inner-icon="mdi mdi-flask"
                                placeholder="SMILES" hide-details clearable @click:clear="smiles = ''">
                                <template v-slot:append>
                                    <v-btn variant="flat" color="primary" prepend-icon="mdi mdi-web" size="large"
                                        @click="canonicalize(smiles)">Canonicalize</v-btn>
                                </template>
                                <template v-slot:append-inner>
                                    <v-btn variant="tonal" prepend-icon="mdi mdi-pencil"
                                        @click="openKetcher(smiles)">Draw</v-btn>
                                </template>
                            </v-text-field>
                            <div v-if="!!smiles" class="my-3">
                                <smiles-image :smiles="smiles" height="100px"></smiles-image>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row class="justify-center" density="compact">
                        <v-col  cols="12" md="10" my="10">
                            <v-btn type="submit" variant="flat" color="success" class="mr-5" @click="predict"
                                :loading="!batch && loading">Submit</v-btn>
                            <v-btn variant="tonal" class="mr-5" :disabled="results.length === 0" @click="clear()">
                                Clear Results
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-sheet>
            </v-col>
        </v-row>

        <v-row>
            <v-col v-show="pendingTasks > 0 || results.length" cols="12" md="12" class="pa-0 mt-4">
                <v-sheet elevation="2" class="pa-4" rounded="lg">
                    <v-row v-if="pendingTasks === 0" class="mx-auto my-auto pa-2">
                        <v-col md="5">
                            <v-menu location="bottom">
                                <template v-slot:activator="{ props }">
                                    <v-btn v-show="!!results.length" color="primary" v-bind="props"
                                        prepend-icon="mdi mdi-download" variant="flat">
                                        Download
                                    </v-btn>
                                </template>
                                <v-list>
                                    <v-list-item @click="downloadCSV()">Download CSV</v-list-item>
                                    <v-list-item @click="downloadJSON()">Download JSON</v-list-item>
                                </v-list>
                            </v-menu>
                        </v-col>
                        <v-spacer md="2"></v-spacer>
                        <v-col md="5">
                            <v-select :model-value="selectedColumnCategories" :items="allfields" label="Select Columns"
                                density="comfortable" variant="outlined" hide-details clearable
                                @update:modelValue="onSelectedCategory" multiple>
                                <template v-slot:prepend-item>
                                    <v-list-item ripple @click="toggleAllCategories">
                                        <v-list-item-title>Select All</v-list-item-title>
                                    </v-list-item>
                                    <v-divider></v-divider>
                                </template>
                                <template v-slot:selection="{ item, index }">
                                    <v-chip>
                                        <span>{{ item.title }}</span>
                                        <v-icon small @click.prevent="deselectColumn(item)">
                                            mdi-close-circle
                                        </v-icon>
                                    </v-chip>
                                </template>
                            </v-select>
                        </v-col>
                        <v-row class="mt-3" style="overflow-x:scroll">
                            <v-col cols="12">
                                <v-data-table :page="lastPage" :items-per-page="itemsPerPage"
                                    @update:itemsPerPage="$event => itemsPerPage = $event" :headers="fields"
                                    :items="results">
                                </v-data-table></v-col>
                        </v-row>
                    </v-row>
                    <v-row v-else justify="space-between" class="mx-auto my-auto pa-2">
                        <v-skeleton-loader class="mx-auto my-auto" min-height="80px" type="table"
                            width="100%"></v-skeleton-loader>
                    </v-row>
                </v-sheet>
            </v-col>
            <v-col v-show="!results.length && pendingTasks === 0" cols="12" class="pa-0 mt-4">
                <v-sheet elevation="2" rounded="lg" class="pa-4">
                    <div class="d-flex flex-column align-center justify-center text-center">
                        <img src="@/assets/emptySolProp.svg" :width="400" class="mb-3" cover />
                        <h2>No Results</h2>
                        <p class="text-body-1">Begin a new prediction above</p>
                    </div>
                </v-sheet>
            </v-col>
        </v-row>
    </v-container>
    <ketcher-modal ref="ketcherRef" v-model="showKetcher" :smiles="smiles" @input="showKetcher = false"
        @update:smiles="updateSmiles" />
</template>

<script setup>
import { API } from "@/common/api";
import { ref, computed } from 'vue';
import KetcherModal from "@/components/KetcherModal";
import SmilesImage from "@/components/SmilesImage.vue";
import { useConfirm } from 'vuetify-use-dialog'


const smiles = ref('');
const showKetcher = ref(false);
const ketcherRef = ref(null);
const loading = ref(false);
const batch = ref(false);
const results = ref([]);
const pendingTasks = ref(0);
const itemsPerPage = ref(10);

const selectedColumnCategories = ref([
    'npa_e',
    'npa_e_pos',
]);

const columnCategories = ref({
    'Input Ref. Data': ['ref_solvent', 'ref_solubility', 'ref_temp'],
    'Input Solute Data': ['hsub298', 'cp_gas_298', 'cp_solid_298'],
    'logST': ['log_st_1', 'log_st_2'],
    'Solubility(T) [mg/mL]': ['st_1', 'st_2'],
    'dGsolvT': ['dg_solv_t'],
    'dHsolvT': ['dh_solv_t'],
    'dSsolvT': ['ds_solv_t'],
    'logS298': ['log_s_298', 'uncertainty_log_s_298'],
    'Solubility(298) [mg/mL]': ['s_298'],
    'dGsolv298': ['dg_solv_298', 'uncertainty_dg_solv_298'],
    'dHsolv298': ['dh_solv_298', 'uncertainty_dh_solv_298'],
    'Pred. Solute Data': ['pred_hsub298', 'pred_cpg298', 'pred_cps298'],
    'Solute Abraham Parameters': ['E', 'S', 'A', 'B', 'L', 'V'],
    'Messages': ['error_message', 'warning_message'],
});

const fields = ref([]);

const apiKeyToField = ref({
    'smiles': 'smiles',
    "npa_e": "npa charge (e)",
    "npa_e_pos": "npa charge + (e)",
    "npa_e_neg": "npa charge - (e)",
    "npa_parr_func_e_pos": "npa parr function + (e)",
    "npa_parr_func_e_neg": "npa parr function - (e)",
    "sheilding_constant_ppm": "shielding constant (ppm)",
    "valence_1s": "1s valence orbital occupancy (e)",
    "valence_2s": "2s valence orbital occupancy (e)",
    "valence_2p": "2p valence orbital occupancy (e)",
    "valence_3s": "3s valence orbital occupancy (e)",
    "valence_3p": "3p valence orbital occupancy (e)",
    "valence_4s": "4s valence orbital occupancy (e)",
    "valence_4p": "4p valence orbital occupancy (e)",
    "bond_index": "bond index (unitless)",
    "bond_length": "bond length (Å)",
    "bond_charge": "bond charge (e)",
    "natural_ion": "natural ionicity (unitless)",
    "dipole_moment": "dipole moment (debye)",
    "traceless": "traceless quadrupole moment (debye⋅Å)",
    "HOMO_3_LUMO": "HOMO-3/LUMO (hartree)",
    "HOMO_3_LUMO_1": "HOMO-3/LUMO+1 (hartree)",
    "HOMO_3_LUMO_2": "HOMO-3/LUMO+2 (hartree)",
    "HOMO_3_LUMO_3": "HOMO-3/LUMO+3 (hartree)",
    "HOMO_2_LUMO": "HOMO-2/LUMO (hartree)",
    "HOMO_2_LUMO_1": "HOMO-2/LUMO+1 (hartree)",
    "HOMO_2_LUMO_2": "HOMO-2/LUMO+2 (hartree)",
    "HOMO_2_LUMO_3": "HOMO-2/LUMO+3 (hartree)",
    "HOMO_1_LUMO": "HOMO-1/LUMO (hartree)",
    "HOMO_1_LUMO_1": "HOMO-1/LUMO+1 (hartree)",
    "HOMO_1_LUMO_2": "HOMO-1/LUMO+2 (hartree)",
    "HOMO_1_LUMO_3": "HOMO-1/LUMO+3 (hartree)",
    "HOMO_LUMO": "HOMO/LUMO (hartree)",
    "HOMO_LUMO_1": "HOMO/LUMO+1 (hartree)",
    "HOMO_LUMO_2": "HOMO/LUMO+2 (hartree)",
    "HOMO_LUMO_3": "HOMO/LUMO+3 (hartree)",
    "IP": "IP (hartree)",
    "EA": "EA (hartree)",
});

const createConfirm = useConfirm();

const canonicalize = () => {
    API.post("/api/rdkit/canonicalize/", { smiles: smiles.value })
        .then((json) => {
            smiles.value = json.smiles;
        })
        .catch((error) => {
            console.error("Could not canonicalize: " + error);
        });
};

const openKetcher = (source) => {
    smiles.value = source;
    showKetcher.value = true;
    ketcherRef.value.smilesToKetcher();
};

const updateSmiles = (newSmiles) => {
    smiles.value = newSmiles;
}

const predict = () => {
    pendingTasks.value += 1
    loading.value = true
    batch.value = false
    const url = '/api/qm-descriptors/call-async'
    const body = {
        "smiles": [smiles.value
        ]
    }
    API.runCeleryTask(url, body)
        .then(output => {
            results.value.push(...output.result)
            console.log(results.value)
        })
        .catch(async error => {
            const errorObj = JSON.parse(error.message)
            const isConfirmed = await createConfirm({ title: "Alert", contentComponent: ErrorDialog, contentComponentProps: { errorObj: errorObj }, dialogProps: { width: "auto" } })
            if (!isConfirmed)
                return
        })
        .finally(() => {
            loading.value = false;
            pendingTasks.value -= 1;
        })
}

const deselectColumn = (item) => {
    const index = selectedColumnCategories.value.indexOf(item.title);
    if (index !== -1) {
        selectedColumnCategories.value.splice(index, 1);
    }
    this.$nextTick(() => {
        onSelectedCategory();
    });
};
const toggleAllCategories = () => {
    if (selectedColumnCategories.value.length < allfields.length) {
        selectedColumnCategories.value = allfields.map(category => category.key);
    } else {
        selectedColumnCategories.value = [];
    }
    onSelectedCategory();
};
const remove = (key) => {
    fields.value = fields.value.filter(header => header.key !== key)
};
const clear = () => {
    results.value = []
};
const onSelectedCategory = (value) => {
    if (value) {
        selectedColumnCategories.value = value
    }
    const baseFields = [
        { key: 'smiles', title: apiKeyToField.value['smiles'], sortable: true, removable: false },
    ];
    // selectedColumnCategories.value.forEach((category) => {
    //     columnCategories.value[category].forEach((key) => {
    //         baseFields.push({ key: key, title: apiKeyToField.value[key], sortable: true, removable: true });
    //     });
    // });

    fields.value = baseFields;
};

const allfields = computed(() => {
    return Object.keys(columnCategories.value).map((key) => ({ key: key, title: key }))
})

const lastPage = computed(() => {
    return Math.ceil(results.value.length / itemsPerPage.value);
})
</script>