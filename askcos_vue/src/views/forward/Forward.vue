<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="10">

        <v-sheet elevation="2" class="my-6 ">
          <v-tabs v-model="tab" color="primary" align-tabs="center" grow class="mb-4">
            <v-tab @click="replaceRoute('context')" value="context">Condition Recommendation</v-tab>
            <v-tab @click="replaceRoute('forward')" value="forward">Product Prediction</v-tab>
            <v-tab @click="replaceRoute('impurity')" value="impurity">Impurity Prediction</v-tab>
            <v-tab @click="replaceRoute('selectivity')" value="selectivity">Regioselectivity Prediction</v-tab>
            <v-tab @click="replaceRoute('sites')" value="sites">Aromatic C-H Functionalization</v-tab>
          </v-tabs>
        </v-sheet>

        <v-sheet elevation="2" class="pa-10">
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
              <v-col cols="3">
                <smiles-image :smiles="reactants"></smiles-image>
              </v-col>
               <v-col cols="3" align="center" v-if="!!reactants && mode !== 'sites'" class="py-30">
                  <smiles-image :smiles="'>>'"  width="200"></smiles-image>
                </v-col>
              <v-col cols="3"  v-if="mode !== 'sites'">
                <smiles-image :smiles="product"></smiles-image>
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
                <smiles-image :smiles="reagents" width="300"></smiles-image>
              </v-col>
              <v-col cols="6" class="d-flex justify-center">
                <smiles-image :smiles="solvent" width="300"></smiles-image>

              </v-col>
            </v-row>


            <v-row align="center" justify-start>
              <v-col class="mr-5">
                <v-btn type="submit" color="success" class="mr-5">
                  {{
                    tab === 'context' ? 'Get Condition Recommendation' :
                    tab === 'forward' ? 'Get Product Prediction' :
                      tab === 'impurity' ? 'Get Impurity Prediction' :
                        tab === 'selectivity' ? 'Get Regioselectivity Prediction' :
                         tab === 'sites' ? 'Get Aromatic C-H Functionalization' :
                          'Submit'
                  }}
                </v-btn>
                <v-btn icon @click="dialog = !dialog">
                  <v-icon>mdi-cog</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-sheet>


        <v-window v-model="tab" class="elevation-2 my-6">
          <v-window-item value="context" rounded="lg">
            <ConditionRecommendation value="context" rounded="lg" :results="contextResults" :models="contextModel"
              :pending="pendingTasks" :pendingRank="pendingRank" :evaluating="evaluating" @go-to-forward="goToForward"
              :score="reactionScore" @evaluate="evaluate" />
          </v-window-item>
          <v-window-item value="forward">
            <SynthesisPrediction value="forward" rounded="lg" :results="forwardResults" :models="forwardModel"
              :pending="pendingTasks" @download-forward="downloadForwardResults" @go-to-impurities="goToImpurity" />
          </v-window-item>
          <v-window-item value="impurity">
            <ImpurityPrediction value="impurity" rounded="lg" :results="impurityResults" :pending="pendingTasks"
              :progress="impurityProgress" @download-impurity="downloadImpurityResults" />
          </v-window-item>
          <v-window-item value="selectivity">
            <Regioselectivity value="selectivity" rounded="lg" :results="selectivityResults" :pending="pendingTasks" />
          </v-window-item>
          <v-window-item value="sites">
            <SiteSelectivity value="sites" rounded="lg" :results="siteResults" :reactingAtoms="reactingAtoms"
              :pending="pendingTasks" />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>


    <v-dialog v-model="dialog" max-width="600px" class="justify-center align-center">
      <v-card class="pa-3 m-5">
        <v-card-title class="headline">
          Settings
        </v-card-title>
        <v-expand-transition>
          <v-expansion-panels v-model="openSettingsPanel">

            <v-expansion-panel>
              <v-expansion-panel-title class="text-primary">Model selections</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row class="my-6">
                  <v-col cols="12">
                    <v-select label="Condition recommendation model" density="comfortable" variant="outlined" hide-details
                      clearable v-model="contextModel"
                      :items="[{ key: 'neuralnetwork', title: 'Neural Network' }, { key: 'neuralnetworkv2', title: 'Neural Network v2 (Quantity Prediction)' }]"
                      item-text="title" item-value="key">
                    </v-select>
                  </v-col>
                  <v-col cols="12" v-if="contextModel === 'neuralnetworkv2'">
                    <v-select label="Neural Network v2 model type" density="comfortable" variant="outlined" hide-details
                      clearable v-model="contextV2ModelType"
                      :items="[{ key: 'graph', title: 'Graph' }, { key: 'fp-small', title: 'Fingerprint (small)' }]"
                      item-text="title" item-value="key"></v-select>
                  </v-col>

                  <v-col cols="12" v-if="contextModel === 'neuralnetworkv2'">
                    <v-select label="Neural Network v2 dataset version" density="comfortable" variant="outlined"
                      hide-details clearable v-model="contextV2ModelVersion" :items="['20191118']"></v-select>
                  </v-col>

                  <v-col cols="12">
                    <v-select label="Forward prediction model" v-model="forwardModel" density="comfortable" hide-details
                      clearable variant="outlined" :items="forwardModels"></v-select>
                  </v-col>

                  <v-col cols="12">
                    <v-select label="Forward model training set" v-model="forwardModelTrainingSet" density="comfortable"
                      hide-details clearable variant="outlined" :items="forwardModelTrainingSets"></v-select>
                  </v-col>

                  <v-col cols="12">
                    <v-select label="Forward model version" v-model="forwardModelVersion" density="comfortable"
                      hide-details clearable variant="outlined" :items="forwardModelVersions"></v-select>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel value="condition-settings">
              <v-expansion-panel-title class="text-primary">Condition recommender settings</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12">
                    <v-text-field class="my-6" label="Num. results" prepend-inner-icon="mdi mdi-flask"
                      density="comfortable" variant="outlined"
                      placeholder="How many condition recommendation results to return?" hide-details clearable
                      type="number" v-model="numContextResults"></v-text-field>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel value="forward-settings">
              <v-expansion-panel-title class="text-primary">Forward predictor settings</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12">
                    <v-text-field class="my-6" label="Num. results"
                      placeholder="How many forward prediction results to return?" prepend-inner-icon="mdi mdi-flask"
                      hide-details clearable density="comfortable" variant="outlined" type="number"
                      v-model="numForwardResults"></v-text-field>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel value="impurity-settings">
              <v-expansion-panel-title class="text-primary">Impurity predictor settings</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row class="mt-6">
                  <v-col cols="12">
                    <v-text-field label="Top-k from forward prediction" density="comfortable" variant="outlined"
                      hide-details clearable
                      placeholder="How many of the top forward prediction products should be included in impurity prediction?"
                      type="number" v-model="impurityTopk"></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-text-field label="Inspection threshold" placeholder="Threshold for filtering out bad reactions."
                      density="comfortable" variant="outlined" hide-details clearable type="number"
                      v-model="inspectionThreshold"></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-select label="Inspector Score Selection" placeholder="Select inspector scorer to use."
                      density="comfortable" variant="outlined" hide-details clearable v-model="inspectionModel"
                      :items="['WLN forward inspector', 'Reaxys inspector']"></v-select>
                  </v-col>

                  <v-col cols="12">
                    <v-switch label="Use atom mapping" placeholder="Whether to use atom mapping to check reaction modes."
                      v-model="impurityCheckMapping"></v-switch>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel value="selectivity-settings">
              <v-expansion-panel-title class="text-primary">Regio-selectivity predictor
                settings</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12">
                    <v-switch :label="`Do not map reagents: ${absoluteReagents}`"
                      hint="Reagents do not provide any atom to the product." v-model="absoluteReagents" true-value="yes"
                      false-value="no" color="primary">
                    </v-switch>
                  </v-col>
                </v-row>
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
import { saveAs } from 'file-saver';
import KetcherMin from "@/components/KetcherMin.vue";
import { createReaxysQuery, createReaxysUrl } from "@/common/reaxys";

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

const contextV2ModelType = ref('graph');
const contextV2ModelVersion = ref('20191118');
const forwardModel = ref('wldn5');
const forwardModelTrainingSet = ref("pistachio");
// const forwardModelVersion = ref('1');
const numContextResults = ref(10);
const numForwardResults = ref(100);
const impurityTopk = ref(3);
const inspectionThreshold = ref(0.1);
const inspectionModel = ref('Reaxys inspector');
const impurityCheckMapping = ref(true);
const absoluteReagents = ref(false);
const atomMappingModel = ref('Transformer')
const forwardResults = ref([])
const selectivityResults = ref([])
const selectivityModel = ref('GNN')
const pendingTasks = ref(0)
const reactionScore = ref(null)
const evaluating = ref(false)
const showKetcher = ref(false);
const ketcherRef = ref(null);
const currentInputSource = ref('');
const impurityResults = ref([]);
const impurityProgress = ref({
  percent: 0,
  message: ''
});
const openSettingsPanel = ref(null)

const siteResults = ref([])
const siteResultsQuery = ref('')
const siteSelectedAtoms = ref([])
const pendingRank = ref(0)
const ketcherMinRef = ref(null);

watch(tab, () => {
  switch (tab.value) {
    case 'context':
      openSettingsPanel.value = 'condition-settings'
      break
    case 'forward':
      openSettingsPanel.value = 'forward-settings'
      break
    case 'impurity':
      openSettingsPanel.value = 'impurity-settings'
      break
    case 'selectivity':
      openSettingsPanel.value = 'selectivity-settings'
      break
    default:
      openSettingsPanel.value = null;
  }
})

const constructFastFilterPostData = () => {
  return {
    reactants: reactants.value,
    products: product.value
  }
}

const evaluate = async () => {
  if (evaluating.value) {
    return;
  }
  clearEvaluation()
  pendingRank.value++;
  evaluating.value = true;
  const postData = constructFastFilterPostData();

  contextResults.value.forEach((item, index) => {
    evaluateIndex(index)
  })

  try {
    const output = await API.runCeleryTask('/api/legacy/fast-filter/', postData);
    reactionScore.value = output;
  } catch (error) {
    console.error("An error occurred during evaluation:", error);
  } finally {
    evaluating.value = false;
    pendingRank.value--
  }

};

const clearEvaluation = () => {
  reactionScore.value = null;

  for (let res of contextResults.value) {
    res.evaluation = undefined;
  }
};

const evaluateIndex = async (index) => {
  pendingRank.value++;
  contextResults.value[index].evaluating = true;

  let reagents = contextResults.value[index].reagent;
  if (contextResults.value[index].catalyst) {
    if (reagents) {
      reagents += '.';
    }
    reagents += contextResults.value[index].catalyst;
  }

  let solvent = contextResults.value[index].solvent;
  const postData = constructForwardPostData(reagents, solvent);
  try {
    const output = await API.runCeleryTask('/api/forward/controller/call-async', postData);
    for (let i = 0; i < output.length; i++) {
      const outcome = output[i];
      if (outcome.smiles === product.value) {
        contextResults.value[index].evaluation = i + 1;
        break;
      }
    }
    if (!contextResults.value[index].evaluation) {
      contextResults.value[index].evaluation = 0;
    }
    contextResults.value[index].evaluating = false;

  } catch (error) {
    console.error("An error occurred while evaluating the index:", error);
  } finally {
    pendingRank.value--;
  }
}

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
  const models = new Set();
  const types = ["forward_augmented_transformer", "forward_graph2smiles", "forward_wldn5"];

  modelStatus.value
    .filter(item => types.includes(item['name']) && item['ready'])
    .forEach(item => {
      let modelName = item['name'].replace('forward_', '');
      models.add(modelName);
    });

  return Array.from(models).sort();
});

const goToForward = (index) => {
  canonicalizeAll()
    .then(() => {
      const context = contextResults.value[index];
      let reagentsValue = '';
      if (context['reagent']) {
        reagentsValue += context['reagent'];
      }
      if (context['catalyst']) {
        reagentsValue += '.' + context['catalyst'];
      }
      reagents.value = reagentsValue;
      if (context['solvent']) {
        solvent.value = context['solvent'];
      }
      changeMode('forward');
      tab.value = 'forward';
      forwardPredict();
    });
};


const goToImpurity = (index) => {
  canonicalizeAll()
    .then(() => {
      product.value = index;
      console.log(index)
      changeMode('impurity');
      tab.value = 'impurity';
      impurityPredict();
    });
};


const forwardModelTrainingSets = computed(() => {
  const sets = new Set();
  let modelNameWithPrefix = forwardModel.value.replace('', 'forward_');
  modelStatus.value
    .filter(item => item.name.startsWith(modelNameWithPrefix) && item.ready)
    .forEach(item => {
      if (Array.isArray(item.available_model_names)) {
        item.available_model_names.forEach(modelName => {
          sets.add(modelName);
        });
      }
    });

  return Array.from(sets).sort();
});

watch(forwardModel, () => {
  if (forwardModelTrainingSets.value.length > 0) {
    forwardModelTrainingSet.value = forwardModelTrainingSets.value[0];
  } else {
    forwardModelTrainingSet.value = null;
  }
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

const clearSelectivity = () => {
  selectivityResults.value = []
}

const constructSelectivityPostData = () => {
  const data = reactive({
    reactants: reactants.value,
    product: product.value,
    mapper: atomMappingModel.value,
    no_map_reagents: absoluteReagents.value,
    mode: selectivityModel.value
  })

  if (reagents.value) {
    data.reagents = reagents.value
  } else {
    data.reagents = ""
  }

  if (solvent.value) {
    data.solvent = solvent.value
  } else {
    data.solvent = ""
  }

  return data
}

const selectivityPredict = () => {
  pendingTasks.value++

  const postData = constructSelectivityPostData()

  return API.runCeleryTask('/api/legacy/general-selectivity', postData)
    .then(output => {
      if (typeof output === 'string') {
        alert('Error running selectivity prediction: ' + output)
      } else {
        selectivityResults.value = output
        console.log(selectivityResults.value)
      }
    })
    .finally(() => {
      pendingTasks.value--
    })
}

const clearImpurity = () => {
  impurityResults.value = [];
  impurityProgress.value = {
    percent: 0,
    message: ''
  };
}

const impurityPredict = () => {
  pendingTasks.value++;
  impurityResults.value = [];

  let postData = constructImpurityPostData();

  let complete = (output) => {
    impurityProgress.value.percent = 1.0;
    impurityProgress.value.message = 'Prediction complete!';
    impurityResults.value = output['result']['predict_expand'];
    console.log(impurityResults.value)
  };

  let progress = (json) => {
    impurityProgress.value.percent = json['percent'];
    impurityProgress.value.message = json['message'];
  };

  let failed = (error) => {
    console.error('Error encountered during impurity prediction:', error);
    impurityProgress.value.percent = 0.0;
    impurityProgress.value.message = 'Impurity prediction failed!';
  };

  API.runCeleryTask('/api/impurity-predictor/call-async', postData, progress)
    .then(output => {
      complete(output);
    })
    .catch(error => {
      failed(error);
    })
    .finally(() => {
      pendingTasks.value--;
    });
}


const constructImpurityPostData = () => {
  let data = {
    rct_smi: reactants.value,
    predictor_model_name: forwardModelTrainingSet.value,
    predictor_backend: forwardModel.value,
    topn_outcome: impurityTopk.value,
    check_mapping: impurityCheckMapping.value,
    insp_threshold: inspectionThreshold.value,
    inspector: inspectionModel.value,
    atom_map_backend: "indigo",
  };

  if (product.value) {
    data.prd_smi = product.value;
  }

  if (reagents.value) {
    data.rea_smi = reagents.value;
  }

  if (solvent.value) {
    data.sol_smi = solvent.value;
  }

  return data;
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
  API.get('/api/admin/get-backend-status')
    .then(json => {
      modelStatus.value = json['modules'];
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
    const output = await API.runCeleryTask('/api/forward/controller/call-async', postData);
    forwardResults.value = output.result[0];
    console.log(output.result[0])
  } catch (error) {
    console.error('Error in forward prediction:', error);
  } finally {
    pendingTasks.value--;
  }
};

const constructForwardPostData = (reagents, solvent) => {
  let data = reactive({
    smiles: [reactants.value],
    backend: forwardModel.value,
    model_name: forwardModelTrainingSet.value,
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
  return API.post('/api/rdkit/canonicalize', { smiles: smiles })
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
  API.runCeleryTask('/api/legacy/context/', postData)
    .then(output => {
      console.log(output)
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
    with_smiles: false,
    return_scores: false,
    num_results: numContextResults.value
  }
}

const postprocessContextV2 = (output) => {
  if (!output.length) {
    alert('Could not generate condition recommendations for this reaction. Please try a different model.');
  }

  const processedResults = output.map((val) => {
    val.temperature -= 273.15;
    val.reagent = Object.keys(val.reagents).join('.');
    val.catalyst = '';
    val.solvent = '';
    return val;
  });

  contextResults.value = processedResults;
};

const contextV2Predict = () => {
  pendingTasks.value++;
  contextResults.value = [];
  evaluating.value = false;
  const postData = constructContextV2PostData();
  API.runCeleryTask('/api/legacy/context-v2/', postData)
    .then((output) => {
      postprocessContextV2(output);
      console.log(contextResults.value)
    })
    .finally(() => {
      pendingTasks.value--;
    });
};

const constructContextV2PostData = () => {
  const reagents = [];
  return {
    reactants: reactants.value,
    products: product.value,
    reagents: reagents,
    model: contextV2ModelType.value,
    num_results: numContextResults.value,
  };
};

const downloadImpurityResults = () => {
  if (!impurityResults.value.length) {
    alert('There are no impurity predictor results to download!');
    return;
  }
  let downloadData = 'No.,SMILES,Mechanism,InspectorScore,SimilarityScore,MolWt\n';
  impurityResults.value.forEach((res) => {
    downloadData += `${res.no},${res.prd_smiles},${res.modes_name},${res.avg_insp_score},${res.similarity_to_major},${res.prd_mw}\n`;
  });
  const blob = new Blob([downloadData], { type: 'data:text/csv;charset=utf-8' });
  saveAs(blob, 'askcos_impurity_export.csv');
};

const downloadForwardResults = () => {
  if (!forwardResults.value.length) {
    alert('There are no forward predictor results to download!');
    return;
  }
  let downloadData = 'Rank,SMILES,Probability,Score,MolWt\n';
  forwardResults.value.forEach((res) => {
    downloadData += `${res.rank},${res.smiles},${res.prob},${res.score},${res.mol_wt}\n`;
  });
  const blob = new Blob([downloadData], { type: 'data:text/csv;charset=utf-8' });
  saveAs(blob, 'askcos_forward_export.csv');
};

const clearSites = () => {
  siteResults.value = [];
  siteSelectedAtoms.value = [];
};

const sitesPredict = () => {
  pendingTasks.value++
  const postData = constructSiteSelectivityPostData()
  API.runCeleryTask('/api/v2/selectivity/', postData)
    .then(output => {
      siteResults.value = output
      ketcherMinRef.value.setSmiles(reactants.value);
      console.log(siteResults.value)
    })
    .finally(() => {
      pendingTasks.value--
    })
}

const constructSiteSelectivityPostData = () => {
  return {
    smiles: reactants.value
  }
}

const getMolImgUrl = (smiles, highlight, reactingAtoms) => {
  let url = `/api/v2/draw/?smiles=${encodeURIComponent(smiles)}`;
  if (highlight !== undefined) {
    url += '&highlight=true';
  }
  if (reactingAtoms !== undefined) {
    for (const ra of reactingAtoms) {
      url += `&reacting_atoms=${encodeURIComponent(ra)}`;
    }
  }
  return url;
};


</script>




