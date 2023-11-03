<template>
  <v-container fluid style="min-height: calc(100vh-50px)">
    <v-row class="justify-center align-center">
      <v-col cols="12" md="12">
        <v-sheet elevation="2" class="pa-10">
          <v-form @submit.prevent>
            <v-row class="justify-center align-center">
              <v-col cols="12" md="4">
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
              <v-col cols="12" md="4">
                <v-row class="mb-2">
                  <v-select label="Solvent Set" variant="outlined" :items="Object.keys(solventSets)" hide-details
                    v-model="solventSet"></v-select>
                </v-row>
                <v-row>
                  <v-textarea label="Solvents" hide-details variant="outlined" v-model="solvents"></v-textarea>
                </v-row>
              </v-col>
              <v-col cols="12" md="4">
                <v-textarea label="Temperatures" hide-details variant="outlined" v-model="temperatures"></v-textarea>
              </v-col>
            </v-row>
            <v-row align="center" justify-start>
              <v-col>
                <v-btn type="submit" variant="flat" color="success" class="mr-5" @click="predict">Submit</v-btn>
                <v-btn variant="tonal" class="mr-5" :disabled="results.length === 0" @click="clear(false)">
                  Clear
                </v-btn>
                <v-btn icon @click="dialog = !dialog" variant="outlined">
                  <v-icon>mdi-cog</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-sheet elevation="2" class="pa-4" rounded="lg">
          <div v-if="results.length">
            <v-row>
              <v-col cols="12" md="12">
                <div class="d-flex flex-row justify-center align-center">
                  <v-select label="Calculation Method" variant="outlined" v-model="selectedMethod" :items="methodOptions"
                    hide-details class="mr-4">
                  </v-select>
                  <v-select label="Units" variant="outlined" v-model="selectedUnits" :items="unitOptions" hide-details
                    class="mr-4">
                  </v-select>
                  <v-select label="X Axis" variant="outlined" v-model="selectedX" :items="xOptions" hide-details
                    class="mr-4">
                  </v-select>
                  <v-spacer></v-spacer>
                  <v-menu location="bottom" :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <v-btn v-bind="props" variant="flat" color="primary">Download</v-btn>
                    </template>
                    <v-card width="auto" min-width="250px">
                      <v-list density="compact">
                        <v-list-item @click="downloadCSV">Download CSV</v-list-item>
                        <v-list-item @click="downloadJSON">Download JSON</v-list-item>
                      </v-list>
                    </v-card>
                  </v-menu>
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="12">
                <bar-chart v-if="selectedX === 'solvent'" ref="chart" chart-id="solubility-chart" :data="chartData"
                  :options="chartOptions" style="height:40vh"></bar-chart>
                <line-chart v-if="selectedX === 'temperature'" ref="chart" chart-id="solubility-chart" :data="chartData"
                  :options="chartOptions" style="height:40vh"></line-chart>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="12">
                <v-data-table :headers="fields" :items="tableData" fixed-header style="height: 100%" class="mt-3"
                  density="compact">
                  <template v-slot:item.image="{ item }">
                    <smiles-image :smiles="item.raw['solvent']"></smiles-image>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </div>
          <v-skeleton-loader v-else-if="loading" class="mx-auto my-auto" min-height="80px" type="table">
          </v-skeleton-loader>
          <div v-else class="text-center d-flex justify-center align-center flex-column">
            <v-img :width="400" cover :src="emptyChartSrc" class="mb-3"></v-img>
            <h2 class="mt-5">No Results</h2>
            <p class="text-body-1">Begin by running a new prediction!</p>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
  
<script>
import SmilesImage from "@/components/SmilesImage";
import SmilesInput from "@/components/SmilesInput";
import { API } from "@/common/api";
import { colorMap } from "@/common/color";
import { loadCustomSolventSets, saveCustomSolventSets, solventSets } from "@/views/solprop/solvents";
import { saveAs } from "file-saver";
import * as Papa from "papaparse";
import 'chart.js/auto';
import { Bar, Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import emptyChart from '@/assets/emptyChart.svg'
import { useConfirm } from 'vuetify-use-dialog';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: "SolventScreening",
  components: {
    SmilesImage,
    SmilesInput,
    'bar-chart': Bar,
    'line-chart': Line,
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
      methodOptions: [{ value: 1, title: 'Method 1' }, { value: 2, title: 'Method 2' }],
      selectedX: 'solvent',
      xOptions: ['solvent', 'temperature'],
      selectedUnits: 'mg/mL',
      unitOptions: ['log10(mol/L)', 'mg/mL'],
      loading: false,
      emptyChartSrc: emptyChart
    }
  },
  setup() {
    const createConfirm = useConfirm();
    return {
      createConfirm
    }
  },
  computed: {
    fields() {
      const _fields = [
        { key: 'image', title: 'Solvent', tdClass: ['text-center'] },
        { key: 'solvent', title: 'SMILES', sortable: true },
      ]
      Object.keys(this.resultsByTemperature).forEach((temp) => {
        _fields.push({
          key: temp,
          title: `Solubility @ ${temp}K (Method ${this.selectedMethod}) [${this.selectedUnits}]`,
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
        if (item['Solvent'] in resultsBySolvent) {
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
        if (item['Temp'] in resultsByTemp) {
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
        key = `log_st_${this.selectedMethod}`
      } else if (this.selectedUnits === 'mg/mL') {
        key = `st_${this.selectedMethod}`
      }
      return key
    },
    tableData() {
      // Formats data as records for each solvent
      let allData = []
      Object.entries(this.resultsBySolvent).forEach(([solvent, results]) => {
        let data = { solvent: solvent }
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
      return { datasets: allData }
    },
    chartOptions() {
      return {
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: this.selectedX === 'solvent' ? 'Solvent' : 'Temperature [K]',
            },
            type: this.selectedX === 'solvent' ? 'category' : 'linear',
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
    async clear(skipConfirm = false) {
      if (!skipConfirm) {
        const isConfirmed = await this.createConfirm({
          title: 'Please Confirm',
          content: 'This will clear all of your current results. Continue anyway?',
          dialogProps: { width: "auto" }
        });
        if (!isConfirmed) {
          return;
        }
      }
      this.results = []
    },
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
    async predictBatch(data) {
      const url = '/api/legacy/solubility/batch/call-async'
      const body = {
        task_list: data,
      }
      const output = await API.runCeleryTask(url, body);
      this.results.push(...output);
    },
    downloadCSV() {
      if (!this.results.length) {
        alert('There are no results to download!')
        return
      }
      let downloadData = Papa.unparse(this.results)
      let blob = new Blob([downloadData], { type: 'data:text/csv;charset=utf-8' })
      saveAs(blob, 'askcos_solubility_export.csv')
    },
    downloadJSON() {
      if (!this.results.length) {
        alert('There are no results to download!')
        return
      }
      let downloadData = JSON.stringify(this.results)
      let blob = new Blob([downloadData], { type: 'data:text/json;charset=utf-8' })
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
