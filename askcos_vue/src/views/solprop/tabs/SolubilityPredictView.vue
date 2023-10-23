<template>
  <v-container fluid style="min-height: calc(100vh-50px)">
    <v-row class="justify-center" >
      <v-col cols="12" sm="8" md="10">
        <v-sheet elevation="2" class="pa-10">
              <v-form @submit.prevent >
                <v-row>
                  <v-col>
                    <v-text-field :rules="[v => !!v || 'Solute is required']" variant="outlined" label="Solute"
                      v-model="solute" clearable></v-text-field>
                    <div v-if="!!solute" class="my-3">
                      <smiles-image :smiles="solute" height="100px"></smiles-image>
                    </div>
                  </v-col>
                  <v-col>
                    <v-text-field :rules="[v => !!v || 'Solvent is required']" variant="outlined" label="Solvent"
                      v-model="solvent" clearable></v-text-field>
                    <div v-if="!!solvent" class="my-3">
                      <smiles-image :smiles="solvent" height="100px"></smiles-image>
                    </div>
                  </v-col>
                  <v-col>
                    <v-text-field :rules="[v => !!v || 'Temperature is required']" variant="outlined" label="Temperature"
                      v-model="temperature" clearable></v-text-field>
                  </v-col>
                </v-row>
                <v-row align="center" justify-start>
                  <v-col>
                    <v-btn type="submit" variant="flat" color="success" class="mr-5" @click="predict">Submit</v-btn>
                    <!-- 
                  <v-btn variant="tonal" class="mr-5" @click="clear()" :disabled="contextResults = [] && reactants === ''">
                    Clear
                  </v-btn> -->
                  <v-btn type="submit" variant="flat" color="primary" class="mr-5" @click="showUploadModal=true">Upload</v-btn>
                    <v-btn icon @click="dialog = !dialog">
                      <v-icon>mdi-cog</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <!-- <v-btn type="submit" block class="mt-4" color="success" @click="predict">Submit</v-btn> -->
              </v-form>
        </v-sheet>
      </v-col>


      <v-col v-show="pendingTasks > 0 || results.length" cols="12">
        <v-sheet elevation="2" class="pa-4" rounded="lg">
          <v-row v-if="!pendingTasks > 0" align="center" justify="space-between" class="mx-auto my-auto pa-2">
            <v-col md="5">
              <v-menu location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn v-show="!!results.length" @click="handleClick" :disabled="evaluating"
                    height="30px" color="primary mr-2" v-bind="props" prepend-icon="mdi mdi-download">
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
            <v-col md="4">
              <v-select v-model="selectedHeaders" :items="headers" label="Select Columns" density="comfortable"
                variant="outlined" hide-details clearable>
                <template v-slot:selection="{ item, index }">
                  <v-chip v-if="index < 2">
                    <span>{{ item.text }}</span>
                  </v-chip>
                </template>
              </v-select>
            </v-col>
            <v-row class="mt-3 pa-4">
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
          <v-btn color="green darken-1" text @click="handleUploadSubmit">Upload</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog" max-width="600px" class="justify-center align-center">
      <v-card class="pa-3 m-5">
        <v-card-title class="headline">
          Settings
        </v-card-title>
        <v-expand-transition>
          <v-expansion-panels v-model="panel" multiple>
            <v-expansion-panel title="Reference Information (Optional)" class="text-primary">
              <v-expansion-panel-text class="text-black">
                <v-text-field variant="outlined" label="Ref. Solvent" v-model="refSolvent"></v-text-field>
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
      </v-card>
    </v-dialog>
  </v-container>
</template>
  
<script>
// import LoadingButton from "@/components/LoadingButton";
// import SettingInput from "@/components/SettingInput";
import SmilesImage from "@/components/SmilesImage";
import SmilesInput from "@/components/SmilesInput";
import { API } from "@/common/api";
import { saveAs } from "file-saver";
import * as Papa from "papaparse";

export default {
  name: "SolubilityPrediction",
  components: {
    // LoadingButton,
    // SettingInput,
    SmilesImage,
    SmilesInput,
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
      tab: "one",
      uploadFile: null,
      selectedColumnCategories: [
        'Solubility(T) [mg/mL]',
        'Solubility(298) [mg/mL]',
      ],
      columnCategories: {
        'Input Ref. Data': ['Ref. Solv', 'Ref. Solub', 'Ref. Temp'],
        'Input Solute Data': ['Input Hsub298', 'Input Cpg298', 'Input Cps298'],
        'logST': ['logST (method1) [log10(mol/L)]', 'logST (method2) [log10(mol/L)]'],
        'Solubility(T) [mg/mL]': ['ST (method1) [mg/mL]', 'ST (method2) [mg/mL]'],
        'dGsolvT': ['dGsolvT [kcal/mol]'],
        'dHsolvT': ['dHsolvT [kcal/mol]'],
        'dSsolvT': ['dSsolvT [cal/K/mol]'],
        'logS298': ['logS298 [log10(mol/L)]', 'uncertainty logS298 [log10(mol/L)]'],
        'Solubility(298) [mg/mL]': ['S298 [mg/mL]'],
        'dGsolv298': ['dGsolv298 [kcal/mol]', 'uncertainty dGsolv298 [kcal/mol]'],
        'dHsolv298': ['dHsolv298 [kcal/mol]', 'uncertainty dHsolv298 [kcal/mol]'],
        'Pred. Solute Data': ['Pred. Hsub298 [kcal/mol]', 'Pred. Cpg298 [cal/K/mol]', 'Pred. Cps298 [cal/K/mol]'],
        'Solute Abraham Parameters': ['E', 'S', 'A', 'B', 'L', 'V'],
        'Messages': ['Error Message', 'Warning Message'],
      },
      loading: false,
    }
  },
  computed: {
    fields() {
      const _fields = ['Solute', 'Solvent', 'Temp']
      this.selectedColumnCategories.forEach((category) => {
        _fields.push(...this.columnCategories[category])
      })
      return _fields.map((key) => ({ key: key, title: key, sortable: true }))
    },
    exportFileName() {
      let baseName = 'askcos'
      if (this.uploadFile) {
        const inputName = this.uploadFile.name
        baseName = inputName.substring(0, inputName.lastIndexOf('.'))
      }
      return baseName + '_solubility_export'
    },
    //  showHeaders() {
    //   return this.headers.filter(s => this.selectedHeaders.includes(s));
    // },
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

    // this.headers = Object.values(this.headersMap);
    // this.selectedHeaders = this.headers;
  },
  methods: {
    predict() {
      this.pendingTasks += 1
      this.loading = true
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
          console.log(output)
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
      const url = '/api/legacy/solubility/batch/call-async'
      const body = {
        task_list: data,
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
      if (this.uploadFile) {
        if (this.uploadFile.name.endsWith('.json')) {
          fileFormat = 'json'
        } else if (this.uploadFile.name.endsWith('.csv')) {
          fileFormat = 'csv'
        } else {
          alert('Unsupported file format! Expecting .csv or .json')
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

      reader.readAsText(this.uploadFile)
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
  
<style scoped>
#solubility-left-pane {
  overflow-y: auto;
  max-height: calc(100vh - 14rem);
}
</style>
  