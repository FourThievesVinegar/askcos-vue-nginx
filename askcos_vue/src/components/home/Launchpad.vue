<template>
  <div>
    <ketcher-modal ref="ketcherRef" v-model="showKetcher" :smiles="smiles" @input="showKetcher = false"
      @update:smiles="(ketcherSmiles) => smiles = ketcherSmiles" />
    <v-row class="my-6 justify-center">
      <v-col cols="12" md="10">
        <v-text-field v-model="smiles" class="centered-input" variant="outlined"
          label="Enter a molecule or reaction SMILES to explore available tasks" prepend-inner-icon="mdi mdi-flask"
          placeholder="SMILES" hide-details clearable>
          <template v-slot:append-inner>
            <v-btn variant="tonal" prepend-icon="mdi mdi-pencil"
              @click="() => { showKetcher = true; ketcherRef.smilesToKetcher(); }">Draw</v-btn>
          </template>
          <template v-slot:append>
            <v-btn variant="flat" color="primary" prepend-icon="mdi mdi-web" size="large"
              @click="canonicalize()">Canonicalize</v-btn>
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
              <v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary" v-if="!scscore"
                @click="getScscore(smiles)">Run Task</v-btn>
              <template v-if="scscore === 'evaluating'">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </template>
              <div v-else>{{ scscore }}</div>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Interactive Path Planner
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                :href="`/network?tab=IPP&?target=${encodeURIComponent(smiles)}`" target="_blank">Run
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
                  <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon="mdi mdi-menu-down" />
                      </template>
                      <v-card width="auto" min-width="250px">
                        <v-text-field v-model="tb.taskName" label="Job name/description" variant="outlined" hide-details
                          class="pa-3" density="compact"></v-text-field>
                        <v-divider class="ma-2" :thickness="2"></v-divider>
                        <p class="text-subtitle-2 pl-3">Quick Settings</p>
                        <v-list density="compact">
                          <v-list-item v-for="(value, name) in tb.modes" :key="name">
                            <v-list-item-title>
                              <v-icon v-if="isTbQuickSettingsMode(name)" icon="mdi-check"></v-icon>
                              {{ value.label }}
                              <i class="fas fa-question-circle" :title="value.info"></i>
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                        <v-divider class="ma-2" :thickness="2"></v-divider>
                        <v-btn variant="plain">Advanced...</v-btn>
                      </v-card>
                    </v-menu>
                  </v-btn-group> 
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
                :href="'/forward?tab=forward&reactants=' + encodeURIComponent(smiles)">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Predict Impurities
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                :href="'/forward?tab=impurity&reactants=' + encodeURIComponent(smiles)">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Predict Aromatic Site Selectivity
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                :href="'/forward?tab=sites&reactants=' + encodeURIComponent(smiles)">Run
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
                :href="`/buyables/?q=${encodeURIComponent(smiles)}`">Run
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
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary"
                v-if="!reactionScore" @click="getReactionScore(smiles)">Run
                Task</v-btn>
              <template v-if="reactionScore === 'evaluating'">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </template>
              <div v-else>{{ reactionScore }}</div>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols=" 12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Generate Atom Mapping
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary">Run
                Task</v-btn></v-card-actions>
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
              <v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary" v-if="classificationStatus === 'not started'" @click="getClassification(smiles)">Evaluate</v-btn>
              <template v-if="classificationStatus === 'evaluating'">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </template>
                 <v-btn variant="tonal" color="primary"  v-if="classificationResults.length" @click="showClassificationResults = !showClassificationResults"> {{ showClassificationResults ? 'Hide' : 'Show' }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="!!classificationResults.length" v-show="showClassificationResults" class="my-3 pa-3">
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

    <!-- <template v-if="validSmiles && type === 'rxn'">
      <div class="card-deck my-5">
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <h4 class="card-title">Fast Filter Score</h4>
            <template v-if="reactionScore === undefined">
              <b-button variant="primary" @click="getReactionScore(smiles)">Evaluate</b-button>
            </template>
            <template v-else-if="reactionScore === 'evaluating'">
              <div class="spinner-border text-secondary" role="status"></div>
            </template>
            <template v-else>
              <p class="card-text lead">{{ reactionScore }}</p>
            </template>
          </div>
        </div>
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <h4 class="card-title">Generate Atom Mapping</h4>
            <template v-if="mappedSmiles === 'evaluating'">
              <div class="spinner-border text-secondary" role="status"></div>
            </template>
            <template v-else>
              <b-button-group>
                <template v-if="mappedSmiles === undefined">
                  <b-button variant="primary" @click="getMappedSmiles(smiles)">Evaluate</b-button>
                </template>
                <template v-else>
                  <b-button variant="primary" @click="showMappedSmiles = !showMappedSmiles">
                    {{ showMappedSmiles ? 'Hide' : 'Show' }}
                  </b-button>
                </template>
                <b-dropdown variant="primary" right>
                  <template #button-content>
                    <i class="fas fa-cog"></i>
                  </template>
                  <b-dropdown-header>Model</b-dropdown-header>
                  <div class="b-dropdown-form text-nowrap">
                    <div v-for="opt in mapperOptions" :key="opt">
                      <b-form-radio v-model="mapper" :value="opt">
                        {{ opt }}
                      </b-form-radio>
                    </div>
                  </div>
                  <b-dropdown-divider></b-dropdown-divider>
                  <div class="b-dropdown-form text-nowrap">
                    <b-button
                      block
                      variant="outline-secondary"
                      @click="getMappedSmiles(smiles)"
                      :disabled="mappedSmiles === undefined"
                    >
                      Re-evaluate
                    </b-button>
                  </div>
                </b-dropdown>
              </b-button-group>
            </template>
          </div>
        </div>
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <a class="stretched-link text-decoration-none"
               :href="`/synth_interactive/?mode=forward&rxnsmiles=${encodeURIComponent(smiles)}`" target="_blank">
              <h4 class="m-0">Predict Forward Synthesis</h4>
            </a>
          </div>
        </div>
      </div>

      <div class="card" v-if="mappedSmiles !== undefined && mappedSmiles !== 'evaluating'" v-show="showMappedSmiles">
        <div class="card-body">
          <template v-if="!!mappedSmiles">
            <div class="row text-center mb-5">
              <div class="col-12">
                <copy-tooltip :data="mappedSmiles">
                  <i class="far fa-copy"></i>
                  <b>Smiles: </b>
                  <span class="smiles">{{ mappedSmiles }}</span>
                </copy-tooltip>
              </div>
            </div>
            <div class="row text-center my-5">
              <div class="col-12">
                <smiles-image
                  :smiles="mappedSmiles"
                  draw-map
                  highlight
                ></smiles-image>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="row text-center my-3">
              <div class="col-12">
                <span class="lead">Unable to generate atom mapping for this reaction.</span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="card-deck my-5">
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <a class="stretched-link text-decoration-none"
               :href="`/synth_interactive/?mode=context&rxnsmiles=${encodeURIComponent(smiles)}`" target="_blank">
              <h4 class="m-0">Predict Conditions</h4>
            </a>
          </div>
        </div>
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <a class="stretched-link text-decoration-none"
               :href="`/synth_interactive/?mode=impurity&rxnsmiles=${encodeURIComponent(smiles)}`" target="_blank">
              <h4 class="m-0">Predict Impurities</h4>
            </a>
          </div>
        </div>
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <a class="stretched-link text-decoration-none"
               :href="`/synth_interactive/?mode=selectivity&rxnsmiles=${encodeURIComponent(smiles)}`" target="_blank">
              <h4 class="m-0">Predict Regioselectivity</h4>
            </a>
          </div>
        </div>
      </div>

      <div class="card-deck my-5">
        <div class="card bg-light invisible"></div>
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <h4 class="card-title">
              Classify Reaction
              <a href="https://doi.org/10.26434/chemrxiv.9897365.v4" target="_blank">
                <i title="Predict reaction name with a bidirectional attention-based transformer model."
                   class="fas fa-info-circle" style="cursor: pointer"></i>
              </a>
            </h4>
            <template v-if="classificationStatus === 'evaluating'">
              <div class="spinner-border text-secondary" role="status"></div>
            </template>
            <template v-else>
              <template v-if="!classificationResults.length">
                <b-button variant="primary" @click="getClassification(smiles)">Evaluate</b-button>
              </template>
              <template v-else>
                <b-button variant="primary" @click="showClassificationResults = !showClassificationResults">
                  {{ showClassificationResults ? 'Hide' : 'Show' }}
                </b-button>
              </template>
            </template>
          </div>
        </div>
        <div class="card bg-light invisible"></div>
      </div>

      <div class="card" v-if="!!classificationResults.length && classificationStatus !== 'evaluating'"
           v-show="showClassificationResults">
        <div class="card-body">
          <template v-if="classificationStatus === 'ok'">
            <table class="table table-hover my-3">
              <thead>
              <tr>
                <th class="text-center">Rank</th>
                <th class="text-center">Reaction Number</th>
                <th class="text-center">Reaction Name (Lvl 1)</th>
                <th class="text-center">Reaction Name (Lvl 2)</th>
                <th class="text-center">Reaction Name (Lvl 3)</th>
                <th class="text-center">Prediction Certainty</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="res in classificationResults" :key="res.rank">
                <td class="text-center">{{ res.rank }}</td>
                <td class="text-center">{{ res.reaction_num }}</td>
                <td class="text-center">{{ res.reaction_superclassname }}</td>
                <td class="text-center">{{ res.reaction_classname }}</td>
                <td class="text-center">{{ res.reaction_name }}</td>
                <td class="text-center">{{ res.prediction_certainty }}</td>
              </tr>
              </tbody>
            </table>
          </template>
          <template v-else>
            <div class="row text-center my-3">
              <div class="col-12">
                <span class="lead">Unable to classify this reaction.</span>
              </div>
            </div>
          </template> -->


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
const mapper = ref("WLN atom mapper");
const mapperOptions = ["WLN atom mapper", "Transformer"];
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
const type = computed(() => {
  if (smiles.value.includes(">")) {
    return "rxn";
  } else {
    return "mol";
  }
});

const headers = [
  { key: 'rank', title: 'Rank', align: 'center' },
  { key: 'reaction_num', title: 'Reaction Number', align: 'center' },
  { key: 'reaction_superclassname', title: 'Reaction Name (Lvl 1)', align: 'center' },
  { key: 'reaction_classname', title: 'Reaction Name (Lvl 2)', align: 'center' },
  { key: 'reaction_name', title: 'Reaction Name (Lvl 3)', align: 'center' },
  { key: 'prediction_certainty', title: 'Prediction Certainty', align: 'center' },
];

const canonicalize = () => {
  API.post("/api/rdkit/canonicalize/", { smiles: smiles.value })
    .then((json) => {
      console.log(json);
      smiles.value = json.smiles;
    })
    .catch((error) => {
      console.log("Could not canonicalize: " + error);
    });
};

const getScscore = (smiles) => {
  scscore.value = "evaluating";
  const url = "/api/scscore/call-async";
  const body = {
    smiles: smiles,
  };
  API.runCeleryTask(url, body)
    .then((json) => {
      scscore.value = num2str(json.result);
      console.log(json.result)
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
      console.log(output)
      reactionScore.value = num2str(output.result.score);
    })
    .catch((error) => {
      console.error("Could not evaluate reaction score:", error);
    });
};

const getMappedSmiles = (smiles) => {
  mappedSmiles.value = "evaluating";
  showMappedSmiles.value = true;
  const url = "/api/v2/atom-mapper/";
  const body = {
    rxnsmiles: smiles,
    mapper: mapper.value,
  };
  API.runCeleryTask(url, body)
    .then((output) => {
      mappedSmiles.value = output;
    })
    .catch((error) => {
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
  const url = "/api/v2/tree-builder/";
  const body = {
    description: tbDesc.value ? tbDesc.value : smiles,
    smiles: smiles,
    template_set: "reaxys",
    template_prioritizer_version: 1,
    max_trees: 500,
    store_results: true,
    json_format: "nodelink",
  };
  Object.assign(body, tbPresetToArgs());
  API.post(url, body)
    .then((json) => {
      tbStatus.value = json.task_id;
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.launchcard-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 100px;
}
</style>
