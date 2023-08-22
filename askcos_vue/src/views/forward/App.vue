<template>
  <v-container fluid class="my-10">
    <v-row style="min-height: 30vh" class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <v-sheet elevation="2" rounded="lg" class="pa-10">
          <v-row align="center" justify="space-between">
            <h1 class="my-2">Forward Synthesis Planner</h1>
            <v-btn icon @click="dialog = !dialog">
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </v-row>

          <v-form @submit.prevent="predict">

            <v-row align="center ">

              <v-col cols="6" class="my-4">
                <v-text-field v-model="reactants" label="Reactants"></v-text-field>
              </v-col>

              <v-col cols="6">
                <v-text-field v-model="product" label="Product"
                  :disabled="mode === 'forward' || mode === 'sites'"></v-text-field>
              </v-col>

            </v-row>

            <v-row v-if="!!reactants" class="d-flex justify-center">
              <v-col cols="4">
                <smiles-image :smiles="reactants + '>>' + product"></smiles-image>
              </v-col>
            </v-row>

            <v-row align="center" v-if="mode !== 'context' && mode !== 'sites'">

              <v-col cols="6">
                <v-text-field v-model="reagents" label="Reagents" :disabled="mode === 'context' || mode === 'sites'">
                  <v-img v-if="!!reagents" :src="getMolImgUrl(reagents)" class="mx-auto" />
                </v-text-field>
              </v-col>

              <v-col cols="6">
                <v-text-field v-model="solvent" label="Solvent" :disabled="mode === 'context' || mode === 'sites'">
                  <v-img v-if="!!solvent" :src="getMolImgUrl(solvent)" class="mx-auto" />
                </v-text-field>
              </v-col>

            </v-row>

            <v-row align="center">
              <v-col cols="12">
                <v-btn type="submit" color="success">
                  Submit
                </v-btn>
              </v-col>
            </v-row>

          </v-form>

        </v-sheet>

        <v-sheet elevation="2" rounded="lg" class="my-6 ">
          <v-tabs v-model="tab" color="primary" align-tabs="center" grow class="mb-4">
            <v-tab value="CR">Condition Recommendation</v-tab>
            <v-tab value="SP">Synthesis Prediction</v-tab>
            <v-tab value="IP">Impurity Prediction</v-tab>
            <v-tab value="RSP">Regioselectivity Prediction</v-tab>
            <v-tab value="ARSS">Site Selectivity Prediction</v-tab>
          </v-tabs>
        </v-sheet>

        <v-window v-model="tab" class="elevation-2">
          <v-window-item value="CR" rounded="lg">
            <ConditionRecommendation value="CR" rounded="lg" :results="contextResults"/>
          </v-window-item>
          <v-window-item value="SP"> <SynthesisPrediction value="SP" rounded="lg" /></v-window-item>
          <v-window-item value="IP">  <ImpurityPrediction value="IP" rounded="lg" /> </v-window-item>
          <v-window-item value="RSP"> <Regioselectivity value="RSP" rounded="lg" /> </v-window-item>
          <v-window-item value="ARSS"><SiteSelectivity value="ARSS" rounded="lg" /> </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>

  <template>
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Settings</span>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-divider></v-divider>
            <v-col cols="12">
              <h4>Model selections</h4>
            </v-col>
            <v-col cols="12">
              <v-select label="Condition recommendation model" v-model="contextModel"
                :items="['neuralnetwork', 'neuralnetworkv2']">
              </v-select>
            </v-col>

            <v-col cols="12" v-if="contextModel === 'neuralnetworkv2'">
              <v-select label="Neural Network v2 model type" v-model="contextV2ModelType"
                :items="['graph', 'fp-small']"></v-select>
            </v-col>

            <v-col cols="12" v-if="contextModel === 'neuralnetworkv2'">
              <v-select label="Neural Network v2 dataset version" v-model="contextV2ModelVersion"
                :items="['20191118']"></v-select>
            </v-col>

            <v-col cols="12">
              <v-select label="Forward prediction model" v-model="forwardModel" :items="forwardModels"></v-select>
            </v-col>

            <v-col cols="12">
              <v-select label="Forward model training set" v-model="forwardModelTrainingSet"
                :items="forwardModelTrainingSets"></v-select>
            </v-col>

            <v-col cols="12">
              <v-select label="Forward model version" v-model="forwardModelVersion"
                :items="forwardModelVersions"></v-select>
            </v-col>
            <v-divider></v-divider>
            <v-col cols="12">
              <h4>Condition recommender settings</h4>
            </v-col>
            <v-col cols="12">
              <v-text-field label="Num. results" hint="How many condition recommendation results to return?" type="number"
                v-model="numContextResults"></v-text-field>
            </v-col>
            <v-divider></v-divider>
            <v-col cols="12">
              <h4>Forward predictor settings</h4>
            </v-col>

            <v-col cols="12">
              <v-text-field label="Num. results" hint="How many forward prediction results to return?" type="number"
                v-model="numForwardResults"></v-text-field>
            </v-col>
            <v-divider></v-divider>
            <v-col cols="12">
              <h4>Impurity predictor settings</h4>
            </v-col>
            <v-col cols="12">
              <v-text-field label="Top-k from forward prediction"
                hint="How many of the top forward prediction products should be included in impurity prediction?"
                type="number" v-model="impurityTopk"></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field label="Inspection threshold" hint="Threshold for filtering out bad reactions." type="number"
                v-model="inspectionThreshold"></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-select label="Inspector Score Selection" hint="Select inspector scorer to use." v-model="inspectionModel"
                :items="['WLN forward inspector', 'Reaxys inspector']"></v-select>
            </v-col>

            <v-col cols="8">
              <v-switch label="Use atom mapping" hint="Whether to use atom mapping to check reaction modes."
                v-model="impurityCheckMapping"></v-switch>
            </v-col>
            <v-divider></v-divider>
            <v-col cols="12">
              <h4>Regio-selectivity predictor settings</h4>
            </v-col>
            <v-col cols="12">
              <v-switch label="Do not map reagents" hint="Reagents do not provide any atom to the product."
                v-model="absoluteReagents"></v-switch>
            </v-col>

          </v-row>
        </v-card-text>

      </v-card>
    </v-dialog>
  </template>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { API } from "@/common/api";
import SmilesImage from "@/components/SmilesImage";
import ConditionRecommendation from "@/views/forward/tab/ConditionRecommendation.vue"
import SynthesisPrediction from  "@/views/forward/tab/SynthesisPrediction.vue"
import ImpurityPrediction from "@/views/forward/tab/ImpurityPrediction.vue"
import Regioselectivity from  "@/views/forward/tab/Regioselectivity.vue"
import SiteSelectivity from  "@/views/forward/tab/SiteSelectivity.vue"

const route = useRoute();
const router = useRouter();
const tab = ref("");
const dialog = ref(false)
const contextModel = ref('neuralnetwork');
const modelStatus = ref([]);
const reactants = ref('');
const product = ref('');
const reagents = ref('');
const solvent = ref('');
const contextResults = ref([]);


const contextV2ModelType = ref('fp-small');
const contextV2ModelVersion = ref('20191118');
const forwardModel = ref('wln_forward');
const forwardModelTrainingSet = ref('uspto_500k');
const forwardModelVersion = ref('1');
const numContextResults = ref(10);
const numForwardResults = ref(100);
const impurityTopk = ref(3);
const inspectionThreshold = ref(0.1);
const inspectionModel = ref('WLN forward inspector');
const impurityCheckMapping = ref(true);
const absoluteReagents = ref(true);

const forwardModels = computed(() => {
  const models = new Set()
  const types = ['wln_forward', 'graph2smiles']
  modelStatus.value
    .filter(item => types.includes(item['type']) && item['ready'])
    .forEach(item => {
      if (item['name'].startsWith('wln_forward')) {
        models.add('wln_forward')
      } else {
        models.add(item['name'])
      }
    })
  return Array.from(models).sort()
});

const forwardModelTrainingSets = computed(() => {
  const sets = new Set();
  modelStatus.value
    .filter(item => item.name.startsWith(forwardModel.value) && item.ready)
    .forEach(item => {
      sets.add(item.training_set);
    });
  return Array.from(sets).sort();
});

const forwardModelVersions = computed(() => {
  const versions = new Set();
  modelStatus.value
    .filter(item => item.name.startsWith(forwardModel.value) && item.training_set === forwardModelTrainingSet.value && item.ready)
    .forEach(item => {
      item.versions.forEach(v => versions.add(v));
    });
  return Array.from(versions).sort();
});

const modes = ref({
  CR: 'context',
  SP: 'forward',
  IP: 'impurity',
  RSP: 'selectivity',
  ARSS: 'sites'
})

onMounted(() => {
  let urlParams = route.query;
  let urlTab = urlParams.tab;
  if (urlTab !== null) {
    tab.value = urlTab;
  }
});

const predict = () => {
      switch (mode.value) {
        case 'forward':
          clearForward();
          forwardPredict();
          break;
        case 'context':
          clearContext();
          contextPredict();
          break;
        case 'impurity':
          clearImpurity();
          impurityPredict();
          break;
        case 'selectivity':
          clearSelectivity();
          selectivityPredict();
          break;
        case 'sites':
          clearSites();
          sitesPredict();
          break;
        default:
          alert('unsupported mode');
      }
};

watch(tab, (newTab) => {
  router.push({ path: route.path, query: { ...route.query, tab: newTab } });
});


onMounted(() => {
  API.get('/api/v2/status/ml/')
    .then(json => {
      modelStatus.value = json['models'];
      console.log(modelStatus.value)
    });
  if (reactants.value) {
    predict();
  }
});

const forwardPredict = async () => {
  pendingTasks.value++;
  forwardResults.value = [];

  if (reactants.value.length < 4) {
    alert('Please enter a reactant with at least 4 atoms.');
    pendingTasks.value--;
    return;
  }

  const postData = constructForwardPostData(reagents.value, solvent.value);

  try {
    const output = await API.runCeleryTask('/api/v2/forward/', postData);
    forwardResults.value = output;
  } catch (error) {
    console.error('Error in forward prediction:', error);
  } finally {
    pendingTasks.value--;
  }
};

</script>




