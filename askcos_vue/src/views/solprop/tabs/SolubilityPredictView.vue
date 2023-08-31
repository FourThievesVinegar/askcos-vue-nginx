<template>
    <v-container fluid>
        <v-row class="justify-center align-center">
            <v-col cols="12" md="6">
                <v-sheet elevation="2" rounded="lg">
                    <v-form @submit.prevent class="pa-5">
                        <v-expansion-panels v-model="panel" multiple>
                            <v-expansion-panel title="Basic Information (*Required)" class="text-primary">
                                <v-expansion-panel-text class="text-black">
                                    <v-text-field :rules="[v => !!v || 'Solute is required']" variant="outlined" label="Solute"></v-text-field>
                                    <v-text-field :rules="[v => !!v || 'Solvent is required']" variant="outlined" label="Solvent"></v-text-field>
                                    <v-text-field :rules="[v => !!v || 'Temperature is required']" variant="outlined" label="Temperature"></v-text-field>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                            <v-expansion-panel title="Reference Information (Optional)" class="text-primary">
                                <v-expansion-panel-text class="text-black">
                                    <v-text-field variant="outlined" label="Ref. Solvent"></v-text-field>
                                    <v-text-field variant="outlined" label="Ref. Solubility (log10(mol/L))"></v-text-field>
                                    <v-text-field variant="outlined" label="Ref. Temperature (K)"></v-text-field>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                            <v-expansion-panel title="Solute Information (Optional)" class="text-primary">
                                <v-expansion-panel-text class="text-black">
                                    <v-text-field variant="outlined" label="ΔHsub298 (kcal/mol)"></v-text-field>
                                    <v-text-field variant="outlined" label="Cpg298 (cal/mol/K)"></v-text-field>
                                    <v-text-field variant="outlined" label="Cps298 (cal/mol/K)"></v-text-field>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                        <v-btn type="submit" block class="mt-4" color="success">Submit</v-btn>
                    </v-form>
                </v-sheet>
            </v-col>
        </v-row>
        <v-row class="justify-center align-center">
            <v-col v-if="false" cols="12">
                <v-sheet elevation="2" rounded="lg">
                    <v-data-table></v-data-table>
                </v-sheet>
            </v-col>
            <v-col v-else cols="12" md="6">
                <v-sheet elevation="2" rounded="lg" class="pa-5">
                    No Data Available
                </v-sheet>
            </v-col>
        </v-row>
    </v-container>
</template>

<!-- <template>
    <div class="row">
      <div id="solubility-left-pane" class="col-xl-3">
        <b-button v-b-modal.solubility-model-info block variant="outline-info">Model Input/Output Details</b-button>
        <div id="solubility-input" class="mt-3">
          <b-tabs content-class="mt-3">
            <b-tab title="Form Input">
              <b-form @submit.prevent="predict">
                <smiles-input id="solute" label="Solute" label-for="solute" label-cols="6"
                              v-model="solute" required>
                  <div v-if="!!solute" class="text-center my-3">
                    <smiles-image :smiles="solute"></smiles-image>
                  </div>
                </smiles-input>
  
                <smiles-input id="solvent" label="Solvent" label-for="solvent" label-cols="6"
                              v-model="solvent" required>
                  <div v-if="!!solvent" class="text-center my-3">
                    <smiles-image :smiles="solvent"></smiles-image>
                  </div>
                </smiles-input>
  
                <setting-input label="Temperature (K)" label-for="temperature-input">
                  <b-form-input id="temperature-input" v-model="temperature" required></b-form-input>
                </setting-input>
  
                <b-button v-b-toggle.reference variant="outline-secondary" block class="mb-3">Add Reference Data</b-button>
  
                <b-collapse id="reference">
                  <smiles-input id="ref-solvent" label="Ref. Solvent" label-for="ref-solvent" label-cols="6"
                                v-model="refSolvent">
                    <div v-if="!!refSolvent" class="text-center my-3">
                      <smiles-image :smiles="refSolvent"></smiles-image>
                    </div>
                  </smiles-input>
                  <setting-input label="Ref. Solubility (log10(mol/L))" label-for="ref-solubility-input">
                    <b-form-input id="ref-solubility-input" v-model="refSolubility"></b-form-input>
                  </setting-input>
                  <setting-input label="Ref. Temperature (K)" label-for="ref-temperature-input">
                    <b-form-input id="ref-temperature-input" v-model="refTemperature"></b-form-input>
                  </setting-input>
                </b-collapse>
  
                <b-button v-b-toggle.solute-thermo variant="outline-secondary" block class="mb-3">Add Solute Data</b-button>
  
                <b-collapse id="solute-thermo">
                  <setting-input label="ΔHsub298 (kcal/mol)" label-for="solute-hsub-input">
                    <b-form-input id="solute-hsub-input" v-model="soluteHsub"></b-form-input>
                  </setting-input>
                  <setting-input label="Cpg298 (cal/mol/K)" label-for="solute-cpg-input">
                    <b-form-input id="solute-cpg-input" v-model="soluteCpg"></b-form-input>
                  </setting-input>
                  <setting-input label="Cps298 (cal/mol/K)" label-for="solute-cps-input">
                    <b-form-input id="solute-cps-input" v-model="soluteCps"></b-form-input>
                  </setting-input>
                </b-collapse>
  
                <div class="text-center">
                  <loading-button
                    id="solubility-submit-btn"
                    type="submit"
                    :loading="loading"
                    variant="success"
                    spinner-variant="secondary"
                  >Submit</loading-button>
                </div>
              </b-form>
            </b-tab>
            <b-tab title="File Upload">
              <p>See Model Input/Output Details for notes on file format.</p>
              <b-form @submit.prevent="handleUploadSubmit">
                <b-form-group label="File">
                  <b-form-file v-model="uploadFile"></b-form-file>
                </b-form-group>
                <div class="text-center my-3">
                  <loading-button
                    id="solubility-upload-btn"
                    type="submit"
                    :loading="loading"
                    variant="success"
                    spinner-variant="secondary"
                  >Submit</loading-button>
                </div>
              </b-form>
            </b-tab>
          </b-tabs>
        </div>
      </div>
      <div id="solubility-right-pane" class="col-xl-9">
        <div v-if="results.length">
          <div class="d-flex justify-content-between mb-3">
            <b-dropdown text="Show/Hide Columns" variant="outline-secondary">
              <b-dropdown-form class="text-nowrap">
                <b-form-checkbox-group
                  id="solubility-column-select"
                  v-model="selectedColumnCategories"
                  :options="Object.keys(columnCategories)"
                  name="output-categories"
                  stacked
                ></b-form-checkbox-group>
              </b-dropdown-form>
            </b-dropdown>
            <b-button-group>
              <b-button variant="outline-secondary" @click="downloadCSV">
                <i class="fas fa-download"></i>
                Download CSV
              </b-button>
              <b-button variant="outline-secondary" @click="downloadJSON">
                <i class="fas fa-download"></i>
                Download JSON
              </b-button>
            </b-button-group>
          </div>
          <b-table
            :items="results"
            :fields="fields"
            sticky-header="calc(100vh - 17rem)"
            no-border-collapse
          ></b-table>
        </div>
        <div v-else class="text-center">
          <h2 class="mt-5">No Results</h2>
          <p class="lead">Begin by running a new prediction on the left!</p>
        </div>
      </div>
    </div>
  </template> -->
  
<script>
// import LoadingButton from "@/components/LoadingButton";
// import SettingInput from "@/components/SettingInput";
import SmilesImage from "@/components/SmilesImage";
import SmilesInput from "@/components/SmilesInput";
import { API } from "@/common/api";
// import { saveAs } from "file-saver";
// import * as Papa from "papaparse";

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
            solvent: '',
            solute: '',
            temperature: 298,
            refSolvent: null,
            refSolubility: null,
            refTemperature: null,
            soluteHsub: null,
            soluteCpg: null,
            soluteCps: null,
            results: [],
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
            const _fields = ['Solvent', 'Solute', 'Temp']
            this.selectedColumnCategories.forEach((category) => {
                _fields.push(...this.columnCategories[category])
            })
            return _fields.map((key) => ({ key: key, label: key, sortable: true }))
        },
        exportFileName() {
            let baseName = 'askcos'
            if (this.uploadFile) {
                const inputName = this.uploadFile.name
                baseName = inputName.substring(0, inputName.lastIndexOf('.'))
            }
            return baseName + '_solubility_export'
        },
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
    },
    methods: {
        predict() {
            this.loading = true
            const url = '/api/v2/solubility/'
            const body = {
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
            API.runCeleryTask(url, body)
                .then(output => {
                    this.results.push(...output)
                })
                .catch(error => {
                    alert('There was an error predicting solubility: ' + error)
                })
                .finally(() => this.loading = false)
        },
        predictBatch(data) {
            this.loading = true
            const url = '/api/v2/solubility/batch/'
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
                .finally(() => this.loading = false)
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
  