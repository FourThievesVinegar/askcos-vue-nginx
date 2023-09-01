<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <div class="mt-8 mb-5">
          <v-breadcrumbs class="pa-0" :items="['Home', 'Forward']"></v-breadcrumbs>
          <h1>
            Forward Synthesis Planner
          </h1>
        </div>
        <v-sheet elevation="2" rounded="lg" class="pa-10">

          <ketcher-modal ref="ketcherRef" v-model="showKetcher" :smiles="currentSmiles" @input="showKetcher = false"
            @update:smiles="(ketcherSmiles) => updateSmiles(ketcherSmiles)" />

          <v-form @submit.prevent="predict">

            <v-row align="center">
              <v-col :cols="mode === 'context' || mode === 'impurity' || mode === 'selectivity' ? 6 : 12">
                <v-text-field v-model="reactants" class="centered-input" variant="outlined" label="Reactants"
                  prepend-inner-icon="mdi mdi-flask" placeholder="SMILES" hide-details clearable>
                  <template v-slot:append-inner>
                    <v-btn variant="tonal" prepend-icon="mdi mdi-pencil" @click="openKetcher('reactants')">Draw</v-btn>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="6" v-if="mode === 'context' || mode === 'impurity' || mode === 'selectivity'">
                <v-text-field v-model="product" label="Product" class="centered-input" variant="outlined"
                  prepend-inner-icon="mdi mdi-flask" placeholder="SMILES" hide-details clearable>
                  <template v-slot:append-inner>
                    <v-btn variant="tonal" prepend-icon="mdi mdi-pencil" @click="openKetcher('product')">Draw</v-btn>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>

            <v-row v-if="!!reactants" class="d-flex justify-center">
              <v-col cols="12">
                <smiles-image :smiles="reactants + '>>' + product"></smiles-image>
              </v-col>
            </v-row>

            <v-row align="center" v-if="mode !== 'context' && mode !== 'sites'">
              <v-col cols="6">
                <v-text-field v-model="reagents" label="Reagents" class="centered-input" variant="outlined"
                  prepend-inner-icon="mdi mdi-flask" placeholder="SMILES" hide-details clearable
                  :disabled="mode === 'context' || mode === 'sites'">
                  <template v-slot:append-inner>
                    <v-btn variant="tonal" prepend-icon="mdi mdi-pencil" @click="openKetcher('reagents')">Draw</v-btn>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="solvent" label="Solvent" class="centered-input" variant="outlined"
                  prepend-inner-icon="mdi mdi-flask" placeholder="SMILES" hide-details clearable
                  :disabled="mode === 'context' || mode === 'sites'">
                  <template v-slot:append-inner>
                    <v-btn variant="tonal" prepend-icon="mdi mdi-pencil" @click="openKetcher('solvent')">Draw</v-btn>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>

            <v-row
              v-if="!!reagents && mode === 'forward' || !!reagents && mode === 'impurity' || !!reagents && mode === 'selectivity'"
              class="d-flex justify-center">
              <v-col cols="6" class="d-flex justify-center">
                <smiles-image :smiles="reagents"></smiles-image>
              </v-col>
              <v-col cols="6" class="d-flex justify-center">
                <smiles-image :smiles="solvent"></smiles-image>
              </v-col>
            </v-row>

            <v-row align="center" justify="space-between">
              <v-col>
                <v-btn type="submit" color="success">
                  Submit
                </v-btn>
              </v-col>
              <v-btn icon @click="dialog = !dialog">
                <v-icon>mdi-cog</v-icon>
              </v-btn>
            </v-row>
          </v-form>

        </v-sheet>

        <v-sheet elevation="2" class="my-6 ">
          <v-tabs v-model="tab" color="primary" align-tabs="center" grow class="mb-4">
            <v-tab @click="replaceRoute('context')" value="context">Condition Recommendation</v-tab>
            <v-tab @click="replaceRoute('forward')" value="forward">Synthesis Prediction</v-tab>
            <v-tab @click="replaceRoute('impurity')" value="impurity">Impurity Prediction</v-tab>
            <v-tab @click="replaceRoute('selectivity')" value="selectivity">Regioselectivity Prediction</v-tab>
            <v-tab @click="replaceRoute('sites')" value="sites">Site Selectivity Prediction</v-tab>
          </v-tabs>
        </v-sheet>

        <v-window v-model="tab" class="elevation-2">
          <v-window-item value="context" rounded="lg">
            <ConditionRecommendation value="context" rounded="lg" :results="contextResults" :models="contextModel"
              :pending="pendingTasks" />
          </v-window-item>
          <v-window-item value="forward">
            <SynthesisPrediction value="forward" rounded="lg" :results="forwardResults" :models="forwardModel"
              :pending="pendingTasks" />
          </v-window-item>
          <v-window-item value="impurity">
            <ImpurityPrediction value="impurity" rounded="lg" />
          </v-window-item>
          <v-window-item value="selectivity">
            <Regioselectivity value="selectivity" rounded="lg" />
          </v-window-item>
          <v-window-item value="sites">
            <SiteSelectivity value="sites" rounded="lg" />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>


    <v-dialog v-model="dialog" max-width="600px" class="justify-center align-center">
          <v-card class="pa-3 m-3">
            <v-card-title class="headline">
              Settings
            </v-card-title>
            <v-expand-transition>
              <v-expansion-panels>

                <v-expansion-panel>
                  <v-expansion-panel-title class="text-primary">Model selections</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="12">
                        <v-select label="Condition recommendation model" density="comfortable" variant="outlined" v-model="contextModel"
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
                        <v-select label="Forward prediction model" v-model="forwardModel"
                          :items="forwardModels"></v-select>
                      </v-col>

                      <v-col cols="12">
                        <v-select label="Forward model training set" v-model="forwardModelTrainingSet"
                          :items="forwardModelTrainingSets"></v-select>
                      </v-col>

                      <v-col cols="12">
                        <v-select label="Forward model version" v-model="forwardModelVersion"
                          :items="forwardModelVersions"></v-select>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title class="text-primary">Condition recommender settings</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field class="my-6" label="Num. results" prepend-inner-icon="mdi mdi-flask"
                  density="comfortable" variant="outlined" placeholder="How many condition recommendation results to return?" hide-details clearable
                          type="number" v-model="numContextResults"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title class="text-primary">Forward predictor settings</v-expansion-panel-title>
                  <v-expansion-panel-text>
  <v-row>
                    <v-col cols="12">
                      <v-text-field class="mt-6" label="Num. results" placeholder="How many forward prediction results to return?"
                      prepend-inner-icon="mdi mdi-flask"
                    density="comfortable" variant="outlined" 
                        type="number" v-model="numForwardResults"></v-text-field>
                    </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>

                <v-expansion-panel>
                  <v-expansion-panel-title class="text-primary">Impurity predictor settings</v-expansion-panel-title>
                  <v-expansion-panel-text>

                    <v-col cols="12">
                      <v-text-field label="Top-k from forward prediction"
                        hint="How many of the top forward prediction products should be included in impurity prediction?"
                        type="number" v-model="impurityTopk"></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-text-field label="Inspection threshold" hint="Threshold for filtering out bad reactions."
                        type="number" v-model="inspectionThreshold"></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-select label="Inspector Score Selection" hint="Select inspector scorer to use."
                        v-model="inspectionModel" :items="['WLN forward inspector', 'Reaxys inspector']"></v-select>
                    </v-col>

                    <v-col cols="8">
                      <v-switch label="Use atom mapping" hint="Whether to use atom mapping to check reaction modes."
                        v-model="impurityCheckMapping"></v-switch>
                    </v-col>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title class="text-primary">Regio-selectivity predictor
                    settings</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-col cols="12">
                      <v-switch label="Do not map reagents" hint="Reagents do not provide any atom to the product."
                        v-model="absoluteReagents"></v-switch>
                    </v-col>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-expand-transition>
          </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { API } from "@/common/api";
import KetcherModal from "@/components/KetcherModal";
import SmilesImage from "@/components/SmilesImage";
import ConditionRecommendation from "@/views/forward/tab/ConditionRecommendation.vue"
import SynthesisPrediction from "@/views/forward/tab/SynthesisPrediction.vue"
import ImpurityPrediction from "@/views/forward/tab/ImpurityPrediction.vue"
import Regioselectivity from "@/views/forward/tab/Regioselectivity.vue"
import SiteSelectivity from "@/views/forward/tab/SiteSelectivity.vue"

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
const forwardResults = ref([])
const pendingTasks = ref(0)
const reactionScore = ref(null)
const evaluating = ref(false)
const impurityResults = ref([]);
const showKetcher = ref(false);
const ketcherRef = ref(null);
const currentInputSource = ref('');

const currentSmiles = computed(() => {
  switch (currentInputSource.value) {
    case 'reactants':
      return reactants.value;
    case 'product':
      return product.value;
    case 'reagents':
      return reagents.value;
    case 'solvent':
      return solvent.value;
    default:
      return '';
  }
});

const openKetcher = (source) => {
  currentInputSource.value = source;
  showKetcher.value = true;
  ketcherRef.value.smilesToKetcher();
};

const updateSmiles = (ketcherSmiles) => {
  switch (currentInputSource.value) {
    case 'reactants':
      reactants.value = ketcherSmiles;
      break;
    case 'product':
      product.value = ketcherSmiles;
      break;
    case 'reagents':
      reagents.value = ketcherSmiles;
      break;
    case 'solvent':
      solvent.value = ketcherSmiles;
      break;
  }
};


const modes = ref({
  0: 'context',
  1: 'forward',
  2: 'impurity',
  3: 'selectivity',
  4: 'sites'
})
const activeTab = ref(0);

const tabs = ref({
  context: 0,
  forward: 1,
  impurity: 2,
  selectivity: 3,
  sites: 4,
})

const changeMode = (mode) => {
  activeTab.value = tabs.value[mode];
}

const mode = computed(() => {
  return modes.value[activeTab.value]
})

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


const replaceRoute = (tab) => {
  router.replace({ path: '/forward', query: { tab } })
}

const predict = async () => {
  pendingTasks.value++
  try {
    await canonicalizeAll()
    switch (mode.value) {
      case 'forward':
        clearForward()
        forwardPredict()
        break
      case 'context':
        clearContext()
        contextPredict()
        break
      case 'impurity':
        clearImpurity()
        impurityPredict()
        break
      case 'selectivity':
        clearSelectivity()
        selectivityPredict()
        break
      case 'sites':
        clearSites()
        sitesPredict()
        break
      default:
        alert('unsupported mode')
    }
  } finally {
    pendingTasks.value--
  }
}

watch(route, async (newRoute, _oldRoute) => {
  if (newRoute.path === '/forward') {
    tab.value = newRoute.query.tab
    updateFromURL();
  }
})

const clearForward = () => {
  forwardResults.value = []
}

const updateFromURL = () => {
  let urlParams = new URLSearchParams(window.location.search);
  let mode = urlParams.get('tab');
  if (mode) {
    tab.value = mode
    changeMode(mode);
  }
  let rxnsmiles = urlParams.get('rxnsmiles');
  if (rxnsmiles) {
    const split = rxnsmiles.split('>>');
    reactants.value = split[0];
    product.value = split[split.length - 1];
  }
  if (urlParams.get('reactants')) {
    reactants.value = urlParams.get('reactants');
  }
  if (urlParams.get('product')) {
    product.value = urlParams.get('product');
  }
  if (urlParams.get('reagents')) {
    reagents.value = urlParams.get('reagents');
  }
  if (urlParams.get('solvent')) {
    solvent.value = urlParams.get('solvent');
  }
};

onMounted(() => {
  API.get('/api/v2/status/ml/')
    .then(json => {
      modelStatus.value = json['models'];
    });
  updateFromURL();
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
    console.log(forwardResults.value)
  } catch (error) {
    console.error('Error in forward prediction:', error);
  } finally {
    pendingTasks.value--;
  }
};

const constructForwardPostData = (reagents, solvent) => {
  let data = reactive({
    reactants: reactants.value,
    model_name: forwardModel.value,
    training_set: forwardModelTrainingSet.value,
    model_version: forwardModelVersion.value,
    num_results: numForwardResults.value
  });

  if (reagents) {
    data.reagents = reagents;
  }
  if (solvent) {
    data.solvent = solvent;
  }

  return data;
}

const canonicalize = async (smiles, input) => {
  return API.post('/api/v2/rdkit/smiles/canonicalize/', { smiles: smiles })
    .then(json => {
      if (input === 'reactants') {
        reactants.value = json.smiles
      } else if (input === 'product') {
        product.value = json.smiles
      } else if (input === 'reagents') {
        reagents.value = json.smiles
      } else if (input === 'solvent') {
        solvent.value = json.smiles
      }
    })
}
const canonicalizeAll = () => {
  let promises = []

  const properties = {
    reactants: reactants.value,
    product: product.value,
    reagents: reagents.value,
    solvent: solvent.value,
  }

  for (let smi in properties) {
    if (properties[smi]) {
      promises.push(canonicalize(properties[smi], smi))
    }
  }
  return Promise.all(promises)
}
const clearContext = () => {
  contextResults.value = []
  reactionScore.value = null
}

const contextPredict = () => {
  switch (contextModel.value) {
    case 'neuralnetwork':
      contextV1Predict()
      break
    case 'neuralnetworkv2':
      contextV2Predict()
      break
    default:
      alert('unsupported context model')
  }
}

const contextV1Predict = async () => {
  pendingTasks.value++;
  contextResults.value = []
  evaluating.value = false
  let postData = constructContextV1PostData()
  API.runCeleryTask('/api/v2/context/', postData)
    .then(output => {
      contextResults.value = output
      console.log(contextResults.value)
    })
    .finally(() => {
      pendingTasks.value--;
    })
}
const constructContextV1PostData = () => {
  return {
    reactants: reactants.value,
    products: product.value,
    return_scores: true,
    num_results: numContextResults.value
  }
}

</script>




