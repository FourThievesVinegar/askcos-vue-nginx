<template>
  <div>
    <ketcher-modal ref="ketcherRef" v-model="showKetcher" :smiles="smiles" @input="showKetcher = false"
      @update:smiles="(ketcherSmiles) => smiles = ketcherSmiles" />
    <v-row class="my-6 justify-center">
      <v-col cols="12" md="10">
        <v-text-field v-model="smiles" class="centered-input" variant="outlined" label="Type here or draw structure..."
          prepend-inner-icon="mdi mdi-flask" placeholder="SMILES" hide-details clearable rounded="pill">
          <template v-slot:append-inner>
            <v-btn variant="tonal" prepend-icon="mdi mdi-pencil"
              @click="() => { showKetcher = true; ketcherRef.smilesToKetcher(); }" rounded="pill">Draw</v-btn>
          </template>
          <template v-slot:append>
            <v-btn variant="flat" color="primary" prepend-icon="mdi mdi-web" size="large" @click="canonicalize()"
              rounded="pill">Canonicalize</v-btn>
          </template>
        </v-text-field>
      </v-col>
    </v-row>

    <v-row v-if="!!smiles" class="justify-center">
      <v-col><smiles-image :smiles="smiles" allow-copy @load="validSmiles = true"
          @error="validSmiles = false"></smiles-image></v-col>
    </v-row>

    <template v-if="validSmiles && type === 'mol'">
      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              SCScore
            </v-card-title>
            <v-card-actions class="justify-center">
              <template v-if="scscore === undefined">
                <v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                  @click="getScscore(smiles)">Evaluate</v-btn>
              </template>
              <template v-else-if="scscore === 'evaluating'">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </template>
              <template v-else>
                <v-chip color="primary">
                  <p class="text-body-1">{{ scscore }}</p>
                </v-chip>
              </template>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Interactive Path Planner
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                :href="`/network?tab=IPP&target=${encodeURIComponent(smiles)}`" target="_blank">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Tree Builder
            </v-card-title>
            <v-card-actions class="justify-center">
              <template v-if="tbStatus === undefined">
                <v-btn-group density="compact" color="primary">
                  <v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                    @click="sendTreeBuilderJob(smiles)">Run
                    Task</v-btn>
                  <v-menu location="bottom" id="tb-submit-settings" :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <v-btn v-bind="props" icon="mdi mdi-menu-down" variant="tonal" color="primary" />
                    </template>
                    <v-card width="auto" min-width="250px">
                      <v-text-field v-model="tbDesc" label="Job name/description" variant="outlined" hide-details
                        class="pa-3" density="compact"></v-text-field>
                      <v-divider class="ma-2" :thickness="2"></v-divider>
                      <p class="text-subtitle-2 pl-3">Quick Settings</p>
                      <v-list density="compact">
                        <v-list-item v-for="(value, name) in tbPresetOptions" :key="name">
                          <v-list-item-title>
                            <v-checkbox v-model="tbPreset" :value="name" hide-details>
                              <template v-slot:label>
                                {{ value.label }}
                              </template>
                            </v-checkbox>
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-card>
                  </v-menu>
                </v-btn-group>
              </template>
              <template v-else-if="tbStatus === 'pending'">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </template>
              <template v-else-if="tbStatus === 'error'">
                <v-chip variant="tonal" color="red" class="text-body-1">Please login to submit</v-chip>
              </template>
              <template v-else>
                <v-chip variant="tonal" class="text-body-1"><a href="/results" target="_blank">Go to My
                    Results</a></v-chip>
              </template>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Predict Forward Synthesis
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                :href="`/forward?tab=forward&reactants=${encodeURIComponent(smiles)}`" target="_blank">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Predict Impurities
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                :href="`/forward?tab=impurity&reactants=${encodeURIComponent(smiles)}`" target="_blank">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Predict Aromatic Site Selectivity
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                :href="`/forward?tab=sites&reactants=${encodeURIComponent(smiles)}`" target="_blank">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Solvent Screen
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                :href="`/solprop?tab=solscreen&solute=${encodeURIComponent(smiles)}`" target="_blank">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Buyables
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                :href="`/buyables?q=${encodeURIComponent(smiles)}`" target="_blank">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <template v-if="validSmiles && type === 'rxn'">
      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Fast Filter Score
            </v-card-title>
            <v-card-actions class="justify-center">
              <template v-if="reactionScore === undefined">
                <v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                  @click="getReactionScore(smiles)">Evaluate</v-btn>
              </template>
              <template v-else-if="reactionScore === 'evaluating'">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </template>
              <template v-else>
                <v-chip color="primary">
                  <p class="text-body-1">{{ reactionScore }}</p>
                </v-chip>
              </template>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols=" 12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Generate Atom Mapping
            </v-card-title>
            <v-card-actions class="justify-center">
              <template v-if="mappedSmiles === undefined || !!mappedSmiles.length > 0 || mappedSmiles === 'error'">
                <v-btn-group density="compact" color="primary">
                  <v-btn v-if="mappedSmiles === undefined" prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                    @click="getMappedSmiles(smiles)">Evaluate</v-btn>
                  <v-btn v-if="!!mappedSmiles" prepend-icon="mdi mdi-play" variant="tonal"
                    @click="showMappedSmiles = !showMappedSmiles"> {{ showMappedSmiles ? 'Hide' :
                      'Show' }}</v-btn>
                  <v-menu location="bottom" id="mapper-settings" :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <v-btn v-bind="props" icon="mdi mdi-menu-down" variant="tonal" color="primary" />
                    </template>
                    <v-card width="auto" min-width="250px">
                      <v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary" @click="getMappedSmiles(smiles)"
                        class="pa-3 justify-center" :disabled="mappedSmiles === undefined">Re-evaluate</v-btn>
                      <v-divider class="ma-2" :thickness="2"></v-divider>
                      <p class="text-subtitle-2 pl-3">Quick Settings</p>
                      <v-list density="compact">
                        <v-list-item v-for="name in mapperOptions" :key="name">
                          <v-list-item-title>
                            <v-checkbox v-model="mapper" :value="name" hide-details>
                              <template v-slot:label>
                                {{ name }}
                              </template>
                            </v-checkbox>
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-card>
                  </v-menu>
                </v-btn-group>
              </template>
              <template v-else-if="mappedSmiles === 'evaluating'">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </template>
              <template v-else-if="mappedSmiles === 'error'">
                <v-chip variant="tonal" color="red" class="text-body-1">Submission Error</v-chip>
              </template>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols=" 12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Predict Forward Synthesis
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                :href="'/forward?tab=forward&rxnsmiles=' + encodeURIComponent(smiles)">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="!!mappedSmiles" v-show="!!showMappedSmiles" class="my-4 pa-4">
        <v-col cols="12" class="justify-center">
          <smiles-image :smiles="mappedSmiles" draw-map highlight allow-copy></smiles-image>
          <p class="text-body-1 text-center">SMILES: {{ mappedSmiles }}</p>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Predict Conditions
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                :href="'/forward?tab=context&rxnsmiles=' + encodeURIComponent(smiles)">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
        <v-col cols=" 12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Predict Impurities
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                :href="'/forward?tab=impurity&rxnsmiles=' + encodeURIComponent(smiles)">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
        <v-col cols=" 12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Predict Regioselectivity
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                :href="'/forward?tab=selectivity&rxnsmiles=' + encodeURIComponent(smiles)">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="justify-center">
        <v-col cols=" 12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Classify Reaction
              <a href="https://doi.org/10.26434/chemrxiv.9897365.v4" target="_blank">
                <v-icon icon="mdi-information" size="x-small"></v-icon></a>
            </v-card-title>
            <v-card-actions class="justify-center">
              <v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                v-if="classificationStatus === 'not started'" @click="getClassification(smiles)">Evaluate</v-btn>
              <template v-if="classificationStatus === 'evaluating'">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </template>
              <v-btn variant="tonal" color="primary" v-if="classificationResults.length"
                @click="showClassificationResults = !showClassificationResults"> {{ showClassificationResults ? 'Hide' :
                  'Show' }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="!!classificationResults.length" v-show="showClassificationResults" class="my-4 pa-4">
        <v-col cols="12">
          <v-data-table :headers="headers" :items="classificationResults" :items-per-page="100">
            <template #bottom></template>
          </v-data-table>
        </v-col>
      </v-row>
    </template>

    <template v-if="smiles && !validSmiles">
      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader class="mx-auto border" elevation="2" min-height="100px" type="paragraph">
          </v-skeleton-loader>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader class="mx-auto border" elevation="2" min-height="100px" type="paragraph">
          </v-skeleton-loader>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader class="mx-auto border" elevation="2" min-height="100px" type="paragraph">
          </v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader class="mx-auto border" elevation="2" min-height="100px" type="paragraph">
          </v-skeleton-loader>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader class="mx-auto border" elevation="2" min-height="100px" type="paragraph">
          </v-skeleton-loader>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader class="mx-auto border" elevation="2" min-height="100px" type="paragraph">
          </v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader class="mx-auto border" elevation="2" min-height="100px" type="paragraph">
          </v-skeleton-loader>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader class="mx-auto border" elevation="2" min-height="100px" type="paragraph">
          </v-skeleton-loader>
        </v-col>
      </v-row>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import KetcherModal from "@/components/KetcherModal";
import CopyTooltip from "@/components/CopyTooltip";
import SmilesImage from "@/components/SmilesImage";

import { API } from "@/common/api";
import { TB_PRESETS } from "@/common/tb-presets";
import { num2str } from "@/common/utils";



const smiles = ref("");
const validSmiles = ref(false);
const scscore = ref(undefined);
const reactionScore = ref(undefined);
const mappedSmiles = ref(undefined);
const mapper = ref("indigo",);
const mapperOptions = ["indigo", "wln", "rxnmapper"];
const showMappedSmiles = ref(true);
const classificationResults = ref([]);
const showClassificationResults = ref(true);
const classificationStatus = ref("not started");
const tbStatus = ref(undefined);
const tbPreset = ref("normal");
const tbPresetOptions = ref(TB_PRESETS);
const tbDesc = ref("");
const showKetcher = ref(false);
const ketcherRef = ref(null);
const headers = [
  { key: 'rank', title: 'Rank', align: 'center' },
  { key: 'reaction_num', title: 'Reaction Number', align: 'center' },
  { key: 'reaction_superclassname', title: 'Reaction Name (Lvl 1)', align: 'center' },
  { key: 'reaction_classname', title: 'Reaction Name (Lvl 2)', align: 'center' },
  { key: 'reaction_name', title: 'Reaction Name (Lvl 3)', align: 'center' },
  { key: 'prediction_certainty', title: 'Prediction Certainty', align: 'center' },
];

const type = computed(() => {
  if (smiles.value.includes(">")) {
    return "rxn";
  } else {
    return "mol";
  }
});

const canonicalize = () => {
  API.post("/api/rdkit/canonicalize/", { smiles: smiles.value })
    .then((json) => {
      smiles.value = json.smiles;
    })
    .catch((error) => {
      console.error("Could not canonicalize: " + error);
    });
};

const getScscore = (smiles) => {
  scscore.value = "evaluating";
  const url = "/api/scscore/call-sync";
  const body = {
    smiles: smiles,
  };
  API.post(url, body)
    .then((json) => {
      scscore.value = num2str(json.result);
    })
    .catch((error) => {
      console.error("Could not evaluate SCScore:", error);
    });
};

const getReactionScore = (smiles) => {
  reactionScore.value = "evaluating";
  const url = "/api/fast-filter/call-async";
  const split = smiles.split(">");
  const body = {
    "smiles":
      [split[0], split[split.length - 1]]
  };
  API.runCeleryTask(url, body)
    .then((output) => {
      reactionScore.value = num2str(output.result.score);
    })
    .catch((error) => {
      console.error("Could not evaluate reaction score:", error);
    });
};

const getMappedSmiles = (smiles) => {
  mappedSmiles.value = "evaluating";
  showMappedSmiles.value = true;
  const url = "/api/atom-map/controller/call-async";
  const body = {
    "backend": mapper.value,
    "smiles": [
      smiles
    ]
  };
  API.runCeleryTask(url, body)
    .then((output) => {
      mappedSmiles.value = output.result[0];
    })
    .catch((error) => {
      mappedSmiles.value = "error";
      console.error("Could not generate atom mapping:", error);
    });
};

const getClassification = (smiles) => {
  classificationStatus.value = "evaluating";
  showClassificationResults.value = true;
  classificationResults.value = [];
  const url = "/api/reaction-classification/call-async";
  // const data = smiles.split(">>");
  const body = {
    "smiles": [
      smiles
    ],
    "num_results": 10
  }
  API.runCeleryTask(url, body)
    .then((output) => {
      classificationResults.value = output["result"];
      if (output["status"] === "FAILED") {
        classificationStatus.value = "failed";
      } else {
        classificationStatus.value = "ok";
      }
    })
    .catch((error) => {
      console.error("Could not generate reaction classification:", error);
    });
};


const tbPresetToArgs = () => {
  // Convert tree builder preset options to API arguments
  const preset = tbPresetOptions.value[tbPreset.value].settings;
  const mapping = {
    expansionTime: "expansion_time",
    maxDepth: "max_depth",
    maxBranching: "max_branching",
    numTemplates: "template_count",
    maxCumProb: "max_cum_prob",
    minPlausibility: "filter_threshold",
    chemicalPopularityLogic: "chemical_popularity_logic",
    chemicalPopularityReactants: "min_chempop_reactants",
    chemicalPopularityProducts: "min_chempop_products",
    returnFirst: "return_first",
  };
  const args = {};
  for (const [key, val] of Object.entries(preset)) {
    args[mapping[key]] = val;
  }
  return args;
};

const sendTreeBuilderJob = (smiles) => {
  tbStatus.value = "pending";
  const url = "/api/tree-search/mcts/call-async";
  const body = {
    description: tbDesc.value ? tbDesc.value : smiles,
    smiles: smiles,
  };
  // Object.assign(body, tbPresetToArgs());
  API.runCeleryTask(url, body)
    .then((json) => {
      tbStatus.value = json.result
    })
    .catch((error) => {
      tbStatus.value = "error";
      console.error("Failed to submit tree builder job:", error);
    });
};

watch(smiles, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    validSmiles.value = false;
    scscore.value = undefined;
    reactionScore.value = undefined;
    mappedSmiles.value = undefined;
    tbStatus.value = undefined;
    classificationStatus.value = "not started";
    classificationResults.value = [];
  }
});
</script>