<template>
    <v-container fluid>
        <v-row class="justify-center align-center">
            <v-col cols="12" md="12">
                <v-sheet>
                    solscreen
                </v-sheet>
            </v-col>
        </v-row>
    </v-container>
</template>


<!-- <template>
    <div class="row">
      <div id="solvent-screen-left-pane" class="col-xl-3">
        <v-btn v-b-modal.solubility-model-info block variant="outline-info">Model Input/Output Details</v-btn>
        <div id="solvent-screen-input" class="mt-3">
          <b-form @submit.prevent="predict">
            <smiles-input id="solute-input-1" label="Solute" label-for="solute-input-1" label-cols="6"
                          v-model="solute" required>
              <div v-if="!!solute" class="text-center my-3">
                <smiles-image :smiles="solute"></smiles-image>
              </div>
            </smiles-input>
  
            <setting-input label="Solvent Set" label-for="solvent-input-1" class="no-gutters">
              <b-form-select id="solvent-set-input-1" :options="Object.keys(solventSets)" v-model="solventSet" required>
                <b-form-select-option value="custom">custom</b-form-select-option>
              </b-form-select>
            </setting-input>
  
            <div v-if="solventSet === 'custom'" class="text-right">
              <v-btn v-b-modal.save-solvent-set variant="link" size="sm">Save custom solvent set</v-btn>
            </div>
            <div v-else-if="Object.keys(customSolventSets).includes(solventSet)" class="text-right">
              <v-btn variant="link" size="sm" class="text-danger" @click="deleteSolventSet">Delete custom solvent set</v-btn>
            </div>
  
            <setting-input label="Solvents" label-for="solvent-input-1">
              <b-form-textarea id="solvent-input-1" rows="8" v-model="solvents" required></b-form-textarea>
            </setting-input>
  
            <setting-input label="Temperatures (K)" label-for="temperature-input-1">
              <b-form-textarea id="temperature-input-1" rows="2" v-model="temperatures" required></b-form-textarea>
            </setting-input>
  
            <v-btn v-b-toggle.reference-1 variant="outline-secondary" block class="mb-3">Add Reference Data</v-btn>
  
            <b-collapse id="reference-1">
              <smiles-input id="ref-solvent-input-1" label="Ref. Solvent" label-for="ref-solvent-input-1" label-cols="6"
                            v-model="refSolvent">
                <div v-if="!!refSolvent" class="text-center my-3">
                  <smiles-image :smiles="refSolvent"></smiles-image>
                </div>
              </smiles-input>
              <setting-input label="Ref. Solubility (log10(mol/L))" label-for="ref-solubility-input-1">
                <b-form-input id="ref-solubility-input-1" v-model="refSolubility"></b-form-input>
              </setting-input>
              <setting-input label="Ref. Temperature (K)" label-for="ref-temperature-input-1">
                <b-form-input id="ref-temperature-input-1" v-model="refTemperature"></b-form-input>
              </setting-input>
            </b-collapse>
              <v-btn v-b-toggle.solute-thermo-1 variant="outline-secondary" block class="mb-3">Add Solute Data</v-btn>
  
            <b-collapse id="solute-thermo-1">
              <setting-input label="ΔHsub298 (kcal/mol)" label-for="solute-hsub-input-1">
                <b-form-input id="solute-hsub-input-1" v-model="soluteHsub"></b-form-input>
              </setting-input>
              <setting-input label="Cpg298 (cal/mol/K)" label-for="solute-cpg-input-1">
                <b-form-input id="solute-cpg-input-1" v-model="soluteCpg"></b-form-input>
              </setting-input>
              <setting-input label="Cps298 (cal/mol/K)" label-for="solute-cps-input-1">
                <b-form-input id="solute-cps-input-1" v-model="soluteCps"></b-form-input>
              </setting-input>
            </b-collapse>
  
            <div class="text-center">
              <loading-button
                id="solvent-screen-submit-btn"
                type="submit"
                :loading="loading"
                variant="success"
                spinner-variant="secondary"
              >Submit</loading-button>
            </div>
          </b-form>
        </div>
      </div>
      <div id="solvent-screen-right-pane" class="col-xl-9">
        <div v-if="results.length">
          <div class="d-flex justify-content-between mb-3">
            <b-form inline>
              <b-input-group>
                <b-input-group-prepend>
                  <b-input-group-text>Calculation Method</b-input-group-text>
                </b-input-group-prepend>
                <b-form-select v-model="selectedMethod" :options="methodOptions">
                </b-form-select>
              </b-input-group>
              <b-input-group class="ml-2">
                <b-input-group-prepend>
                  <b-input-group-text>Units</b-input-group-text>
                </b-input-group-prepend>
                <b-form-select v-model="selectedUnits" :options="unitOptions"></b-form-select>
              </b-input-group>
              <b-input-group class="ml-2">
                <b-input-group-prepend>
                  <b-input-group-text>X Axis</b-input-group-text>
                </b-input-group-prepend>
                <b-form-select v-model="selectedX" :options="xOptions"></b-form-select>
              </b-input-group>
            </b-form>
            <v-btn-group>
              <v-btn variant="outline-secondary" @click="downloadCSV">
                <i class="fas fa-download"></i>
                Download CSV
              </v-btn>
              <v-btn variant="outline-secondary" @click="downloadJSON">
                <i class="fas fa-download"></i>
                Download JSON
              </v-btn>
            </v-btn-group>
          </div>
          <bar-chart
            v-if="selectedX === 'solvent'"
            ref="chart"
            chart-id="solubility-chart"
            :chart-data="chartData"
            :chart-options="chartOptions"
            :styles="{height: '40vh'}"
          ></bar-chart>
          <line-chart
            v-if="selectedX === 'temperature'"
            ref="chart"
            chart-id="solubility-chart"
            :chart-data="chartData"
            :chart-options="chartOptions"
            :styles="{height: '40vh'}"
          ></line-chart>
          <b-table
            :fields="fields"
            :items="tableData"
            sticky-header="calc(60vh - 18rem)"
            no-border-collapse
            class="mt-3"
          >
            <template #cell(image)="data">
              <smiles-image lazy :smiles="data.item['solvent']"></smiles-image>
            </template>
          </b-table>
        </div>
        <div v-else class="text-center">
          <h2 class="mt-5">No Results</h2>
          <p class="lead">Begin by running a new prediction on the left!</p>
        </div>
      </div>
  
      <b-modal
        id="save-solvent-set"
        title="Save Solvent Set"
        centered
        @ok="saveSolventSet"
        :ok-disabled="!newSolventSetNameValid"
      >
        <b-form-group
          label="Please enter a name for the solvent set"
          label-for="new-name-input"
          :invalid-feedback="newSolventSetNameFeedback"
          :state="newSolventSetNameValid"
        >
          <b-form-input id="new-name-input" v-model="newSolventSetName" :state="newSolventSetNameValid"></b-form-input>
        </b-form-group>
        <p>Custom solvent sets are stored locally in your browser.</p>
      </b-modal>
    </div>
  </template> -->
  
  <!-- <script>
  import LoadingButton from "@/components/LoadingButton";
  import SettingInput from "@/components/SettingInput";
  import SmilesImage from "@/components/SmilesImage";
  import SmilesInput from "@/components/SmilesInput";
  import {API} from "@/common/api";
  import {colorMap} from "@/common/color";
  import {loadCustomSolventSets, saveCustomSolventSets, solventSets} from "@/pages/properties/solvents";
  import {saveAs} from "file-saver";
  import * as Papa from "papaparse";
  // import 'chart.js/auto';
  // import { Bar, Line } from 'vue-chartjs/legacy'
  
  export default {
    name: "SolventScreening",
    components: {
      LoadingButton,
      SettingInput,
      SmilesImage,
      SmilesInput,
      // 'bar-chart': Bar,
      // 'line-chart': Line,
    },
    data() {
      return {
        solute: '',
        solvents: '',
        solventSet: 'Set 1',
        askcosSolventSets: solventSets,
        customSolventSets: {},
        newSolventSetName: 'mysolventset',
        temperatures: '298\n323',
        refSolvent: null,
        refSolubility: null,
        refTemperature: null,
        soluteHsub: null,
        soluteCpg: null,
        soluteCps: null,
        results: [],
        uploadFile: null,
        selectedMethod: 1,
        methodOptions: [{value: 1, text: 'Method 1'}, {value: 2, text: 'Method 2'}],
        selectedX: 'solvent',
        xOptions: ['solvent', 'temperature'],
        selectedUnits: 'mg/mL',
        unitOptions: ['log10(mol/L)', 'mg/mL'],
        loading: false,
      }
    },
    computed: {
      fields() {
        const _fields = [
          {key: 'image', label: 'Solvent', tdClass: ['text-center']},
          {key: 'solvent', label: 'SMILES', sortable: true},
        ]
        Object.keys(this.resultsByTemperature).forEach((temp) => {
          _fields.push({
            key: temp,
            label: `Solubility @ ${temp}K (Method ${this.selectedMethod}) [${this.selectedUnits}]`,
            sortable: true
          })
        })
        return _fields
      },
      solventSets() {
        return Object.assign({}, this.askcosSolventSets, this.customSolventSets)
      },
      solventList() {
        return this.solvents.split('\n')
      },
      temperatureList() {
        return this.temperatures.split('\n').map((t) => Number(t))
      },
      resultsBySolvent() {
        let resultsBySolvent = {}
        for (let item of this.results) {
          if (item['Solvent'] in resultsBySolvent){
            resultsBySolvent[item['Solvent']].push(item)
          } else {
            resultsBySolvent[item['Solvent']] = [item]
          }
        }
        return resultsBySolvent
      },
      resultsByTemperature() {
        let resultsByTemp = {}
        for (let item of this.results) {
          if (item['Temp'] in resultsByTemp){
            resultsByTemp[item['Temp']].push(item)
          } else {
            resultsByTemp[item['Temp']] = [item]
          }
        }
        return resultsByTemp
      },
      resultKey() {
        let key = ''
        if (this.selectedUnits === 'log10(mol/L)') {
          key = `logST (method${this.selectedMethod}) [log10(mol/L)]`
        } else if (this.selectedUnits === 'mg/mL') {
          key = `ST (method${this.selectedMethod}) [mg/mL]`
        }
        return key
      },
      tableData() {
        // Formats data as records for each solvent
        let allData = []
        Object.entries(this.resultsBySolvent).forEach(([solvent, results]) => {
          let data = {solvent: solvent}
          for (let res of results) {
            data[res['Temp']] = res[this.resultKey]
          }
          allData.push(data)
        })
        return allData
      },
      chartData() {
        // Formats data as datasets for each temperature
        let allData = []
        if (this.selectedX === 'solvent') {
          Object.entries(this.resultsByTemperature).forEach(([temp, results], index) => {
            allData.push({
              label: temp,
              data: results.map((res) => {
                return {
                  x: res['Solvent'],
                  y: res[this.resultKey],
                }
              }),
              backgroundColor: colorMap[index % colorMap.length] + '80',
            })
          })
        } else if (this.selectedX === 'temperature') {
          Object.entries(this.resultsBySolvent).forEach(([solvent, results], index) => {
            let dashStyles = [[], [10], [10, 5, 5, 5], [5]]
            allData.push({
              label: solvent,
              data: results.map((res) => {
                return {
                  x: res['Temp'],
                  y: res[this.resultKey],
                }
              }).sort((a, b) => a['x'] - b['x']),
              borderColor: colorMap[index % colorMap.length] + '80',
              borderDash: dashStyles[Math.floor(index / colorMap.length)],
              fill: false,
            })
          })
        }
        return {datasets: allData}
      },
      chartOptions() {
        return {
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: this.selectedX === 'solvent'? 'Solvent' : 'Temperature [K]',
              },
              type: this.selectedX === 'solvent'? 'category' : 'linear',
            },
            y: {
              title: {
                display: true,
                text: `Solubility (Method ${this.selectedMethod}) [${this.selectedUnits}]`,
              },
            },
          }
        }
      },
      newSolventSetNameInUse() {
        return this.newSolventSetName === 'custom'
          || Object.keys(this.askcosSolventSets).includes(this.newSolventSetName)
          || Object.keys(this.customSolventSets).includes(this.newSolventSetName)
      },
      newSolventSetNameValid() {
        return this.newSolventSetName.length > 0 && !this.newSolventSetNameInUse
      },
      newSolventSetNameFeedback() {
        if (this.newSolventSetNameInUse) {
          return 'Name already in use'
        } else {
          return 'Please enter a name'
        }
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
  
      // Load custom solvent sets from localStorage
      this.customSolventSets = loadCustomSolventSets()
      this.solvents = this.solventSets[this.solventSet].join('\n')
    },
    methods: {
      predict() {
        this.loading = true
        this.results = []
        let promises = []
        for (let temp of this.temperatureList) {
          let tasks = this.solventList.map((solvent) => {
            return {
              solvent: solvent,
              solute: this.solute,
              temp: temp,
              ref_solvent: this.refSolvent || null,
              ref_solubility: this.refSolubility || null,
              ref_temp: this.refTemperature || null,
              hsub298: this.soluteHsub || null,
              cp_gas_298: this.soluteCpg || null,
              cp_solid_298: this.soluteCps || null,
            }
          })
          promises.push(this.predictBatch(tasks))
        }
        Promise.all(promises)
          .catch(error => {
            alert('There was an error predicting solubility: ' + error)
          })
          .finally(() => this.loading = false)
      },
      predictBatch(data) {
        const url = '/api/v2/solubility/batch/'
        const body = {
          task_list: data,
        }
        return API.runCeleryTask(url, body)
          .then(output => {
            this.results.push(...output)
          })
      },
      downloadCSV() {
        if (!this.results.length) {
          alert('There are no results to download!')
          return
        }
        let downloadData = Papa.unparse(this.results)
        let blob = new Blob([downloadData], {type: 'data:text/csv;charset=utf-8'})
        saveAs(blob, 'askcos_solubility_export.csv')
      },
      downloadJSON() {
        if (!this.results.length) {
          alert('There are no results to download!')
          return
        }
        let downloadData = JSON.stringify(this.results)
        let blob = new Blob([downloadData], {type: 'data:text/json;charset=utf-8'})
        saveAs(blob, 'askcos_solubility_export.json')
      },
      deleteSolventSet() {
        this.$delete(this.customSolventSets, this.solventSet)
        this.solventSet = 'custom'
        saveCustomSolventSets(this.customSolventSets)
      },
      saveSolventSet() {
        this.$set(this.customSolventSets, this.newSolventSetName, this.solventList)
        this.solventSet = this.newSolventSetName
        saveCustomSolventSets(this.customSolventSets)
      },
    },
    watch: {
      resultKey() {
        this.$refs['chart'].renderChart(this.chartData, this.chartOptions)
      },
      solvents(newVal) {
        if (newVal in this.solventSets && newVal !== this.solventSets[this.solventSet].join('\n')) {
          this.solventSet = 'custom'
        }
      },
      solventSet(newVal) {
        if (newVal in this.solventSets) {
          this.solvents = this.solventSets[newVal].join('\n')
        }
      },
    },
  }
  </script>
  
  <style scoped>
  #solvent-screen-left-pane {
    overflow-y: auto;
    max-height: calc(100vh - 14rem);
  }
  </style>
   -->