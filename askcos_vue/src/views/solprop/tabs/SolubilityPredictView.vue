<template>
  <v-container fluid style="min-height: calc(100vh-50px)">
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="12">
        <v-sheet elevation="2" class="pa-10">
          <ketcher-modal ref="ketcherRef" v-model="showKetcher" :smiles="currentSmiles" @input="showKetcher = false"
            @update:smiles="(ketcherSmiles) => updateSmiles(ketcherSmiles)" />
          <v-form @submit.prevent>
            <v-row>
              <v-col>
                <v-text-field :rules="[v => !!v || 'Solute is required']" variant="outlined" label="Solute"
                  v-model="solute" clearable>
                  <template v-slot:append-inner>
                    <v-btn variant="tonal" prepend-icon="mdi mdi-pencil" @click="openKetcher('solute')">Draw</v-btn>
                  </template>
                </v-text-field>
                <div v-if="!!solute" class="my-3">
                  <smiles-image :smiles="solute" height="100px">
                  </smiles-image>
                </div>
              </v-col>
              <v-col>
                <v-text-field :rules="[v => !!v || 'Solvent is required']" variant="outlined" label="Solvent"
                  v-model="solvent" clearable>
                  <template v-slot:append-inner>
                    <v-btn variant="tonal" prepend-icon="mdi mdi-pencil" @click="openKetcher('solvent')">Draw</v-btn>
                  </template>
                </v-text-field>
                <div v-if="!!solvent" class="my-3">
                  <smiles-image :smiles="solvent" height="100px"></smiles-image>
                </div>
              </v-col>
              <v-col>
                <v-text-field :rules="[v => !!v || 'Temperature is required']" variant="outlined" label="Temperature"
                  v-model="temperature" clearable>
                </v-text-field>
              </v-col>
            </v-row>
            <v-row justify-start class="align-center justify-center">
              <v-col>
                <v-btn type="submit" variant="flat" color="success" class="mr-5" @click="predict" :loading="!batch && loading">Submit</v-btn>
                <v-btn type="submit" variant="flat" color="primary" class="mr-5" @click="showUploadModal = true" :loading="batch && loading">Run
                  Batch</v-btn>
                <v-btn variant="tonal" class="mr-5" :disabled="results.length === 0" @click="clear()">
                  Clear Results
                </v-btn>
                <v-btn @click="dialog = true" variant="outlined" class="mr-5" icon="mdi-dots-horizontal">
                </v-btn>
                <v-btn class="mr-5" variant="outlined" @click="showInfo = !showInfo">Model I/O Details</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-show="pendingTasks > 0 || results.length" cols="12" md="12">
        <v-sheet elevation="2" class="pa-4" rounded="lg">
          <v-row v-if="pendingTasks === 0" align="center" justify="space-between" class="mx-auto my-auto pa-2">
            <v-col md="5">
              <v-menu location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn v-show="!!results.length" color="primary"
                    v-bind="props" prepend-icon="mdi mdi-download" variant="flat">
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
                density="comfortable" variant="outlined" hide-details clearable @update:modelValue="onSelectedCategory"
                multiple>
                <template v-slot:selection="{ item, index }">
                  <v-chip>
                    <span>{{ item.title }}</span>
                  </v-chip>
                </template>
              </v-select>
            </v-col>
            <v-row class="mt-3" style="overflow-x:scroll">
              <v-data-table :headers="fields" :items="results"></v-data-table>
            </v-row>
          </v-row>
          <v-row v-else align="center" justify="space-between" class="mx-auto my-auto pa-2">
            <v-skeleton-loader class="mx-auto my-auto" min-height="80px" type="table"></v-skeleton-loader>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>

    <v-dialog v-model="showUploadModal" max-width="600px">
      <v-card>
        <v-card-title class="mt-2">
          <v-col cols="12">Upload file</v-col>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" class="mb-2">
              <span>
                See Model Input/Output Details for notes on file format.
              </span>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-file-input label="File" v-model="uploadFile" :rules="[v => !!v || 'File is required']"
                density="comfortable" variant="outlined" clearable></v-file-input>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="showUploadModal = false">Close</v-btn>
          <v-btn color="green darken-1" text
            @click="() => { showUploadModal = false; handleUploadSubmit() }">Upload</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog" width="auto" class="justify-center align-center">
      <v-card>
        <v-card-title class="headline">
          Additional Information
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-3">
          <v-expand-transition>
            <v-expansion-panels v-model="panel" multiple>
              <v-expansion-panel title="Reference Information (Optional)" class="text-primary">
                <v-expansion-panel-text class="text-black">
                  <v-text-field variant="outlined" label="Ref. Solvent" v-model="refSolvent">
                    <template v-slot:append-inner>
                      <v-btn variant="tonal" prepend-icon="mdi mdi-pencil" @click="openKetcher('refSolvent')">Draw</v-btn>
                    </template>
                  </v-text-field>
                  <div v-if="!!refSolvent" class="my-3">
                    <smiles-image :smiles="refSolvent" height="100px"></smiles-image>
                  </div>
                  <v-text-field variant="outlined" label="Ref. Solubility (log10(mol/L))"
                    v-model="refSolubility"></v-text-field>
                  <v-text-field variant="outlined" label="Ref. Temperature (K)" v-model="refTemperature"></v-text-field>
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel title="Solute Information (Optional)" class="text-primary">
                <v-expansion-panel-text class="text-black">
                  <v-text-field variant="outlined" label="ΔHsub298 (kcal/mol)" v-model="soluteHsub"></v-text-field>
                  <v-text-field variant="outlined" label="Cpg298 (cal/mol/K)" v-model="soluteCpg"></v-text-field>
                  <v-text-field variant="outlined" label="Cps298 (cal/mol/K)" v-model="soluteCps"></v-text-field>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expand-transition>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="d-flex justify-end pa-3">
          <v-btn class="mr-2" variant="tonal" color="success" @click="dialog = false">
            Save
          </v-btn>
          <v-btn variant="tonal" color="primary" @click="() => { dialog = false; predict() }">
            Run
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <solubility-modal :visible="showInfo" width="auto" @close-dialog="$event => showInfo = $event"></solubility-modal>
</template>
  
<script>
import KetcherModal from "@/components/KetcherModal";
import SmilesImage from "@/components/SmilesImage";
import SmilesInput from "@/components/SmilesInput";
import SolubilityModal from '@/components/solprop/SolubilityModal'
import { API } from "@/common/api";
import { saveAs } from "file-saver";
import * as Papa from "papaparse";

export default {
  name: "SolubilityPrediction",
  components: {
    SmilesImage,
    SmilesInput,
    SolubilityModal,
    KetcherModal,
  },
  data() {
    return {
      panel: [0],
      pendingTasks: 0,
      solvent: '',
      solute: '',
      temperature: 298,
      refSolvent: null,
      refSolubility: null,
      refTemperature: null,
      soluteHsub: null,
      soluteCpg: null,
      soluteCps: null,
      dialog: false,
      showUploadModal: false,
      results: [],
      currentInputSource: '',
      showKetcher: false,
      tab: "one",
      uploadFile: null,
      selectedColumnCategories: [
        'Solubility(T) [mg/mL]',
        'Solubility(298) [mg/mL]',
      ],
      columnCategories: {
        'Input Ref. Data': ['ref_solvent', 'ref_solubility', 'ref_temp'],
        'Input Solute Data': ['hsub298', 'cp_gas_298', 'cp_solid_298'],
        'logST': ['log_st_1', 'log_st_2'],
        'Solubility(T) [mg/mL]': ['st_1', 'st_2'],
        'dGsolvT': ['dg_solv_t'],
        'dHsolvT': ['dh_solv_t'],
        'dSsolvT': ['ds_solv_t'],
        'logS298': ['log_s_298', 'uncertainty_log_s_298'],
        'Solubility(298) [mg/mL]': ['s_298'],
        'dHsolv298': ['dh_solv_298', 'uncertainty_dh_solv_298'],
        'Pred. Solute Data': ['pred_hsub298', 'pred_cpg298', 'pred_cps298'],
        'Solute Abraham Parameters': ['E', 'S', 'A', 'B', 'L', 'V'],
        'Messages': ['error_message', 'warning_message'],
      },
      fields: [

      ],
      loading: false,
      showInfo: false,
      batch: false,
    }
  },
  computed: {
    allfields() {
      return Object.keys(this.columnCategories).map((key) => ({ key: key, title: key }))
    },
    exportFileName() {
      let baseName = 'askcos'
      if (this.uploadFile) {
        const inputName = this.uploadFile[0].name
        baseName = inputName.substring(0, inputName.lastIndexOf('.'))
      }
      return baseName + '_solubility_export'
    },
    currentSmiles() {
      switch (this.currentInputSource) {
        case 'solute':
          return this.solute;
        case 'solvent':
          return this.solvent;
        case 'refSolvent':
          return this.refSolvent;
        default:
          return '';
      }
    }
  },
  created() {
    // Prompt user before going back to previous page
    window.addEventListener('beforeunload', (e) => {
      if (this.results.length) {
        // Cancel the event
        e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
        // Chrome requires returnValue to be set
        e.returnValue = '';
      }
    });

    let urlParams = new URLSearchParams(window.location.search);
    let solute = urlParams.get('solute')
    if (solute) {
      this.solute = solute
    }
    let solvent = urlParams.get('solvent')
    if (solvent) {
      this.solvent = solvent
    }

    this.onSelectedCategory();
  },
  methods: {
    clear() {
      this.results = []
    },
    onSelectedCategory(value) {
      if (value) {
        this.selectedColumnCategories = value
      }
      const _fields = ['Solute', 'Solvent', 'Temp']
      this.selectedColumnCategories.forEach((category) => {
        _fields.push(...this.columnCategories[category])
      })
      this.fields = _fields.map((key) => ({ key: key, title: key, sortable: true }))
    },
    predict() {
      this.pendingTasks += 1
      this.loading = true
      this.batch = false
      const url = '/api/legacy/solubility/batch/call-async'
      const body = {
        "task_list": [{
          solvent: this.solvent,
          solute: this.solute,
          temp: this.temperature,
          ref_solvent: this.refSolvent || null,
          ref_solubility: this.refSolubility || null,
          ref_temp: this.refTemperature || null,
          hsub298: this.soluteHsub || null,
          cp_gas_298: this.soluteCpg || null,
          cp_solid_298: this.soluteCps || null,
        }
        ]
      }
      API.runCeleryTask(url, body)
        .then(output => {
          this.results.push(...output)
        })
        .catch(error => {
          alert('There was an error predicting solubility: ' + error)
        })
        .finally(() => {
          this.loading = false;
          this.pendingTasks -= 1;
        })
    },
    predictBatch(data) {
      this.pendingTasks += 1
      this.loading = true
      this.batch = true
      const url = '/api/legacy/solubility/batch/call-async'
      const body = {
        task_list: [data],
      }
      API.runCeleryTask(url, body)
        .then(output => {
          this.results.push(...output)
        })
        .catch(error => {
          alert('There was an error predicting solubility: ' + error)
        })
        .finally(() => this.loading = false, this.pendingTasks -= 1)
    },
    handleUploadSubmit() {
      let fileFormat
      if (this.uploadFile[0]) {
        if (this.uploadFile[0].name.endsWith('.json')) {
          fileFormat = 'json'
        } else if (this.uploadFile[0].name.endsWith('.csv')) {
          fileFormat = 'csv'
        } else {
          alert('No file selected or file has no name!')
          return
        }
      }
      let reader = new FileReader();
      reader.onload = (e) => {
        let rawData = e.target.result
        let data
        if (fileFormat === 'csv') {
          let result = Papa.parse(rawData, { header: true, skipEmptyLines: true, transform: (value) => value === '' ? null : value })
          if (result.errors.length) {
            alert(result.errors[0].message)
            return
          }
          data = result.data
        } else if (fileFormat === 'json') {
          data = JSON.parse(rawData)
        }
        this.predictBatch(data)
      }
      reader.readAsText(this.uploadFile[0])
    },
    openKetcher(source) {
      this.currentInputSource = source;
      this.showKetcher = true;
      this.$refs['ketcherRef'].smilesToKetcher()
    },
    updateSmiles(ketcherSmiles) {
      switch (this.currentInputSource) {
        case 'solute':
          this.solute = ketcherSmiles;
          break;
        case 'solvent':
          this.solvent = ketcherSmiles;
          break;
        case 'refSolvent':
          this.refSolvent = ketcherSmiles;
          break;
      }
    },
    downloadCSV() {
      if (!this.results.length) {
        alert('There are no results to download!')
        return
      }
      let downloadData = Papa.unparse(this.results)
      let blob = new Blob([downloadData], { type: 'data:text/csv;charset=utf-8' })
      saveAs(blob, this.exportFileName + '.csv')
    },
    downloadJSON() {
      if (!this.results.length) {
        alert('There are no results to download!')
        return
      }
      let downloadData = JSON.stringify(this.results)
      let blob = new Blob([downloadData], { type: 'data:text/json;charset=utf-8' })
      saveAs(blob, this.exportFileName + '.json')
    },
  },
}
</script>