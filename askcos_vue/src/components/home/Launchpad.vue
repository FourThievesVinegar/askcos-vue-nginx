<template>
  <div class="my-5">
    <!-- drawing box -->
    <!-- <ketcher-modal v-model="smiles"></ketcher-modal> -->
    <v-text-field
      class="centered-input my-6"
      :loading="loading"
      density="compact"
      variant="solo"
      label="Enter a molecule or reaction SMILES to explore available tasks"
      prepend-inner-icon="mdi-magnify"
      single-line
      hide-details
      @click:append-inner="onClick"
    >
      <template v-slot:append>
        <v-btn-group color="primary" rounded divided>
          <v-btn prepend-icon="mdi mdi-pencil">Draw</v-btn>
          <v-btn prepend-icon="mdi mdi-web">Canonicalize</v-btn>
        </v-btn-group>
      </template>
    </v-text-field>
    <!-- <div class="row text-center">
      <div class="col-12">
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text"><i class="fa fa-search"></i></span>
          </div>
          <input
            class="form-control text-center"
            type="text"
            v-model="smiles"
            id="smiles"
            placeholder="Enter a molecule or reaction SMILES to explore available tasks"
          />
          <div class="input-group-append">
            <b-button v-b-modal.ketcher-modal
              ><i class="fas fa-edit"></i
            ></b-button>
            <b-button
              @click="canonicalize(smiles, 'smiles')"
              title="Canonicalize"
              >Canonicalize</b-button
            >
          </div>
        </div>
      </div>
    </div> -->

    <div v-if="!!smiles" class="row text-center my-5">
      <div class="col-12">
        <smiles-image
          :smiles="smiles"
          allow-copy
          @load="validSmiles = true"
          @error="validSmiles = false"
        ></smiles-image>
      </div>
    </div>

    <template v-if="validSmiles && type === 'mol'">
      <div class="card-deck my-5">
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <h4 class="card-title">SCScore</h4>
            <template v-if="scscore === undefined">
              <b-button variant="primary" @click="getScscore(smiles)"
                >Evaluate</b-button
              >
            </template>
            <template v-else-if="scscore === 'evaluating'">
              <div class="spinner-border text-secondary" role="status"></div>
            </template>
            <template v-else>
              <p class="card-text lead">{{ scscore }}</p>
            </template>
          </div>
        </div>
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <a
              class="stretched-link text-decoration-none"
              :href="`/retro/network/?target=${encodeURIComponent(smiles)}`"
              target="_blank"
            >
              <h4 class="m-0">Synthesize with Interactive Path Planner</h4>
            </a>
          </div>
        </div>
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <h4 class="card-title">Start Tree Builder Job</h4>
            <template v-if="tbStatus === undefined">
              <b-button-group>
                <b-button
                  variant="primary"
                  @click="sendTreeBuilderJob(smiles)"
                  :disabled="!context.isAuth"
                  :title="
                    context.isAuth
                      ? 'Submit tree builder job'
                      : 'Must be logged in!'
                  "
                >
                  Submit Job
                </b-button>
                <b-dropdown variant="primary" right>
                  <template #button-content>
                    <i class="fas fa-cog"></i>
                  </template>
                  <div class="b-dropdown-form text-nowrap">
                    <b-form-input
                      v-model="tbDesc"
                      placeholder="Job name/description"
                    ></b-form-input>
                  </div>
                  <b-dropdown-divider></b-dropdown-divider>
                  <b-dropdown-header>Quick Settings</b-dropdown-header>
                  <div class="b-dropdown-form text-nowrap">
                    <div v-for="(value, name) in tbPresetOptions" :key="name">
                      <b-form-radio v-model="tbPreset" :value="name">
                        {{ value.label }}
                        <i
                          v-b-tooltip
                          :title="value.info"
                          class="fas fa-question-circle ml-1"
                          style="cursor: pointer"
                        ></i>
                      </b-form-radio>
                    </div>
                  </div>
                </b-dropdown>
              </b-button-group>
            </template>
            <template v-else-if="tbStatus === 'pending'">
              <div class="spinner-border text-secondary" role="status"></div>
            </template>
            <template v-else-if="tbStatus === 'error'">
              <p class="card-text lead">Submission Error</p>
            </template>
            <template v-else>
              <p class="card-text lead">
                <a href="/my-results/" target="_blank">Go to My Results</a>
              </p>
            </template>
          </div>
        </div>
      </div>
      <div class="card-deck my-5">
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <a
              class="stretched-link text-decoration-none"
              :href="`/synth_interactive/?mode=forward&reactants=${encodeURIComponent(
                smiles
              )}`"
              target="_blank"
            >
              <h4 class="m-0">Predict Forward Synthesis</h4>
            </a>
          </div>
        </div>
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <a
              class="stretched-link text-decoration-none"
              :href="`/synth_interactive/?mode=impurity&reactants=${encodeURIComponent(
                smiles
              )}`"
              target="_blank"
            >
              <h4 class="m-0">Predict Impurities</h4>
            </a>
          </div>
        </div>
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <a
              class="stretched-link text-decoration-none"
              :href="`/synth_interactive/?mode=sites&reactants=${encodeURIComponent(
                smiles
              )}`"
              target="_blank"
            >
              <h4 class="m-0">Predict Aromatic Site Selectivity</h4>
            </a>
          </div>
        </div>
      </div>
      <div class="card-deck my-5">
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <a
              class="stretched-link text-decoration-none"
              :href="`/property-prediction/?tab=1&solute=${encodeURIComponent(
                smiles
              )}`"
              target="_blank"
            >
              <h4 class="m-0">Run Solvent Screen</h4>
            </a>
          </div>
        </div>
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <a
              class="stretched-link text-decoration-none"
              :href="`/buyables/?q=${encodeURIComponent(smiles)}`"
              target="_blank"
            >
              <h4 class="m-0">Search Buyables Database</h4>
            </a>
          </div>
        </div>
        <div class="card bg-light invisible"></div>
      </div>
    </template>

    <template v-if="validSmiles && type === 'rxn'">
      <div class="card-deck my-5">
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <h4 class="card-title">Fast Filter Score</h4>
            <template v-if="reactionScore === undefined">
              <b-button variant="primary" @click="getReactionScore(smiles)"
                >Evaluate</b-button
              >
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
                  <b-button variant="primary" @click="getMappedSmiles(smiles)"
                    >Evaluate</b-button
                  >
                </template>
                <template v-else>
                  <b-button
                    variant="primary"
                    @click="showMappedSmiles = !showMappedSmiles"
                  >
                    {{ showMappedSmiles ? "Hide" : "Show" }}
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
            <a
              class="stretched-link text-decoration-none"
              :href="`/synth_interactive/?mode=forward&rxnsmiles=${encodeURIComponent(
                smiles
              )}`"
              target="_blank"
            >
              <h4 class="m-0">Predict Forward Synthesis</h4>
            </a>
          </div>
        </div>
      </div>

      <div
        class="card"
        v-if="mappedSmiles !== undefined && mappedSmiles !== 'evaluating'"
        v-show="showMappedSmiles"
      >
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
                <span class="lead"
                  >Unable to generate atom mapping for this reaction.</span
                >
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="card-deck my-5">
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <a
              class="stretched-link text-decoration-none"
              :href="`/synth_interactive/?mode=context&rxnsmiles=${encodeURIComponent(
                smiles
              )}`"
              target="_blank"
            >
              <h4 class="m-0">Predict Conditions</h4>
            </a>
          </div>
        </div>
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <a
              class="stretched-link text-decoration-none"
              :href="`/synth_interactive/?mode=impurity&rxnsmiles=${encodeURIComponent(
                smiles
              )}`"
              target="_blank"
            >
              <h4 class="m-0">Predict Impurities</h4>
            </a>
          </div>
        </div>
        <div class="card bg-light">
          <div class="card-body launchcard-body">
            <a
              class="stretched-link text-decoration-none"
              :href="`/synth_interactive/?mode=selectivity&rxnsmiles=${encodeURIComponent(
                smiles
              )}`"
              target="_blank"
            >
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
              <a
                href="https://doi.org/10.26434/chemrxiv.9897365.v4"
                target="_blank"
              >
                <i
                  title="Predict reaction name with a bidirectional attention-based transformer model."
                  class="fas fa-info-circle"
                  style="cursor: pointer"
                ></i>
              </a>
            </h4>
            <template v-if="classificationStatus === 'evaluating'">
              <div class="spinner-border text-secondary" role="status"></div>
            </template>
            <template v-else>
              <template v-if="!classificationResults.length">
                <b-button variant="primary" @click="getClassification(smiles)"
                  >Evaluate</b-button
                >
              </template>
              <template v-else>
                <b-button
                  variant="primary"
                  @click="
                    showClassificationResults = !showClassificationResults
                  "
                >
                  {{ showClassificationResults ? "Hide" : "Show" }}
                </b-button>
              </template>
            </template>
          </div>
        </div>
        <div class="card bg-light invisible"></div>
      </div>

      <div
        class="card"
        v-if="
          !!classificationResults.length &&
          classificationStatus !== 'evaluating'
        "
        v-show="showClassificationResults"
      >
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
          </template>
        </div>
      </div>
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
import { ref, computed, watch} from "vue";
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