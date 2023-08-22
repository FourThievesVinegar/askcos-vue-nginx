<template>
  <div>
    <ketcher-modal ref="childComponentRef" v-model="showKetcher" :smiles="smiles" @input="showKetcher=false"/>
    <v-row class="mt-6">
      <v-col>
        <v-text-field v-model="smiles" class="centered-input" density="compact" variant="outlined"
          label="Enter a molecule or reaction SMILES to explore available tasks" prepend-inner-icon="mdi mdi-flask"
          placeholder="SMILES" hide-details clearable>
          <template v-slot:append>
            <v-btn-group color="primary" rounded divided>
              <v-btn prepend-icon="mdi mdi-pencil" @click="() => {showKetcher = true; childComponentRef.smilesToKetcher();}">Draw</v-btn>
              <v-btn prepend-icon="mdi mdi-web">Canonicalize</v-btn>
            </v-btn-group>
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
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Interactive Path Planner
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Tree Builder
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Predict Forward Synthesis
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Predict Impurities
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Predict Aromatic Site Selectivity
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary">Run
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
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title class="text-h5 text-center text-wrap bg-grey-lighten-2">
              Buyables
            </v-card-title>
            <v-card-actions class="justify-center"><v-btn prepend-icon="mdi mdi-play" variant="tonal" color="primary">Run
                Task</v-btn></v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<style scoped>
.centered-input :deep(input) {
  text-align: center;
}

.centered-input .v-label {
  text-align: center;
  left: 50% !important;
  transform: translateX(-50%);
}
</style>

<script>
import { ref, computed, watch } from "vue";
import KetcherModal from "@/components/KetcherModal";
import CopyTooltip from "@/components/CopyTooltip";
import SmilesImage from "@/components/SmilesImage";

import { API } from "@/common/api";
import { TB_PRESETS } from "@/common/tb-presets";
import { num2str } from "@/common/utils";

export default {
  name: "LaunchPad",
  components: {
    KetcherModal,
    CopyTooltip,
    SmilesImage,
  },
  setup() {
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
    const childComponentRef = ref(null);

    const context = computed(() =>
      JSON.parse(document.getElementById("django-context").textContent)
    );

    const type = computed(() => {
      if (smiles.value.includes(">")) {
        return "rxn";
      } else {
        return "mol";
      }
    });

    const canonicalize = (smiles, field) => {
      API.post("/api/v2/rdkit/smiles/canonicalize/", { smiles: smiles })
        .then((json) => {
          console.log(json);
          field.value = json.smiles;
        })
        .catch((error) => {
          console.log("Could not canonicalize: " + error);
        });
    };

    const getScscore = (smiles) => {
      scscore.value = "evaluating";
      const url = "/api/v2/scscore/";
      const body = {
        smiles: smiles,
      };
      API.post(url, body)
        .then((json) => {
          scscore.value = num2str(json.score);
        })
        .catch((error) => {
          console.error("Could not evaluate SCScore:", error);
        });
    };

    const getReactionScore = (smiles) => {
      reactionScore.value = "evaluating";
      const url = "/api/v2/fast-filter/";
      const split = smiles.split(">");
      const body = {
        reactants: split[0],
        products: split[split.length - 1],
      };
      API.runCeleryTask(url, body)
        .then((output) => {
          reactionScore.value = num2str(output);
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
      const url = "/api/v2/reaction-classification/";
      const data = smiles.split(">>");
      const body = {
        reactants: data[0],
        products: data[1],
      };
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

    return {
      smiles,
      validSmiles,
      scscore,
      reactionScore,
      mappedSmiles,
      mapper,
      mapperOptions,
      showMappedSmiles,
      classificationResults,
      showClassificationResults,
      classificationStatus,
      tbStatus,
      tbPreset,
      tbPresetOptions,
      tbDesc,
      context,
      type,
      canonicalize,
      getScscore,
      getReactionScore,
      getMappedSmiles,
      getClassification,
      tbPresetToArgs,
      sendTreeBuilderJob,
      showKetcher,
      childComponentRef,
    };
  },
};
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
