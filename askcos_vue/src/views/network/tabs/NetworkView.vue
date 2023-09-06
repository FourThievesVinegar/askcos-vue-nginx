<template>
  <v-sheet>
    <v-toolbar density="compact" height="200px">
      <v-progress-linear :active="pendingTasks !== 0" :indeterminate="pendingTasks !== 0" absolute location="bottom"
        color="green-darken-1"></v-progress-linear>
      <v-container fluid>
        <v-row class="justify-center align-center">
          <v-col cols="12" md="10"><v-text-field v-model="resultsStore.target" density="compact" variant="outlined"
              label="Target" placeholder="SMILES" type="text" clearable class="target-input" hide-details>
              <template v-slot:append-inner>
                <v-btn variant="tonal" size="small" prepend-icon="mdi-pencil">Draw</v-btn>
              </template>
              <template v-slot:append>
                <v-btn variant="flat" color="green-darken-1" prepend-icon="mdi mdi-play" class="mr-2"
                  :disabled="!resultsStore.target" @click="changeTarget">One Step</v-btn>
                <v-btn-group density="compact" color="primary" divided>
                  <v-btn prepend-icon="mdi mdi-family-tree" :disabled="!isAuth">Build Tree</v-btn>
                  <v-menu location="bottom">
                    <template v-slot:activator="{ props }">
                      <v-btn v-bind="props" icon="mdi mdi-menu-down" :disabled="!isAuth" />
                    </template>
                    <v-list>
                      <v-list-item>
                        <v-list-item-title>Option 1</v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>Option 2</v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>Option 3</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-btn-group>
                <v-btn variant="flat" color="primary" prepend-icon="mdi mdi-application-import" class="ml-2"
                  @click="showImportNetwork = true">Import
                  Network</v-btn>
              </template>
            </v-text-field></v-col>
        </v-row>
        <v-row class="justify-center align-center"><span class="text-overline">Using model(s):</span>
          <div v-if="settingsStore.tbSettings.strategies.length !== 0" class="pa-0">
            <v-chip v-for="(strategy, idx) in settingsStore.tbSettings.strategies" :key="idx" class="text-overline">
              {{ strategy.model }}
            </v-chip>
          </div>
          <div v-else>No strategy added</div>
          <v-divider class="border-opacity-75 mx-2" vertical></v-divider>
          <v-btn variant="tonal" color="primary" prepend-icon="mdi mdi-cog">Strategy Settings</v-btn>
        </v-row>
      </v-container>
    </v-toolbar>
    <div v-if="!isCanvasEmpty">
      <div id="network" :class="visible ? 'open-toolbar' : 'close-toolbar'"></div>
      <div v-if="treeViewEnabled" id="tree-view-overlay">
        <v-btn-group variant="outlined" density="comfortable" divided :border="true">
          <v-btn icon="mdi mdi-chevron-double-left" @click="changeTreeIndex('first')"
            :disabled="!treeViewEnabled"></v-btn>
          <v-btn icon="mdi mdi-chevron-left" @click="changeTreeIndex('prev')" :disabled="!treeViewEnabled"></v-btn>
          <v-btn variant="tonal">Tree {{ treeViewEnabled ?
            `${currentTreeIndex
            + 1} of ${trees.length}` : "N/A" }}</v-btn>
          <v-btn icon="mdi mdi-chevron-right" @click="changeTreeIndex('next')" :disabled="!treeViewEnabled"></v-btn>
          <v-btn icon="mdi mdi-chevron-double-right" @click="changeTreeIndex('last')"
            :disabled="!treeViewEnabled"></v-btn>
        </v-btn-group>
        <div>
          <v-btn variant="outlined" block size="small" class="my-2" :disabled="currentTreeVisible"
            @click="resultsStore.addTreeToDispGraph(currentTree)">Add full tree to network</v-btn>
        </div>
        <div v-if="currentTreeData">
          <table class="text-left">
            <tr v-for="(value, key) in currentTreeData" :key="key">
              <th class="px-1">{{ key }}</th>
              <td class="px-1">{{ Number.isInteger(value) ? value : num2str(value) }}</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="hover-btn justify-center align-center flex-gap-2 elevation-3" id="hoverBtn">
        <v-btn v-if="!!selected && selected.type === 'chemical'" density="compact" icon="mdi mdi-plus-circle"
          id="expand-btn" @click="expandNode" title="Expand node" variant="flat" color="green-darken-1">
        </v-btn>
        <v-btn id="select-all-btn" class="text-light" @click="selectAllOccur" title="Select all occurrences"
          density="compact" icon="mdi mdi-select-all" variant="flat" color="orange-darken-1">
        </v-btn>
        <v-btn id="delete-btn" @click="deleteChoice" title="Delete children node(s)" density="compact"
          icon="mdi mdi-delete-empty" variant="flat" color="red-darken-1">
        </v-btn>
        <v-btn id="collapse-btn" @click="collapseNode" title="Collapse children node(s)" density="compact"
          icon="mdi mdi-collapse-all" variant="flat" color="blue-darken-1">
        </v-btn>
        <v-btn id="node-detail-btn" @click="showNodeDetail" title="Show Node Detail" density="compact"
          icon="mdi mdi-information" variant="flat" color="grey-darken-1">
        </v-btn>
      </div>
      <div class="canvas-btn d-flex flex-column flex-gap-2 align-items-center">
        <v-tooltip location="end">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" :disabled="isCanvasEmpty" @click="saveImage" density="compact" icon="mdi-camera"
              variant="tonal" color="primary" elevation="3">
            </v-btn>
          </template>
          <span>Take Screenshot</span>
        </v-tooltip>
        <v-tooltip location="end">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" :disabled="isCanvasEmpty" id="hierarchical-button" @click="toggleHierarchical"
              density="compact" icon="mdi-plus" variant="tonal" color="primary" elevation="3">
              {{ settingsStore.visjsOptions.layout.hierarchical.enabled ? "H" : "G" }}
            </v-btn>
          </template>
          <span>Tree/Graph</span>
        </v-tooltip>
        <v-tooltip location="end">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" :disabled="isCanvasEmpty" id="center-graph-button" @click="centerGraph"
              density="compact" icon="mdi-fit-to-screen-outline" variant="tonal" color="primary" elevation="3">
            </v-btn>
          </template>
          <span>Center Canvas</span>
        </v-tooltip>
      </div>
      <div class="result-btn d-flex justify-content-center align-items-center flex-gap-2">
        <v-btn id="clear-reactions-btn" @click="clear()" title="Clear all results" size="small" color="red-darken-2"
          prepend-icon="mdi mdi-close-circle">
          Clear Result </v-btn>
        <v-menu location="top">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" size="small" v-bind="props" prepend-icon="mdi mdi-content-save">
              Save Results
            </v-btn>
          </template>

          <v-list>
            <v-list-item>My PC</v-list-item>
            <v-list-item>My Account</v-list-item>
          </v-list>
        </v-menu>
      </div>
      <div class="highlight-btn d-flex flex-column align-items-center justify-items-center flex-gap-2">
        <v-btn :disabled="isCanvasEmpty" title="Enumerate paths to starting materials" density="compact"
          icon="mdi mdi-map-marker-path" variant="tonal" color="primary" elevation="3" @click="showEnumeratePaths = true">
        </v-btn>
        <v-btn :disabled="isCanvasEmpty" title="Enumerate paths to starting materials" density="compact"
          icon="mdi mdi-marker" variant="tonal" :color="treeViewEnabled ? 'success' : 'primary'" elevation="3"
          @click="treeViewEnabled = !treeViewEnabled">
        </v-btn>
      </div>
    </div>
    <div v-else class="d-flex justify-center pa-16">
      <div v-if="!!resultsStore.target">
        <smiles-image :smiles="resultsStore.target"></smiles-image>
        <p class="text-body-1">
          Perform either 'One-Step' or 'Build Tree' on this target
        </p>
      </div>
      <div v-else class="text-center">
        <v-img :width="400" cover :src="emptyCanvas" class="mb-3"></v-img>
        <h2>Empty Canvas</h2>
        <p class="text-body-1">Begin by running a new prediction</p>
      </div>
    </div>
  </v-sheet>

  <v-dialog v-model="showEnumeratePaths" width="auto">
    <v-card>
      <v-card-title>Enumerate Pathways</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <p class="mb-2">This will enumerate pathways to terminal precursors based on the current tree builder settings.
        </p>
        <p>Following settings are considered as listed below:</p>
        <v-list class="mb-2">
          <v-list-item prepend-icon="mdi mdi-circle-small" min-height="0px">Max depth</v-list-item>
          <v-list-item prepend-icon="mdi mdi-circle-small" min-height="0px">Max trees</v-list-item>
          <v-list-item prepend-icon="mdi mdi-circle-small" min-height="0px">Buyable sources</v-list-item>
          <v-list-item prepend-icon="mdi mdi-circle-small" min-height="0px">Buyable logic</v-list-item>
          <v-list-item prepend-icon="mdi mdi-circle-small" min-height="0px">Chemical price logic and Max chemical
            price</v-list-item>
          <v-list-item prepend-icon="mdi mdi-circle-small" min-height="0px">Chemical SCScore logic and Max
            SCScore</v-list-item>
          <v-list-item prepend-icon="mdi mdi-circle-small" min-height="0px">Chemical popularity logic and Min
            occurrences</v-list-item>
        </v-list>
        <v-checkbox v-model="useDispNodesOnly"
          label="Restrict search to results currently shown in network view"></v-checkbox>
        <v-alert text="Chemical property criteria are not yet supported." type="info" class="mb-2"></v-alert>
        <v-alert v-if="trees.length" text="Continuing with path enumeration will clear existing trees."
          type="warning"></v-alert>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="showEnumeratePaths = false">Cancel</v-btn>
        <v-btn color="primary" @click="() => { showEnumeratePaths = false; enumerateTrees() }">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showImportNetwork" width="auto" min-width="500px">
    <v-card>
      <v-card-title>Load Network JSON</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-file-input label="File input" variant="outlined"></v-file-input>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="showImportNetwork = false">Cancel</v-btn>
        <v-btn color="primary" @click="() => { showImportNetwork = false; load() }">Load</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <NodeDetail :visible="nodeDetailVisible" :enable-resolver="enableResolver" :selected="selected" @close="closeNodeDetail"
    @expandNode="expandNode" @updatePendingTasks="pendingTasksHandler" ref="node-detail" />
</template>

<script>
import { v4 as uuidv4, NIL as NIL_UUID } from "uuid";
import { makeChemicalDisplayNode } from "@/views/network/visualization";
import emptyCanvas from "@/assets/emptyCanvas.svg";
import { API } from "@/common/api";
import { TB_PRESETS } from "@/common/tb-presets";
import { num2str, getFromStorage, storageAvailable } from "@/common/utils";
import SmilesImage from "@/components/SmilesImage";
import { mapStores } from "pinia";
import { useResultsStore } from "@/store/results";
import { useSettingsStore } from "@/store/settings";
import dayjs from "dayjs";
import { Network } from "vis-network";
import { getPaths } from "@/common/graph";
import { useConfirm } from 'vuetify-use-dialog';
import NodeDetail from "@/components/network/NodeDetail";
const BG_OPACITY = 0.2; // Background opacity
export default {
  name: "NetworkView",
  components: {
    SmilesImage,
    NodeDetail,
  },
  props: {
    tabActive: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const createConfirm = useConfirm()
    return {
      createConfirm
    }
  },
  data() {
    return {
      visible: true,
      treeBuilderModalShow: false,
      networkInitialized: false,
      treeViewEnabled: false,
      useDispNodesOnly: false,
      currentTreeIndex: 0,
      templateSets: {},
      templateAttributes: {},
      invertAtomFilter: false,
      showSettingsModal: false,
      showLoadModal: false,
      showDownloadModal: false,
      showClusterPopoutModal: false,
      showClusterEditModal: false,
      showAddNewPrecursorModal: false,
      showSaveModal: false,
      showEnumeratePaths: false,
      showImportNetwork: false,
      downloadName: "network.json",
      tb: {
        modes: TB_PRESETS,
        taskId: "",
        taskName: "",
      },
      selected: null,
      nodeDetailVisible: false,
      pendingTasks: 0, // Counter for displaying loading spinner
      infoPanelOptions: {
        id: "infoPanel",
        headerTitle: "Tree Info",
        headerControls: {
          size: "sm",
          close: "remove",
          maximize: "remove",
          normalize: "remove",
          minimize: "remove",
        },
        position: { my: "left-top", at: "left-top", of: "#network" },
        panelSize: { width: 250, height: 280 },
      },
      uploadFile: null,
      isCanvasEmpty: true,
      validSmiles: true,
      emptyCanvas: emptyCanvas,
    };
  },
  created() {
    // Prompt user before going back to previous page
    window.addEventListener("beforeunload", (e) => {
      if (this.resultsStore.dataGraph.nodes.length) {
        // Cancel the event
        e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
        // Chrome requires returnValue to be set
        e.returnValue = "";
      }
    });

    API.get("/api/v2/template/sets/").then((json) => {
      this.templateAttributes = json.attributes;
      for (let templateSet of json["template_sets"]) {
        this.templateSets[templateSet] = [];
        API.get("/api/v2/retro/models/", { template_set: templateSet })
          .then((json) => {
            if (json.versions) {
              this.templateSets[json.request.template_set] = json.versions.map(
                (x) => Number(x)
              );
            }
          })
          .catch(() => {
            console.log(`Model unavailable: ${templateSet}`);
          });
      }
    });

    this.loadTarget();
    this.loadAllSettings();
    let urlParams = new URLSearchParams(window.location.search);
    let resultID = urlParams.get("id");
    if (resultID) {
      this.isCanvasEmpty = false;
      return;
    }
    let urlTarget = urlParams.get("target");
    if (urlTarget) {
      this.resultsStore.target = urlTarget;
    }
    let run = urlParams.get("run");
    if (run && JSON.parse(run)) {
      this.changeTarget();
    }
  },
  computed: {
    context() {
      return JSON.parse(document.getElementById("django-context").textContent);
    },
    enableResolver() {
      return false;
    },
    isAuth() {
      return false;
    },
    showLoader() {
      return this.pendingTasks > 0;
    },
    currentTree() {
      return this.trees[this.currentTreeIndex];
    },
    currentTreeData() {
      if (this.currentTree) {
        const props = this.currentTree["graph"];
        const data = {
          Depth: props["depth"],
          "# Reactions": props["num_reactions"],
          "Avg. Plausibility": props["avg_plausibility"],
          "Min. Plausibility": props["min_plausibility"],
          "Avg. Template Score": props["avg_score"],
          "Min. Template Score": props["min_score"],
        };
        if (props["precursor_cost"] !== undefined) {
          data["Total Precursor Cost"] = props["precursor_cost"];
        }
        if (props["atom_economy"] !== undefined) {
          data["Overall Atom Economy"] = props["atom_economy"];
        }

        if (props["pmi"] !== undefined) {
          data["Avg. PMI"] = props["pmi"];
        }

        return data;
      } else {
        return null;
      }
    },
    currentTreeVisible() {
      // Whether the current tree is fully visible in the display graph
      if (!this.trees.length) {
        return false;
      }
      const nodes = this.currentTree["nodes"];
      return nodes.every((node) => {
        return this.resultsStore.dispGraph.nodes.get(node["id"]) !== null;
      });
    },
    allowCluster: {
      get() {
        return this.settingsStore.allowCluster;
      },
      set(value) {
        this.settingsStore.setOption({ key: "allowCluster", value: value });
      },
    },
    allowResolve: {
      get() {
        return this.settingsStore.allowResolve;
      },
      set(value) {
        this.settingsStore.setOption({ key: "allowResolve", value: value });
      },
    },
    target: {
      get() {
        return this.resultsStore.target;
      },
      set(value) {
        this.resultsStore.setTarget(value);
      },
    },
    trees: {
      get() {
        return this.resultsStore.trees;
      },
      set(value) {
        this.resultsStore.setTrees(value);
      },
    },
    savedResultDescription: {
      get() {
        return this.resultsStore.savedResultInfo.description;
      },
      set(value) {
        this.resultsStore.updateSavedResultInfo({ description: value });
      },
    },
    savedResultTags: {
      get() {
        return this.resultsStore.savedResultInfo.tags;
      },
      set(value) {
        this.resultsStore.updateSavedResultInfo({ tags: value });
      },
    },
    savedResultOverwrite: {
      get() {
        return this.resultsStore.savedResultInfo.overwrite;
      },
      set(value) {
        this.resultsStore.updateSavedResultInfo({ overwrite: value });
      },
    },
    ...mapStores(useResultsStore, useSettingsStore),
  },
  methods: {
    createNetwork({ id, options, callback }) {
      const elem = document.getElementById(id);
      const network = new Network(elem, this.resultsStore.dispGraph, options);
      callback(network);
    },
    initializeNetwork() {
      this.pendingTasks += 1;
      // Use a callback so that Network creation is performed as a mutation in the results store
      // Otherwise, the dataset would be mutated outside of the result store
      // Also, note that this.network cannot be initialized in data as a reactive property
      // Otherwise, vue reactivity interferes with vis-network physics and event handlers
      this.createNetwork({
        id: "network",
        options: JSON.parse(JSON.stringify(this.settingsStore.visjsOptions)),
        callback: (network) => {
          this.network = network;
        },
      });
      this.network.on("dragStart", this.clearSelection);
      this.network.on("zoom", this.clearSelection);
      this.network.on("selectNode", this.showHoverBtn);
      this.network.on("deselectNode", this.clearSelection);
      this.network.once("afterDrawing", () => {
        this.networkInitialized = true;
        this.pendingTasks -= 1;
      });
    },
    checkCanvasEmpty() {
      // Getting the current canvas element
      const canvas = document.getElementsByTagName("canvas")[0];
      if (canvas === undefined) {
        return true;
      }
      // Creating new canvas element to get white background
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      if (canvas.toDataURL() === tempCanvas.toDataURL()) {
        return true;
      }
      return false;
    },
    saveImage() {
      // Getting the current canvas element
      const canvas = document.getElementsByTagName("canvas")[0];
      if (canvas === undefined) {
        this.$bvModal.msgBoxOk("No tree created yet to export as PNG", {
          title: "Alert",
          size: "sm",
          okVariant: "danger",
          okTitle: "Ok",
          hideHeaderClose: true,
          centered: true,
          footerClass: "p-2",
        });
        return;
      }
      // Creating new canvas element to get white background
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      if (canvas.toDataURL() === tempCanvas.toDataURL()) {
        this.$bvModal.msgBoxOk("Empty Interactive Path Planner canvas", {
          title: "Alert",
          size: "sm",
          okVariant: "danger",
          okTitle: "Ok",
          hideHeaderClose: true,
          centered: true,
          footerClass: "p-2",
        });
        return;
      }
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.fillStyle = "#ffffff";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      // Copy the original canvas
      tempCtx.drawImage(canvas, 0, 0);
      // Get the downloadable link
      const tempDataURL = tempCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "network.png";
      link.href = tempDataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    centerGraph() {
      if (this.network) {
        this.network.fit();
      }
    },
    saveTarget() {
      if (!storageAvailable("localStorage")) return;
      localStorage.setItem("target", this.resultsStore.target);
    },
    loadTarget() {
      if (!storageAvailable("localStorage")) return;
      const target = localStorage.getItem("target");
      if (!target) return;
      this.resultsStore.target = target;
    },
    getAllSettings() {
      return {
        network: this.settingsStore.visjsUserOptions,
        tb: this.settingsStore.tbSettings,
        ipp: this.settingsStore.ippSettings,
      };
    },
    saveAllSettings() {
      if (!storageAvailable("localStorage")) return;
      const settings = this.getAllSettings();
      localStorage.setItem(
        "visjsOptions",
        encodeURIComponent(JSON.stringify(settings.network))
      );
      localStorage.setItem(
        "tbSettings",
        encodeURIComponent(JSON.stringify(settings.tb))
      );
      localStorage.setItem(
        "ippSettings",
        encodeURIComponent(JSON.stringify(settings.ipp))
      );
    },
    setAllSettings(obj) {
      this.settingsStore.setVisjsOptions(obj["network"]);
      this.settingsStore.setTbSettings(obj["tb"]);
      this.settingsStore.setIppSettings(obj["ipp"]);
    },
    loadAllSettings() {
      if (!storageAvailable("localStorage")) return;
      const settings = {
        network: getFromStorage("visjsOptions"),
        tb: getFromStorage("tbSettings"),
        ipp: getFromStorage("ippSettings"),
      };
      this.setAllSettings(settings);
    },
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    applyTbPreset(mode) {
      if (Object.keys(this.tb.modes).includes(mode)) {
        this.settingsStore.settingsStore(this.tb.modes[mode].settings);
      }
    },
    isTbQuickSettingsMode(mode) {
      // Check if current settings matches the specified preset
      // Note: does not properly compare values which are arrays (currently not applicable)
      for (const [key, val] of Object.entries(this.tb.modes[mode].settings)) {
        if (this.settingsStore.tbSettings[key] !== val) {
          return false;
        }
      }
      return true;
    },
    sendTreeBuilderJob(strategyIndex) {
      if (!this.isAuth) {
        this.$bvModal.msgBoxOk(
          "Error: must be logged in to start tree builder",
          {
            title: "Alert",
            size: "sm",
            okVariant: "danger",
            okTitle: "Ok",
            hideHeaderClose: true,
            centered: true,
            footerClass: "p-2",
          }
        );
        return;
      }
      if (this.tb.taskName === "") {
        this.$set(this.tb, "taskName", this.resultsStore.target);
      }
      this.validatesmiles(this.resultsStore.target, !this.allowResolve)
        .then((isvalidsmiles) => {
          if (isvalidsmiles) {
            return this.resultsStore.target;
          } else {
            return this.resolveChemName(this.resultsStore.target);
          }
        })
        .then((smiles) => {
          this.resultsStore.target = smiles;
          this.mctsTreeBuilderAPICall(strategyIndex);
        })
        .catch((error) => {
          let error_msg = error.message || error || "unknown error";
          this.$bvModal.msgBoxOk(
            "There was an error submitting the tree builder job with the supplied settings: " +
            error_msg,
            {
              title: "Alert",
              size: "sm",
              okVariant: "danger",
              okTitle: "Ok",
              hideHeaderClose: true,
              centered: true,
              footerClass: "p-2",
            }
          );
        });
    },
    mctsTreeBuilderAPICall(strategyIndex) {
      this.saveAllSettings();
      this.saveTarget();
      const url = "/api/v2/tree-builder/";
      const body = {
        description: this.tb.taskName || this.resultsStore.target,
        smiles: this.resultsStore.target,
      };
      Object.assign(body, tbSettingsJsToApi(this.settingsStore.tbSettings));
      body["template_count"] =
        this.settingsStore.tbSettings.strategies[strategyIndex].numTemplates;
      body["max_cum_prob"] =
        this.settingsStore.tbSettings.strategies[strategyIndex].maxCumProb;
      body["template_prioritizers"] =
        this.settingsStore.tbSettings.strategies[
          strategyIndex
        ].templatePrioritizers;
      checkTemplatePrioritizers(body["template_prioritizers"]);
      console.log(body);
      API.post(url, body)
        .then((json) => {
          this.tb.taskId = json.task_id;
          // let notificationOptions = {
          //   requireInteraction: true,
          //   body: "The job will run in the background. You will see a new notification when the job completes.",
          // };
          // this.makeNotification("Tree builder job submitted!", notificationOptions, function() {
          //   this.close();
          // });
          this.$bvModal.msgBoxOk("Tree Builder job submitted successfully!", {
            title: "Success",
            size: "sm",
            buttonSize: "sm",
            okVariant: "success",
            headerClass: "p-2 border-bottom-0",
            footerClass: "p-2 border-top-0",
            centered: true,
          });
          return API.pollCeleryResult(json.task_id);
        })
        .then(() => {
          let notificationOptions = {
            requireInteraction: true,
            body: "Click here to open a new tab with results.",
          };
          let app = this;
          let notifyCallback = function (event) {
            event.preventDefault(); // prevent the browser from focusing the Notification's tab
            if (app.tbSettings.redirectToGraph) {
              window.open(
                `/retro/network/?view=25&id=${app.tb.taskId}`,
                "_blank"
              );
              this.close();
            } else {
              window.open(
                `/retro/network/?tab=2&id=${app.tb.taskId}`,
                "_blank"
              );
              this.close();
            }
          };
          this.makeNotification(
            "Tree builder job complete!",
            notificationOptions,
            notifyCallback
          );
        })
        .catch((error) => {
          console.error(error);
          let notificationOptions = {
            requireInteraction: true,
            body: "Job failed. Try submitting a new job.",
          };
          this.makeNotification(
            "Tree builder job failed.",
            notificationOptions,
            function () {
              this.close();
            }
          );
        });
    },
    makeNotification(title, options, callback) {
      if (!("Notification" in window)) {
        this.$bvModal.msgBoxOk(
          "This browser does not support desktop notifications! Notifications about tree builder submission and completion will not show.",
          {
            title: "Alert",
            size: "sm",
            okVariant: "danger",
            okTitle: "Ok",
            hideHeaderClose: true,
            centered: true,
            footerClass: "p-2",
          }
        );
      }

      // Let's check whether notification permissions have already been granted
      else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        let notification = new Notification(title, options);
        notification.onclick = callback;
      }

      // Otherwise, we need to ask the user for permission
      else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            let notification = new Notification(title, options);
            notification.onclick = callback;
          }
        });
      }
    },
    resolveChemName(name) {
      if (this.enableResolver && this.allowResolve) {
        return resolveChemName(name);
      } else {
        throw Error(
          "Resolving chemical name using external server is not allowed."
        );
      }
    },
    validatesmiles(smiles, iswarning) {
      return API.post("/api/v2/rdkit/smiles/validate/", {
        smiles: smiles,
      }).then((json) => {
        if (!json["correct_syntax"]) {
          if (iswarning) {
            this.$bvModal.msgBoxOk("Invalid SMILES entered: Invalid Syntax", {
              title: "Alert",
              size: "sm",
              okVariant: "danger",
              okTitle: "Ok",
              hideHeaderClose: true,
              centered: true,
              footerClass: "p-2",
            });
          }
          return false;
        } else if (!json["valid_chem_name"]) {
          if (iswarning) {
            this.$bvModal.msgBoxOk(
              "Invalid SMILES entered: Invalid Chemical Name",
              {
                title: "Alert",
                size: "sm",
                okVariant: "danger",
                okTitle: "Ok",
                hideHeaderClose: true,
                centered: true,
                footerClass: "p-2",
              }
            );
          }
          return false;
        } else {
          return true;
        }
      });
    },
    getNodeColor(smiles, ppg) {
      let obj = {};
      if (smiles === this.resultsStore.target) {
        obj.border = "#000088";
      } else if (ppg === "not buyable") {
        obj.border = "#880000";
      } else if (ppg !== undefined) {
        obj.border = "#008800";
      }
      return obj;
    },
    async changeTarget() {
      if (this.resultsStore.dataGraph.nodes.length) {
        await this.$bvModal
          .msgBoxConfirm("This will clear existing results. Continue?", {
            title: "Please Confirm",
            size: "sm",
            okVariant: "success",
            okTitle: "Yes",
            cancelTitle: "No",
            footerClass: "p-2",
            hideHeaderClose: false,
            centered: true,
          })
          .then((value) => {
            if (!value) return;
          })
          .catch(() => {
            // An error occurred
          });
      }
      this.isCanvasEmpty = false;
      this.visible = false;
      this.pendingTasks += 1;
      this.saveAllSettings();
      this.validatesmiles(this.resultsStore.target, !this.allowResolve)
        .then((isvalidsmiles) => {
          if (isvalidsmiles) {
            return this.resultsStore.target;
          } else {
            return this.resolveChemName(this.resultsStore.target);
          }
        })
        .then((smiles) => this.canonicalize(smiles, "target"))
        .then(() => {
          //   this.saveTarget();
          if (this.resultsStore.target !== undefined) {
            this.resultsStore.clearDataGraph();
            this.resultsStore.clearDispGraph();
            this.resultsStore.clearRemovedReactions();
            return this.initTargetDataNode()
              .then(this.initTargetDispNode)
              .then(this.resultsStore.expand);
          } else {
            throw new Error("Could not parse target SMILES.");
          }
        })
        .then(() => {
          this.initializeNetwork();
        })
        .catch((error) => {
          let error_msg = error.message || error || "unknown error";
          this.$bvModal.msgBoxOk(
            "There was an error fetching precursors for this target with the supplied settings: " +
            error_msg,
            {
              title: "Alert",
              size: "sm",
              okVariant: "danger",
              okTitle: "Ok",
              hideHeaderClose: true,
              centered: true,
              footerClass: "p-2",
            }
          );
        })
        .finally(() => {
          this.pendingTasks -= 1;
        });
    },
    initTargetDataNode(update = true) {
      this.resultsStore.addDataNodes({
        id: this.resultsStore.target,
        type: "chemical",
      });
      if (update) {
        return this.resultsStore.updateChemicalMetadata([
          this.resultsStore.target,
        ]);
      }
    },
    initTargetDispNode() {
      const dataNode = this.resultsStore.dataGraph.nodes.get(
        this.resultsStore.target
      );
      this.resultsStore.addDispNodes(
        makeChemicalDisplayNode({
          id: NIL_UUID,
          data: dataNode,
          target: this.resultsStore.target,
        })
      );
      return NIL_UUID;
    },
    updateNetworkOptions() {
      if (typeof this.network != "undefined") {
        this.network.setOptions(
          JSON.parse(JSON.stringify(this.settingsStore.visjsOptions))
        );
      }
    },
    toggleHierarchical() {
      this.settingsStore.setVisHierachicalEnabled(
        !this.settingsStore.visjsOptions.layout.hierarchical.enabled
      );
      this.updateNetworkOptions();
    },
    expandNode() {
      if (this.isModalOpen() || typeof this.network == "undefined") {
        return;
      }

      let selected = this.network.getSelectedNodes();

      if (selected.length !== 1) {
        if (selected.length === 0) {
          this.$bvModal.msgBoxOk(
            "Please select a terminal chemical node to expand",
            {
              title: "Alert",
              size: "sm",
              okVariant: "danger",
              okTitle: "Ok",
              hideHeaderClose: true,
              centered: true,
              footerClass: "p-2",
            }
          );
        } else {
          this.$bvModal.msgBoxOk(
            "Please only select 1 node at a time to expand",
            {
              title: "Alert",
              size: "sm",
              okVariant: "danger",
              okTitle: "Ok",
              hideHeaderClose: true,
              centered: true,
              footerClass: "p-2",
            }
          );
        }
        return;
      }

      let nodeId = selected[0];
      this.pendingTasks += 1;

      this.resultsStore
        .expand(nodeId)
        .then(() => {
          this.network.fit();
        })
        .catch((error) => {
          let error_msg = error.message || error || "unknown error";
          this.$bvModal.msgBoxOk(
            "There was an error fetching precursors for this target with the supplied settings: " +
            error_msg,
            {
              title: "Alert",
              size: "sm",
              okVariant: "danger",
              okTitle: "Ok",
              hideHeaderClose: true,
              centered: true,
              footerClass: "p-2",
            }
          );
        })
        .finally(() => {
          this.pendingTasks -= 1;
          this.hideHoverBtn();
        });
    },
    selectAllOccur() {
      let selected = this.network.getSelectedNodes();
      if (selected.length === 0) {
        this.$bvModal.msgBoxOk("Please select a node!", {
          title: "Alert",
          size: "sm",
          okVariant: "danger",
          okTitle: "Ok",
          hideHeaderClose: true,
          centered: true,
          footerClass: "p-2",
        });
        return;
      }
      let selectNodes = [];

      for (let nodeId of selected) {
        let node = this.resultsStore.dispGraph.nodes.get(nodeId);
        if (node === null) {
          // the node does not exist, it may have already been deleted
          continue;
        }
        let sm_node = node.smiles;
        this.resultsStore.dispGraph.nodes.forEach(function (cur_node, id) {
          if (cur_node.smiles === sm_node) {
            selectNodes.push(id);
          }
        });
      }
      this.network.selectNodes(selectNodes);
    },
    deleteChoice() {
      // for all selected nodes, delete reaction nodes and delete children of chemical nodes
      this.$bvModal
        .msgBoxConfirm(
          "This will permanentlydelete all selected reaction nodes and all children of the selected chemical nodes. Continue?",
          {
            title: "Please Confirm",
            size: "sm",
            okVariant: "success",
            okTitle: "Yes",
            cancelTitle: "No",
            footerClass: "p-2",
            hideHeaderClose: false,
            centered: true,
          }
        )
        .then((value) => {
          if (!value) return;
          let selected = this.network.getSelectedNodes();
          for (let nodeId of selected) {
            let node = this.resultsStore.dispGraph.nodes.get(nodeId);
            if (node === null) {
              // the node does not exist, it may have already been deleted
              continue;
            }
            this.resultsStore.deleteDispNode(node);
          }
          this.clearSelection();
          this.hideHoverBtn();
        })
        .catch(() => {
          // An error occurred
        });
    },
    toggleResolver() {
      if (this.allowResolve) {
        this.allowResolve = false;
      } else {
        this.allowResolve = true;
      }
    },
    download() {
      let data = {
        dataGraph: this.resultsStore.dataGraph,
        dispGraph: this.resultsStore.dispGraph,
        version: 1.0,
      };
      let blob = new Blob([JSON.stringify(data)], {
        type: "data:text/json;charset=utf-8",
      });
      saveAs(blob, this.downloadName);
    },
    hasUndefinedClusterId() {
      for (let rxn of this.resultsStore.dataGraph.nodes.get({
        filter: (node) => node.type === "reaction",
      })) {
        if (rxn.clusterId === undefined) {
          return true;
        }
      }
      return false;
    },
    fixUndefinedClusterName() {
      for (let rxn of this.resultsStore.dataGraph.nodes.get({
        filter: (node) => node.type === "reaction",
      })) {
        if (rxn.clusterId !== undefined && rxn.clusterName === undefined) {
          rxn.clusterName = `Reaction Cluster #${rxn.clusterId + 1}`;
        }
      }
      return false;
    },
    load() {
      this.$bvModal
        .msgBoxConfirm(
          "This will clear all of your current results. Continue anyway?",
          {
            title: "Please Confirm",
            size: "sm",
            okVariant: "success",
            okTitle: "Yes",
            cancelTitle: "No",
            footerClass: "p-2",
            hideHeaderClose: false,
            centered: true,
          }
        )
        .then((value) => {
          if (!value) return;
          this.resultsStore.target = "";
          this.selected = null;
          this.resultsStore.clearDataGraph();
          this.resultsStore.clearDispGraph();
          this.resultsStore.clearRemovedReactions();
          this.trees = [];
          this.pendingTasks += 1;
          this.isCanvasEmpty = false;
          this.visible = false;
          let reader = new FileReader();
          reader.readAsText(this.uploadFile);
          reader.onload = (e) => {
            let data = JSON.parse(e.target.result);
            if (data.version === 1.0) {
              this.importDataV1(data);
            } else {
              this.importDataV0(data);
            }
            this.pendingTasks -= 1;
          };
        })
        .catch(() => {
          // An error occurred
        });
    },
    importDataV0(data) {
      // Parse old data download format, before version numbers were introduced
      // Top level properties should be nodes, edges, and results
      // This converts the data to the current format for subsequent downloads
      this.resultsStore.target = data.nodes[0].smiles;
      let relabel = data.nodes[0].id !== NIL_UUID; // If target node ID is not NIL_UUID, then relabel using UUIDs
      let nodeIdMap = { [data.nodes[0].id]: NIL_UUID };
      this.initTargetDataNode(false);
      for (let [chem, precursors] of Object.entries(data.results)) {
        this.addRetroResultToDataGraph({
          data: precursors,
          parentSmiles: chem,
          update: false,
        });
      }
      this.addDispNodes(
        data.nodes.map((node) => {
          let nodeId;
          if (relabel) {
            nodeId = nodeIdMap[node["id"]];
            if (nodeId === undefined) {
              nodeId = uuidv4();
              nodeIdMap[node["id"]] = nodeId;
            }
          } else {
            nodeId = node["id"];
          }
          if (node.type === "chemical") {
            let dataObj = this.resultsStore.dataGraph.nodes.get(node["smiles"]);
            // Transfer properties which were not in the results object
            dataObj.ppg = node["ppg"];
            dataObj.source = node["source"];
            return {
              id: nodeId,
              smiles: node["smiles"],
              borderWidth: node["borderWidth"],
              color: node["color"],
              shape: "image",
              image: this.getMolDrawEndPoint(node["smiles"]),
              type: "chemical",
            };
          } else {
            let dataObj = this.resultsStore.dataGraph.nodes.get(
              node["reactionSmiles"]
            );
            // Transfer properties which were not in the results object
            dataObj.selectivity = node["selectivity"];
            let newNode = {
              id: nodeId,
              smiles: node["reactionSmiles"],
              label: node["label"],
              type: "reaction",
            };
            for (let key of ["borderWidth", "color", "title"]) {
              if (key in node) {
                newNode[key] = node[key];
              }
            }
            return newNode;
          }
        })
      );
      this.addDispEdges(
        data.edges.map((edge) => {
          let edgeId = relabel ? uuidv4() : edge["id"];
          let fromId = relabel ? nodeIdMap[edge["from"]] : edge["from"];
          let toId = relabel ? nodeIdMap[edge["to"]] : edge["to"];
          let from = this.resultsStore.dispGraph.nodes.get(fromId);
          let to = this.resultsStore.dispGraph.nodes.get(toId);
          let reactionObj;
          if (from["type"] === "reaction") {
            reactionObj = this.resultsStore.dataGraph.nodes.get(from["smiles"]);
          } else {
            reactionObj = this.resultsStore.dataGraph.nodes.get(to["smiles"]);
            reactionObj.inVis[fromId] = toId;
          }
          return {
            id: edgeId,
            from: fromId,
            to: toId,
            scaling: {
              min: 1,
              max: 5,
              customScalingFunction: edgeScaling,
            },
            color: edge["color"],
            value: edge["value"],
          };
        })
      );
      if (this.hasUndefinedClusterId()) {
        if (
          confirm(
            'The uploaded json file does not have reaction cluster information for some precursors. Select "Ok" to re-cluster all of them. Select "Cancel" to disable clustering.'
          )
        ) {
          this.updateAllClusters();
        } else {
          this.allowCluster = false;
        }
      } else {
        this.fixUndefinedClusterName();
      }
      this.initializeNetwork();
    },
    importDataV1(data) {
      // Parse data format version 1.0
      // Top level properties should be dataGraph, dispGraph, and version
      this.importDataJSON(data.dataGraph);
      this.importDispJSON(data.dispGraph);
      this.resultsStore.target =
        this.resultsStore.dispGraph.nodes.get(NIL_UUID).smiles;
      if (this.hasUndefinedClusterId()) {
        if (
          confirm(
            'The uploaded json file does not have reaction cluster information for some precursors. Select "Ok" to re-cluster all of them. Select "Cancel" to disable clustering.'
          )
        ) {
          this.updateAllClusters();
        } else {
          this.allowCluster = false;
        }
      } else {
        this.fixUndefinedClusterName();
      }
      this.initializeNetwork();
    },
    updateAllClusters() {
      // Recompute cluster IDs for all results
      for (let target of this.resultsStore.dataGraph.nodes.getIds({
        filter: (node) => node.type === "chemical",
      })) {
        if (this.resultsStore.dataGraph.getSuccessors(target).length > 0) {
          this.requestClusterId(target);
        }
      }
    },
    async clear(skipConfirm = false) {
      // Returns true or false depending on whether results were cleared
      if (!skipConfirm) {
        const isConfirmed = await this.createConfirm({ title: 'Please Confirm', content: 'This will clear all of your current results. Continue anyway?', dialogProps: { width: "auto" } })
        if (!isConfirmed)
          return
      }
      this.resultsStore.target = "";
      this.selected = null;
      this.resultsStore.clearDataGraph();
      this.resultsStore.clearDispGraph();
      this.resultsStore.clearRemovedReactions();
      this.resultsStore.setSavedResultInfo({});
      this.trees = [];
      this.isCanvasEmpty = true;
      this.visible = true;
      this.treeViewEnabled = false;
    },
    clearSelection() {
      let hoverBtnElem = document.getElementById("hoverBtn");
      hoverBtnElem.style.display = "none";
      this.selected = null;
      this.nodeDetailVisible = false;
    },
    closeNodeDetail() {
      // this.selected = null;
      this.nodeDetailVisible = false;
      this.hideHoverBtn();
    },
    collapseNode() {
      let selected = this.network.getSelectedNodes();
      selected.forEach((node) => {
        if (this.network.clustering.isCluster(node)) {
          this.network.openCluster(node);
        } else {
          let forCluster = this.resultsStore.dispGraph.getAllSuccessors(node);
          let options = {
            joinCondition: (nodeOptions) => {
              return (
                forCluster.includes(nodeOptions.id) || nodeOptions.id === node
              );
            },
          };
          this.network.clustering.cluster(options);
        }
      });
      this.hideHoverBtn();
    },
    hideHoverBtn() {
      this.network.unselectAll();
      let hoverBtnElem = document.getElementById("hoverBtn");
      hoverBtnElem.style.display = "none";
    },
    showHoverBtn(obj) {
      let nodeId = obj.nodes[obj.nodes.length - 1];

      const data = this.network.getPositions(obj.nodes)[nodeId];
      const nodePos = this.network.canvasToDOM({ x: data.x, y: data.y });
      let hoverBtnElem = document.getElementById("hoverBtn");
      hoverBtnElem.style.display = "flex";
      hoverBtnElem.style.left = nodePos.x + "px";
      hoverBtnElem.style.top = (nodePos.y + 120) + "px";

      let dispObj = this.resultsStore.dispGraph.nodes.get(nodeId);
      if (!dispObj) return;
      let dataObj = this.resultsStore.dataGraph.nodes.get(dispObj.smiles);
      if (!dataObj) return;

      this.selected = {
        id: dispObj.id,
        smiles: dispObj.smiles,
        type: dispObj.type,
        data: dataObj,
        disp: dispObj,
      };

      if (dispObj.type === "chemical" && !dataObj.source) {
        this.resultsStore.updatePrice([dataObj.id]).then(() => {
          let newData = this.resultsStore.dataGraph.nodes.get(dispObj.smiles);
          let newDisp = this.resultsStore.dispGraph.nodes.get(dispObj.id);
          this.selected.data = newData;
          this.selected.disp = newDisp;
          // this.$set(this.selected, "data", newData);
          // this.$set(this.selected, "disp", newDisp);
        });
      }
    },
    showNodeDetail() {
      this.nodeDetailVisible = true;
      let dispObj = this.selected.disp;
      let dataObj = this.selected.data;
      this.$nextTick(() => {
        if (dispObj.type === "chemical") {
          if (
            this.resultsStore.dataGraph.getSuccessors(dispObj.smiles).length > 0
          ) {
            const cmap = this.getReactingAtomColormap(dispObj.smiles);
            // this.$refs["node-detail"].$refs["ketcher-min"].setSmiles(
            //   dataObj.id,
            //   undefined,
            //   (k) => {
            //     k.editor.applyColormap(cmap);
            //   }
            // );
          } else {
            // this.$refs["node-detail"].$refs["ketcher-min"].setSmiles(
            //   dataObj.id
            // );
          }
        }
      });
      let hoverBtnElem = document.getElementById("hoverBtn");
      hoverBtnElem.style.display = "none";
    },
    getReactingAtomColormap(smiles) {
      // Apply a colormap to the ketcher drawing corresponding to reacting atom stats
      // Color corresponds to number of clusters represented
      // Size corresponds to number of reactions represented
      const stats = this.collectReactingAtomStats(smiles);
      const cmap = new Map();

      function scaleValue(val, limits) {
        return limits.max - limits.min > 0
          ? (val - limits.min) / (limits.max - limits.min)
          : 1;
      }

      if (stats.reactions.size > 0) {
        const rLimits = {
          min: Math.min(...stats.reactions.values()),
          max: Math.max(...stats.reactions.values()),
        };
        const cLimits = {
          min: Math.min(...stats.clusters.values()),
          max: Math.max(...stats.clusters.values()),
        };
        this.$set(this.selected, "stats", {
          reactions: rLimits,
          clusters: cLimits,
        });
        const palette = ["#c0f0c0", "#005020"];

        for (let [atom, countR] of stats.reactions) {
          let countC = stats.clusters.get(atom);
          cmap.set(atom - 1, {
            scale: scaleValue(countR, rLimits),
            color: interpolateHexColor(palette, scaleValue(countC, cLimits)),
          });
        }
      }
      return cmap;
    },
    collectReactingAtomStats(smiles) {
      // For the specified molecule, count appearance of each atom as reacting in precursor results
      // Returns a map from atom index to number of occurrences
      const rxns = this.resultsStore.dataGraph.nodes.get(
        this.resultsStore.dataGraph.getSuccessors(smiles)
      );
      const counts = new Map();
      const clusters = new Map();
      rxns.forEach((rxn) => {
        if (rxn.reactingAtoms) {
          rxn.reactingAtoms.forEach((i) => {
            if (i !== -1) {
              counts.set(i, (counts.get(i) || 0) + 1);
              clusters.set(
                i,
                (clusters.get(i) || new Set()).add(rxn.clusterId)
              );
            }
          });
        }
      });
      clusters.forEach((val, key, map) => {
        map.set(key, val.size);
      });
      return { reactions: counts, clusters: clusters };
    },
    getMolDrawEndPoint(precursor, align = false) {
      //  precursor can be
      //      1) a smiles string,
      //      2) a object with properties "reactingAtoms" and "mappedSmiles"
      //      3) a object with property "smiles"
      //      4) an object with property "precursorSmiles"
      const highlight = this.isHighlightAtom;
      const transparent = false;
      let reference;
      if (
        align &&
        this.selected &&
        this.settingsStore.ippSettings.alignPrecursorsToProduct
      ) {
        reference = this.selected.smiles;
      }
      return getMolImageUrl(precursor, highlight, transparent, reference);
    },
    isModalOpen() {
      var res = false;
      res = res || this.showSettingsModal;
      res = res || this.showDownloadModal;
      res = res || this.showLoadModal;
      res = res || this.showClusterPopoutModal;
      res = res || this.showClusterEditModal;
      res = res || this.showAddNewPrecursorModal;
      return res;
    },
    startTour() {
      this.$bvModal
        .msgBoxConfirm(
          "Starting the tutorial will clear all of your current results. Continue anyway?",
          {
            title: "Please Confirm",
            size: "sm",
            okVariant: "success",
            okTitle: "Yes",
            cancelTitle: "No",
            footerClass: "p-2",
            hideHeaderClose: false,
            centered: true,
          }
        )
        .then((value) => {
          if (!value) return;
          this.clear(true);
          this.tour.start();
        })
        .catch(() => {
          // An error occurred
        });
    },
    requestClusterId(smiles) {
      this.pendingTasks += 1;
      return this.recluster(smiles).finally(() => {
        this.pendingTasks -= 1;
      });
    },
    predictSelectivity() {
      this.pendingTasks += 1;
      let data = this.selected.data;
      let url = "/api/v2/general-selectivity/";
      let body = {
        reactants: data.mappedPrecursors,
        product: data.mappedOutcomes,
        mapped: true,
        all_outcomes: true,
        verbose: false,
        mode: this.selectivityModel,
      };
      API.runCeleryTask(url, body)
        .then((output) => {
          if (Array.isArray(output)) {
            this.updateDataNodes({
              id: data.id,
              selectivity: output,
            });
            // Update the selected data object
            let newData = this.resultsStore.dataGraph.nodes.get(
              this.selected.smiles
            );
            this.$set(this.selected, "data", newData);
          } else {
            this.$bvModal.msgBoxOk(
              "Could not predict selectivity for this reaction.",
              {
                title: "Alert",
                size: "sm",
                okVariant: "danger",
                okTitle: "Ok",
                hideHeaderClose: true,
                centered: true,
                footerClass: "p-2",
              }
            );
          }
        })
        .catch((error) => {
          this.$bvModal.msgBoxOk(
            "There was an error predicting selectivity for this reaction: " +
            error,
            {
              title: "Alert",
              size: "sm",
              okVariant: "danger",
              okTitle: "Ok",
              hideHeaderClose: true,
              centered: true,
              footerClass: "p-2",
            }
          );
        })
        .finally(() => {
          this.pendingTasks -= 1;
        });
    },
    saveResult() {
      this.pendingTasks += 1;
      const body = {
        result: {
          dataGraph: this.resultsStore.dataGraph.toJSON(),
          dispGraph: this.resultsStore.dispGraph.toJSON(),
        },
        settings: this.getAllSettings(),
        description: this.savedResultInfo.description,
        tags: this.savedResultInfo.tags.join(","),
        result_type: "ipp",
      };
      let url = `/api/v2/results/`;
      let method = "post";
      if (
        !!this.savedResultInfo.id &&
        this.savedResultInfo.type === "ipp" &&
        this.savedResultOverwrite
      ) {
        url += this.savedResultInfo.id + "/";
        body["check_date"] = this.savedResultInfo.modified;
        method = "put";
      }
      API[method](url, body)
        .then((json) => {
          if (json.success) {
            this.updateSavedResultInfo({
              id: json["id"],
              modified: json["modified"],
              modifiedDisp: dayjs(json["modified"]).format(
                "MMMM D, YYYY h:mm A"
              ),
            });
            this.$bvModal.msgBoxOk("Result saved successfully!", {
              title: "Success",
              size: "sm",
              okVariant: "success",
              okTitle: "Ok",
              hideHeaderClose: true,
              centered: true,
              footerClass: "p-2",
            });
          } else {
            this.$bvModal.msgBoxOk("Unable to save result.", {
              title: "Alert",
              size: "sm",
              okVariant: "danger",
              okTitle: "Ok",
              hideHeaderClose: true,
              centered: true,
              footerClass: "p-2",
            });
          }
        })
        .catch((error) => {
          this.$bvModal.msgBoxOk(
            "Error while attempting to save result: " + error.message,
            {
              title: "Alert",
              size: "sm",
              okVariant: "danger",
              okTitle: "Ok",
              hideHeaderClose: true,
              centered: true,
              footerClass: "p-2",
            }
          );
        })
        .finally(() => {
          this.pendingTasks -= 1;
        });
    },
    init() {
      if (!this.network && this.resultsStore.dispGraph.nodes.length) {
        this.initializeNetwork();
      } else if (this.network) {
        this.centerGraph();
      }
    },
    canonicalize(smiles, input) {
      return API.post("/api/v2/rdkit/smiles/canonicalize/", {
        smiles: smiles,
      }).then((json) => {
        if (json.smiles) {
          if (typeof input === "string") {
            this[input] = json.smiles;
          } else if (input instanceof Function) {
            input(json.smiles);
          }
        }
      });
    },
    updateTerminalNodes() {
      let chemicals = this.resultsStore.dataGraph.getChemicalNodes();
      let updates = chemicals.map((node) => ({
        id: node["id"],
        terminal: this.isNodeTerminal(node),
      }));
      this.resultsStore.updateDataNodes(updates);
    },
    enumerateTrees() {
      this.currentTreeIndex = 0;
      this.updateTerminalNodes();
      let trees = getPaths({
        dataGraph: this.resultsStore.dataGraph,
        dispGraph: this.resultsStore.dispGraph,
        root: this.resultsStore.target,
        rootId: NIL_UUID,
        maxDepth: this.settingsStore.tbSettings.maxDepth,
        maxTrees: this.settingsStore.tbSettings.maxTrees,
        dispOnly: this.useDispNodesOnly,
      });
      trees.forEach((tree) => this.calculateTreeMetadata(tree));
      this.trees = trees;
      this.treeViewEnabled = true;
      this.resultsStore.updateTreeConnectivity();
    },
    calculateTreeMetadata(tree) {
      // Updates tree in place
      let rxns = tree.nodes.filter((node) => node.type === "reaction");
      let firstRxn = rxns.filter(
        (node) =>
          this.resultsStore.dataGraph.getPredecessors(node.smiles)[0] ===
          this.resultsStore.target
      )[0];
      let firstRxnData = this.resultsStore.dataGraph.nodes.get(firstRxn.smiles);
      let data = rxns.map((node) =>
        this.resultsStore.dataGraph.nodes.get(node.smiles)
      );
      let ffscores = data.map((node) => node.ffScore);
      let tscores = data.map((node) => node.templateScore);
      Object.assign(tree.graph, {
        num_reactions: rxns.length,
        first_step_score: firstRxnData.templateScore,
        first_step_plausibility: firstRxnData.ffScore,
        avg_score: tscores.reduce((a, b) => a + b, 0) / tscores.length,
        avg_plausibility: ffscores.reduce((a, b) => a + b, 0) / ffscores.length,
        min_score: Math.min(...tscores),
        min_plausibility: Math.min(...ffscores),
      });
    },
    isNodeTerminal(dataNode) {
      // Based on MCTS.is_terminal in askcos-core
      // Note: chemicalPropertyLogic and chemicalPopularityLogic not yet supported
      // Expects node to be a data node object
      let checks = {
        buyableLogic: (n) => {
          return !!n.ppg && n.ppg !== "not buyable";
        },
        maxPPGLogic: (n) => {
          return (
            !!this.settingsStore.tbSettings.maxPPG &&
            !!n.ppg &&
            0 < n.ppg &&
            n.ppg <= this.settingsStore.tbSettings.maxPPG
          );
        },
        maxScscoreLogic: (n) => {
          return (
            !!this.settingsStore.tbSettings.maxScscore &&
            !!n.scscore &&
            n.scscore <= this.settingsStore.tbSettings.maxScscore
          );
        },
        chemicalPopularityLogic: (n) => {
          const reacCheck =
            !!this.settingsStore.tbSettings.chemicalPopularityReactants &&
            !!n.asReactant &&
            n.asReactant >=
            this.settingsStore.tbSettings.chemicalPopularityReactants;
          const prodCheck =
            !!this.settingsStore.tbSettings.chemicalPopularityProducts &&
            !!n.asProduct &&
            n.asProduct >=
            this.settingsStore.tbSettings.chemicalPopularityProducts;
          return reacCheck || prodCheck;
        },
      };
      let orCriteria = [];
      let andCriteria = [];
      let allCriteria = [
        "buyableLogic",
        "maxPPGLogic",
        "maxScscoreLogic",
        "chemicalPopularityLogic",
      ];
      allCriteria.forEach((crit) => {
        if (this.settingsStore.tbSettings[crit] === "or") {
          orCriteria.push(checks[crit](dataNode));
        } else if (this.settingsStore.tbSettings[crit] === "and") {
          andCriteria.push(checks[crit](dataNode));
        }
      });
      return (
        (orCriteria.length && orCriteria.some((x) => x)) ||
        (andCriteria.length && andCriteria.every((x) => x))
      );
    },
    enableTreeView() {
      this.treeViewEnabled = true;
      if (!this.trees.length) {
        this.enumerateTrees();
      }
      this.updateTreeOpacity();
    },
    disableTreeView() {
      this.treeViewEnabled = false;
      this.resetOpacity();
    },
    updateTreeOpacity() {
      this.resetOpacity();
      let tree = this.currentTree;
      let treeNodes = tree.nodes.map((node) => node.id);
      let treeEdges = tree.edges.map((edge) => edge.id);
      let nodes = this.resultsStore.dispGraph.nodes.getIds().map((node) => ({
        id: node,
        opacity: treeNodes.includes(node) ? undefined : BG_OPACITY,
      }));
      let edges = this.resultsStore.dispGraph.edges.getIds().map((edge) => ({
        id: edge,
        color: {
          color: "#000000",
          inherit: false,
          opacity: treeEdges.includes(edge) ? undefined : BG_OPACITY,
        },
      }));
      this.resultsStore.updateDispNodes(nodes);
      this.resultsStore.updateDispEdges(edges);
    },
    resetOpacity() {
      let nodes = this.resultsStore.dispGraph.nodes.getIds().map((node) => ({
        id: node,
        opacity: undefined,
      }));
      let edges = this.resultsStore.dispGraph.edges.getIds().map((edge) => ({
        id: edge,
        color: {
          color: "#000000",
          inherit: false,
          opacity: undefined,
        },
      }));
      this.resultsStore.updateDispNodes(nodes);
      this.resultsStore.updateDispEdges(edges);
    },
    changeTreeIndex(op) {
      let max = this.trees.length - 1;
      switch (op) {
        case "next":
          if (this.currentTreeIndex < max) {
            this.currentTreeIndex += 1;
          }
          break;
        case "prev":
          if (this.currentTreeIndex > 0) {
            this.currentTreeIndex -= 1;
          }
          break;
        case "first":
          this.currentTreeIndex = 0;
          break;
        case "last":
          this.currentTreeIndex = max;
          break;
        default:
          console.error(`Unexpected operation '${op}' for changeTreeIndex.`);
      }
      this.updateTreeOpacity();
    },
    pendingTasksHandler(type) {
      if (type === "add") {
        this.pendingTasks += 1;
      } else if (type === "sub") {
        this.pendingTasks -= 1;
      }
    },
    dayjs,
    num2str,
  },
  watch: {
    tabActive(newVal) {
      if (newVal) {
        this.init();
      }
    },
    treeViewEnabled(newVal) {
      if (newVal) {
        this.enableTreeView();
      } else {
        this.disableTreeView();
      }
    },
  },
};
</script>

<style>
.target-input .v-input__control {
  background-color: white;
}

.slide {
  margin-top: 5rem;
}

.open-toolbar {
  width: 100%;
  height: calc(100vh - 16rem);
}

.close-toolbar {
  width: 100%;
  height: calc(100vh - 16rem);
}

#tree-view-overlay {
  position: absolute;
  top: 120px;
  left: 1px;
  padding: 5px;
  background-color: rgba(255, 255, 255, 0.8);
}

#hierarchical-button {
  font-weight: bold;
}

.flex-gap-2 {
  gap: 0.5rem;
}

.hover-btn {
  display: none;
  position: absolute;
  padding: 5px;
  background-color: #BBDEFB;
  border-radius: 30px;
}

.result-btn {
  position: absolute;
  padding: 5px;
  bottom: 1px;
  right: 1px;
}

.canvas-btn {
  position: absolute;
  padding: 5px;
  bottom: 40px;
  right: 1px;
}

.highlight-btn {
  position: absolute;
  padding: 5px;
  top: 120px;
  right: 1px;
}

.form-bg {
  padding: 5px 15px;
  border: 1px solid #d3d3d3;
  border-radius: 30px;
}
</style>
