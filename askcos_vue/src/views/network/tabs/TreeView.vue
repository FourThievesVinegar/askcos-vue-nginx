<template>
    <v-container fluid>
        <v-row class="justify-center">
            <v-col id="tree-view-left" cols="12" md="3" class="d-flex align-center flex-column"
                style="height: calc(100vh - 14rem); overflow-y: auto;">
                <v-btn-group divided width="auto">
                    <v-btn>Result Info</v-btn>
                    <v-btn>Open List View</v-btn>
                </v-btn-group>
                <div v-if="resultsStore.savedResultInfo.type === 'tree_builder'" class="mt-4 align-self-start">
                    <h6 class="text-h6">Add results to IPP network</h6>
                    <p>
                        Add by tree
                        <i class="fas fa-question-circle ml-1"
                            title="Add the requested number of trees to the IPP network visualization based on the current cluster, sorting, and filtering options."></i>
                    </p>
                    <v-text-field label="First N Trees" variant="outlined" hide-details v-model="numTreesInput"
                        density="compact" class="mt-2">
                        <template v-slot:append>
                            <v-btn @click="addTreesToIpp()" :disabled="trees.length === 0">Add</v-btn>
                        </template>
                    </v-text-field>
                    <p class="mt-3">
                        Add by depth
                        <i v-b-tooltip class="fas fa-question-circle ml-1"
                            title="Add results from the full reaction network to the IPP network visualization. Depth is the number of reaction steps to descend. Top-N is the number of precursor suggestions to add for each intermediate."></i>
                    </p>
                    <v-row class="justify-center align-center">
                        <v-col cols="12" md="4">
                            <v-text-field label="Depth" variant="outlined" hide-details v-model="maxDepthInput"
                                density="compact" class="mt-2">
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field label="Top-N" variant="outlined" hide-details v-model="maxNumInput"
                                density="compact" class="mt-2">
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="4"> <v-btn @click="addResultsToIpp()"
                                :disabled="trees.length === 0">Add</v-btn></v-col>
                    </v-row>
                </div>
                <div v-if="resultsStore.savedResultInfo.type === 'tree_builder'" class="mt-4 align-self-start">
                    <h6 class="text-h6">Analyze trees</h6>
                    <v-btn width="100%" @click="runPathwayRanking()" class="my-1" variant="outlined"
                        :disabled="trees.length === 0">Run pathway
                        ranking</v-btn>
                    <v-btn width="100%" @click="runReactionClassification()" class="my-1" variant="outlined"
                        :disabled="trees.length === 0">Run reaction
                        classification</v-btn>
                    <v-menu location="bottom" :close-on-content-click="false">
                        <template v-slot:activator="{ props }">
                            <v-btn v-bind="props" append-icon="mdi mdi-menu-down" variant="outlined" class="mt-1"
                                width="100%" :disabled="trees.length === 0">Run PMI calculation</v-btn>
                        </template>
                        <v-list density="compact">
                            <v-list-item @click="runPmiCalculation(true)">For this tree only</v-list-item>
                            <v-list-item @click="runPmiCalculation()">For all trees</v-list-item>
                        </v-list>
                    </v-menu>
                    <v-menu location="bottom" :close-on-content-click="false">
                        <template v-slot:activator="{ props }">
                            <v-btn v-bind="props" append-icon="mdi mdi-menu-down" class="mt-1" width="100%"
                                variant="outlined" :disabled="trees.length === 0">Count analogs</v-btn>
                        </template>
                        <v-list density="compact">
                            <v-list-item @click="runAnalogCounting(true)">For this tree only</v-list-item>
                            <v-list-item @click="runAnalogCounting()">For all trees</v-list-item>
                        </v-list>
                    </v-menu>
                </div>
                <div v-if="resultsStore.savedResultInfo.type === 'tree_builder'" class="mt-2 align-self-start">
                    <h6 class="text-h6">Cluster Trees</h6>
                    <v-switch id="clusterSwitch" v-model="cluster" :disabled="clusterDisabled" hide-details
                        label="View by cluster">
                    </v-switch>
                </div>
                <div class="align-self-start">
                    <h6 class="text-h6">Sort trees</h6>
                    <div v-for="(sortInput, index) in treeSortInput" :key="index" class="d-flex flex-gap-2 mb-2">
                        <v-input hide-details :disabled="trees.length === 0">
                            <template v-slot:prepend class="justify-content-center" style="width: 2.5rem">
                                {{ index + 1 }}
                            </template>
                            <v-select id="sortingCategory" :model-value="sortInput.key" :items="treeSortOptions"
                                hide-details variant="outlined"
                                @update:modelValue="setDefaultSortOrder(sortInput)"></v-select>
                            <template v-slot:append>
                                <v-btn icon="mdi-sort-ascending" rounded variant="tonal" density="comfortable"></v-btn>
                                <v-btn icon="mdi-close" size="small" density="compact" @click="deleteSortField(index)"
                                    variant="tonal" color="red" class="ml-2"></v-btn>
                            </template>
                        </v-input>
                    </div>
                    <v-btn @click="addSortField" :disabled="trees.length === 0">Add sort field</v-btn>
                </div>
                <div class="mt-2">
                    <h6 class="text-h6">Filter trees</h6>
                    <p>
                        Show pathways which
                        <v-btn id="filterInvertCheck" @click="filterInvert = !filterInvert" size="small">
                            {{ filterInvert ? "do not" : "do" }}
                        </v-btn>
                        include
                        <v-btn id="filterAnyCheck" @click="filterAny = !filterAny" size="small">
                            {{ filterAny ? "any" : "all" }}
                        </v-btn>
                        of the selected components.
                    </p>
                    <a href="#" role="button">
                        <p>Select starting materials by
                            image</p>
                    </a>
                    <v-select label="Starting materials" :items="startingMaterialOptions"
                        v-model="selectedStartingMaterials" multiple variant="outlined" density="compact"
                        class="mt-1"></v-select>
                    <a href="#" role="button">
                        <p>Select intermediates by image</p>
                    </a>
                    <v-select label="Intermediates" :items="intermediateOptions" v-model="selectedIntermediates" multiple
                        variant="outlined" density="compact" class="mt-1"></v-select>
                    <v-select v-if="reactionClassOptions.length" label="Reaction classes" :items="reactionClassOptions"
                        v-model="selectedReactionClasses" multiple variant="outlined" density="compact"
                        class="mt-1"></v-select>
                    <!--<b-form-group label="Intermediates" v-slot="{ ariaDescribedby }">
                        <div class="overflow-auto" style="max-height: 10rem">
                            <b-form-checkbox-group v-model="selectedIntermediates" :options="intermediateOptions"
                                :aria-describedby="ariaDescribedby" name="intermediates" stacked></b-form-checkbox-group>
                        </div>
                    </b-form-group>
                    <b-form-group v-if="reactionClassOptions.length" label="Reaction classes" v-slot="{ ariaDescribedby }">
                        <div class="overflow-auto" style="max-height: 10rem">
                            <b-form-checkbox-group v-model="selectedReactionClasses" :options="reactionClassOptions"
                                :aria-describedby="ariaDescribedby" name="reaction-classes" stacked></b-form-checkbox-group>
                        </div>
                    </b-form-group> -->
                </div>
            </v-col>
            <v-col cols="12" md="9" id="tree-view-right" style="overflow-y: hide" v-show="trees.length !== 0">
                <div class="my-2 d-flex justify-space-around align-center">
                    <v-btn-group variant="outlined" density="comfortable" divided :border="true">
                        <v-btn icon="mdi mdi-chevron-double-left" @click="changeClusterId('first')"
                            :disabled="!cluster"></v-btn>
                        <v-btn icon="mdi mdi-chevron-left" @click="changeClusterId('prev')" :disabled="!cluster"></v-btn>
                        <v-btn variant="tonal">{{ !cluster ? "Cluster N/A" : currentClusterId === -1 ? "Unclustered" :
                            `Cluster
                            ${currentClusterId + 1} of ${maxClusterId + 1}` }}</v-btn>
                        <v-btn icon="mdi mdi-chevron-right" @click="changeClusterId('next')" :disabled="!cluster"></v-btn>
                        <v-btn icon="mdi mdi-chevron-double-right" @click="changeClusterId('last')"
                            :disabled="!cluster"></v-btn>
                    </v-btn-group>
                    <v-btn-group variant="outlined" density="comfortable" divided :border="true">
                        <v-btn icon="mdi mdi-chevron-double-left" @click="changeTreeId('first')"></v-btn>
                        <v-btn icon="mdi mdi-chevron-left" @click="changeTreeId('prev')"></v-btn>
                        <v-btn variant="tonal">Tree {{ currentTreeId +
                            1 }} of {{ trees.length }}</v-btn>
                        <v-btn icon="mdi mdi-chevron-right" @click="changeTreeId('next')"></v-btn>
                        <v-btn icon="mdi mdi-chevron-double-right" @click="changeTreeId('last')"></v-btn>
                    </v-btn-group>
                    <v-btn variant="tonal" @click="addTreeToIpp(currentTree)"> Add to IPP </v-btn>
                </div>
                <v-sheet class="position-relative elevation-2">
                    <div id="graph"></div>
                    <div v-if="currentTreeData" id="tree-data-overlay">
                        <table>
                            <tr v-for="(value, key) in currentTreeData" :key="key">
                                <th class="px-1">{{ key }}</th>
                                <td class="px-1">{{ Number.isInteger(value) ? value : num2str(value) }}</td>
                            </tr>
                        </table>
                    </div>
                    <network-legend></network-legend>
                </v-sheet>
            </v-col>
            <v-col cols="12" md="9" id="tree-view-right" style="overflow-y: hide" v-if="trees.length === 0"
                class="d-flex justify-center align-center">
                <div class="text-center">
                    <v-img :width="400" cover :src="emptyTrees" class="mb-3"></v-img>
                    <h2 class="text-h6">No trees found</h2>
                    <p class="text-body-1">Try a different strategy setting or change filter settings</p>
                </div>
            </v-col>
        </v-row>
    </v-container>
    <js-panel :visible="tabActive && !!selected" :options="detailPanelOptions" @close="clearSelection">
        <div v-if="selected" class="m-3">
            <div v-if="selected.type === 'chemical'">
                <div class="text-center">
                    <copy-tooltip :data="selected.smiles">
                        <b>Smiles: </b><span class="smiles">{{ selected.smiles }}</span>
                    </copy-tooltip>
                    <div><b>Price ($/g): </b>{{ selected.data.ppg > 0 ? selected.data.ppg : "not buyable" }}</div>
                    <div v-if="selected.data.source"><b>Source: </b>{{ selected.data.source }}</div>
                    <smiles-image class="my-3" :smiles="selected.smiles"></smiles-image>
                </div>
                <div class="text-center my-3">
                    <v-btn size="sm" variant="outline-secondary"
                        :href="'/retro/network/?target=' + encodeURIComponent(selected.smiles)" target="_blank">Synthesize
                        this with the Interactive Path Planner</v-btn>
                </div>
                <table class="table table-sm table-striped table-borderless">
                    <tbody>
                        <tr>
                            <th>As reactant</th>
                            <td>{{ selected.data["asReactant"] }}</td>
                        </tr>
                        <tr>
                            <th>As product</th>
                            <td>{{ selected.data["asProduct"] }}</td>
                        </tr>
                        <tr v-if="selected.data['scscore']">
                            <th>Synthetic complexity</th>
                            <td>{{ num2str(selected.data["scscore"]) }}</td>
                        </tr>
                        <tr v-if="selected.data['molwt']">
                            <th>Molecular weight</th>
                            <td>{{ selected.data["molwt"].toFixed(2) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="selected.type === 'reaction'">
                <div class="text-center">
                    <copy-tooltip :data="selected.smiles">
                        <b>Smiles: </b><span class="smiles">{{ selected.smiles }}</span>
                    </copy-tooltip>
                    <smiles-image class="my-3" :smiles="selected.smiles"
                        :align="settingsStore.ippSettings.alignPrecursorsToProduct"></smiles-image>
                </div>
                <div class="text-center my-3">
                    <v-btn size="sm" variant="outline-secondary"
                        :href="'/smynth_interactive/?mode=context&rxnsiles=' + encodeURIComponent(selected.smiles)"
                        target="_blank">Evaluate reaction</v-btn>
                </div>
                <table class="table table-sm table-striped table-borderless">
                    <tbody>
                        <tr>
                            <th>Plausibility</th>
                            <td>{{ num2str(selected.data["ffScore"]) }}</td>
                        </tr>
                        <tr v-if="selected.data['forwardScore']">
                            <th>Forward predictor score</th>
                            <td>{{ num2str(selected.data["forwardScore"]) }}</td>
                        </tr>
                        <tr>
                            <th>Template score</th>
                            <td>{{ num2str(selected.data["templateScore"]) }}</td>
                        </tr>
                        <tr>
                            <th>Template examples</th>
                            <td>{{ selected.data["numExamples"] }}</td>
                        </tr>
                        <tr>
                            <th>Necessary reagent</th>
                            <td>{{ Array.isArray(selected.data["necessaryReagent"]) ?
                                selected.data["necessaryReagent"].filter((item) => item).join(".") :
                                selected.data["necessaryReagent"] }}</td>
                        </tr>
                        <tr v-if="selected.data['className']">
                            <th>Reaction class</th>
                            <td>{{ selected.data["className"] }} ({{ selected.data["classNum"] }})</td>
                        </tr>
                        <tr>
                            <th>Supporting templates</th>
                            <td>
                                <ul>
                                    <li v-for="(id, index) in selected.data['templateIds']" :key="id">
                                        <a :href="'/template/?id=' + id" target="_blank">
                                            {{ id }} <template v-if="selected.data['templateSets']">({{
                                                selected.data["templateSets"][index] }})</template>
                                        </a>
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="btn-toolbar justify-content-end">
                <!-- <ban-button :smiles="selected.smiles" :type="selected.type"></ban-button> -->
            </div>
        </div>
    </js-panel>

    <js-panel :visible="tabActive && showListView" :options="listPanelOptions" @close="showListView = false">
        <div class="m-3">
            <b-pagination v-model="treeListCurrentPage" :total-rows="trees.length" :per-page="treeListItemsPerPage"
                align="center" class="mb-3"></b-pagination>
            <div v-for="(tree, index) in treeListItems" :key="index" class="mb-3">
                <v-btn-toolbar class="justify-content-between">
                    <v-btn v-b-toggle:[`tree-collapse-${index}`] size="sm" variant="primary"> Tree {{ (treeListCurrentPage -
                        1) * treeListItemsPerPage + index + 1 }} </v-btn>
                    <v-btn-group class="float-right">
                        <v-btn size="sm" variant="outline-dark"
                            @click="addTreeToIpp(trees[(treeListCurrentPage - 1) * treeListItemsPerPage + index])"> Add to
                            IPP </v-btn>
                        <v-btn size="sm" variant="outline-dark" @click="
                            showListView = false;
                        currentTreeId = (treeListCurrentPage - 1) * treeListItemsPerPage + index;
                        ">
                            View in main window
                        </v-btn>
                    </v-btn-group>
                </v-btn-toolbar>
                <!-- <b-collapse :id="`tree-collapse-${index}`" class="mt-2" visible>
              <div :id="`treeList-${index}`" class="list-view-tree"></div>
            </b-collapse> -->
            </div>
        </div>
    </js-panel>
</template>
  
<script>
// import BanButton from "@/components/BanButton";
import CopyTooltip from "@/components/CopyTooltip";
import JsPanel from "@/components/JsPanel";
import SmilesImage from "@/components/SmilesImage";
import NetworkLegend from "@/components/network/NetworkLegend";
import { API } from "@/common/api";
import { getMolImageUrl } from "@/common/drawing";
import { RetroGraph } from "@/common/graph";
import { num2str } from "@/common/utils";
import { visjsOptionsTreeDefault, visjsOptionsTreeCondensed } from "@/store/init/settings";
import { makeChemicalDisplayNode, makeReactionDisplayNode, makeDisplayEdge } from "@/views/network/visualization";
import { Network } from "vis-network";
import { mapStores } from "pinia";
import { useResultsStore } from "@/store/results";
import { useSettingsStore } from "@/store/settings";
import emptyTrees from '@/assets/emptyTrees.svg'

function initializeNetwork(data, container, showDetail = true) {
    const options = showDetail ? visjsOptionsTreeDefault : visjsOptionsTreeCondensed;
    return new Network(container, data, options);
}

export default {
    name: "TreeView",
    components: {
        // BanButton,
        CopyTooltip,
        JsPanel,
        SmilesImage,
        NetworkLegend,
    },
    props: {
        tabActive: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            showListView: false,
            selected: null,
            currentTreeId: 0,
            network: null,
            networkData: {},
            cluster: false,
            currentClusterId: 0,
            treeSortInput: [
                { key: "num_reactions", ascending: true },
                { key: "depth", ascending: true },
            ],
            treeListCurrentPage: 1,
            treeListItemsPerPage: 20,
            filterAny: false,
            filterInvert: false,
            reactionClassesByTree: {},
            reactionClassNames: {},
            reactionClassOptions: [],
            selectedReactionClasses: [],
            intermediatesByTree: {},
            intermediateOptions: [],
            selectedIntermediates: [],
            startingMaterialsByTree: {},
            startingMaterialOptions: [],
            selectedStartingMaterials: [],
            analysisTaskRunning: false,
            numTreesInput: 10,
            maxDepthInput: 2,
            maxNumInput: 5,
            infoPanelOptions: {
                id: "infoPanel",
                headerTitle: "Info",
                headerControls: { size: "sm" },
                position: { my: "left-top", at: "left-top", of: "#graph" },
                panelSize: { width: 500, height: 500 },
            },
            detailPanelOptions: {
                id: "detailPanel",
                headerTitle: "Node Details",
                headerControls: { size: "sm" },
                position: { my: "right-top", at: "right-top", of: "#graph" },
                panelSize: { width: 500, height: 500 },
            },
            listPanelOptions: {
                id: "listPanel",
                headerTitle: "List View",
                headerControls: { size: "sm" },
                position: { my: "center-top", at: "center-top", of: "#graph" },
                panelSize: { width: () => (window.innerWidth * 10) / 12, height: "calc(100vh - 22rem)" },
                callback: this.buildTreeList,
            },
            emptyTrees: emptyTrees,
        };
    },
    computed: {
        trees() {
            return this.allTrees
                .filter((tree, index) => {
                    let logic = this.filterAny ? "some" : "every";
                    let result = true;
                    if (this.cluster) {
                        result &&= tree["graph"]["cluster_id"] === this.currentClusterId;
                    }
                    let filterResults = [];
                    if (this.selectedReactionClasses.length) {
                        filterResults.push(this.selectedReactionClasses[logic]((item) => this.reactionClassesByTree[index].has(item)));
                    }
                    if (this.selectedIntermediates.length) {
                        filterResults.push(this.selectedIntermediates[logic]((item) => this.intermediatesByTree[index].has(item)));
                    }
                    if (this.selectedStartingMaterials.length) {
                        filterResults.push(this.selectedStartingMaterials[logic]((item) => this.startingMaterialsByTree[index].has(item)));
                    }
                    if (filterResults.length) {
                        let filterResult = filterResults[logic]((item) => item);
                        if (this.filterInvert) {
                            filterResult = !filterResult;
                        }
                        result &&= filterResult;
                    }
                    return result;
                })
                .sort((aObj, bObj) => {
                    for (let { key, ascending } of this.treeSortInput) {
                        const a = aObj["graph"][key];
                        const b = bObj["graph"][key];
                        const c = ascending ? 1 : -1;
                        // Sort null values to end regardless of ascending or descending
                        const res = (a === null) - (b === null) || (a - b) * c;
                        if (res) {
                            // Return if comparison is not equal (i.e. 0)
                            return res;
                        }
                    }
                    // All comparisons were equal (i.e. 0)
                    return 0;
                });
        },
        currentTree() {
            // The current tree that is rendered in the main view
            return this.trees[this.currentTreeId];
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
                    "Num. Analogs": props["num_analogs"],
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
        maxClusterId() {
            if (!!this.allTrees.length && "cluster_id" in this.allTrees[0]["graph"]) {
                return Math.max(...this.allTrees.map((tree) => tree["graph"]["cluster_id"]));
            } else {
                return 0;
            }
        },
        minClusterId() {
            if (!!this.allTrees.length && "cluster_id" in this.allTrees[0]["graph"]) {
                return Math.min(...this.allTrees.map((tree) => tree["graph"]["cluster_id"]));
            } else {
                return 0;
            }
        },
        treeListItems() {
            if (this.trees.length > 0) {
                const start = (this.treeListCurrentPage - 1) * this.treeListItemsPerPage;
                const end = start + this.treeListItemsPerPage;
                return this.trees.slice(start, end);
            } else {
                return [];
            }
        },
        treeListMaxPage() {
            if (this.trees.length > 0) {
                return Math.ceil(this.trees.length / this.treeListItemsPerPage);
            } else {
                return 1;
            }
        },
        atomEconomyDisabled() {
            return !!this.allTrees.length && (this.allTrees[0]["graph"]["atom_economy"] === undefined || this.allTrees[0]["graph"]["atom_economy"] === null);
        },
        scoreDisabled() {
            return !!this.allTrees.length && (this.allTrees[0]["graph"]["score"] === undefined || this.allTrees[0]["graph"]["score"] === null);
        },
        depthDisabled() {
            return !!this.allTrees.length && (this.allTrees[0]["graph"]["depth"] === undefined || this.allTrees[0]["graph"]["depth"] === null);
        },
        clusterDisabled() {
            return !!this.allTrees.length && (this.allTrees[0]["graph"]["cluster_id"] === undefined || this.allTrees[0]["graph"]["cluster_id"] === null);
        },
        analogCountDisabled() {
            return !!this.allTrees.length && this.allTrees.some((tree) => tree["graph"]["num_analogs"] === undefined || tree["graph"]["num_analogs"] === null);
        },
        pmiDisabled() {
            return !!this.allTrees.length && this.allTrees.some((tree) => tree["graph"]["pmi"] === undefined || tree["graph"]["pmi"] === null);
        },
        treeSortOptions() {
            return [
                { value: "num_reactions", title: "Total number of reactions" },
                { value: "depth", title: "Length of longest linear path", disabled: this.depthDisabled },
                { value: "first_step_score", title: "First step score" },
                { value: "first_step_plausibility", title: "First step plausibility" },
                { value: "avg_score", title: "Average score" },
                { value: "min_score", title: "Minimum score" },
                { value: "avg_plausibility", title: "Average plausibility" },
                { value: "min_plausibility", title: "Minimum plausibility" },
                { value: "precursor_cost", title: "Total precursor cost" },
                { value: "atom_economy", title: "Overall atom economy", disabled: this.atomEconomyDisabled },
                { value: "score", title: "Strategic quotient", disabled: this.scoreDisabled },
                { value: "num_analogs", title: "Number of possible analogs", disabled: this.analogCountDisabled },
                { value: "pmi", title: "Average PMI", disabled: this.pmiDisabled },
            ];
        },
        target: {
            get() {
                return this.resultsStore.target;
            },
            set(value) {
                this.resultsStore.setTarget(value);
            },
        },
        allTrees: {
            get() {
                return this.resultsStore.trees;
            },
            set(value) {
                this.resultsStore.setTrees(value);
            },
        },
        ...mapStores(useResultsStore, useSettingsStore),
    },
    methods: {
        init() {
            this.buildTree();
        },
        addResultsToIpp() {
            this.resultsStore.addResultsToDispGraph({ maxDepth: this.maxDepthInput, maxNum: this.maxNumInput }).then(() => {
                this.$emit("switch-tab", "0");
            });
        },
        addTreeToIpp(tree) {
            // console.log(tree)
            this.resultsStore.addTreeToDispGraph(tree);
            this.$emit("switch-tab", "IPP");
        },
        addTreesToIpp() {
            let selected = this.numTreesInput ? this.trees.slice(0, this.numTreesInput) : this.trees;
            selected.forEach(this.resultsStore.addTreeToDispGraph);
            this.$emit("switch-tab", "0");
        },
        loadNodeLinkGraph(data, showDetail = true) {
            /* Load tree in node link format into visjs and add visualization related attributes. */
            const graph = new RetroGraph(data.nodes, data.edges);

            if (showDetail) {
                /* For detail view, add extra visual attributes */
                graph.nodes.update(
                    data.nodes.map((node) => {
                        // this.resultsStore.dataGraph.nodes.map((node) => {
                        //     console.log(node)
                        // })
                        // console.log(this.resultsStore.dataGraph.nodes)
                        let dataNode = this.resultsStore.dataGraph.nodes.get(node["smiles"]);
                        if (node["type"] === "chemical") {
                            return makeChemicalDisplayNode({
                                id: node["id"],
                                data: dataNode,
                                target: this.target,
                                align: this.settingsStore.ippSettings.alignNodeImagesToTarget,
                                scale: false,
                            });
                        } else {
                            return makeReactionDisplayNode({
                                id: node["id"],
                                data: dataNode,
                                detail: true,
                            });
                        }
                    })
                );
                graph.edges.update(
                    data.edges.map((edge) => {
                        let from = graph.nodes.get(edge["from"]);
                        let to = graph.nodes.get(edge["to"]);
                        let reaction = from["type"] === "reaction" ? from["smiles"] : to["smiles"];
                        let reactionObj = this.resultsStore.dataGraph.nodes.get(reaction);
                        return makeDisplayEdge({
                            id: edge["id"],
                            from: edge["from"],
                            to: edge["to"],
                            value: reactionObj["templateScore"],
                        });
                    })
                );
            } else {
                graph.nodes.update(
                    data.nodes.map((node) => {
                        if (node.type === "chemical") {
                            return {
                                id: node.id,
                                image: getMolImageUrl(node.smiles),
                                shape: "image",
                            };
                        } else {
                            return {
                                id: node.id,
                                shape: "circle",
                            };
                        }
                    })
                );
            }

            return graph;
        },
        buildTree() {
            // if (!this.tabActive || !this.currentTree) {
            //     return;
            // }
            this.clearSelection();
            const elem = document.getElementById("graph");
            this.networkData = this.loadNodeLinkGraph(this.currentTree, true);
            this.network = initializeNetwork(this.networkData, elem, true);
            this.network.on("selectNode", this.showNode);
            this.network.on("deselectNode", this.clearSelection);
        },
        addSortField() {
            this.treeSortInput.push({
                key: "num_reactions",
                ascending: true,
            });
        },
        deleteSortField(index) {
            this.treeSortInput.splice(index, 1);
        },
        setDefaultSortOrder(sortInput) {
            sortInput.ascending = ["num_reactions", "depth", "precursor_cost"].includes(sortInput.key);
        },
        changeTreeId(op) {
            let max = this.trees.length - 1;
            switch (op) {
                case "next":
                    if (this.currentTreeId < max) {
                        this.currentTreeId += 1;
                    }
                    break;
                case "prev":
                    if (this.currentTreeId > 0) {
                        this.currentTreeId -= 1;
                    }
                    break;
                case "first":
                    this.currentTreeId = 0;
                    break;
                case "last":
                    this.currentTreeId = max;
                    break;
                default:
                    console.error(`Unexpected operation '${op}' for changeTreeId.`);
            }
        },
        changeClusterId(op) {
            switch (op) {
                case "next":
                    if (this.currentClusterId < this.maxClusterId) {
                        this.currentClusterId += 1;
                    }
                    break;
                case "prev":
                    if (this.currentClusterId > this.minClusterId) {
                        this.currentClusterId -= 1;
                    }
                    break;
                case "first":
                    this.currentClusterId = this.minClusterId;
                    break;
                case "last":
                    this.currentClusterId = this.maxClusterId;
                    break;
                default:
                    console.error(`Unexpected operation '${op}' for changeClusterId.`);
            }
        },
        initializeFilterData() {
            if (!this.allTrees.length) {
                return;
            }
            this.initializeReactionClassFilter();
            this.initializeIntermediateFilter();
            this.initializeStartingMaterialFilter();
        },
        initializeReactionClassFilter() {
            const reactionClassesAvailable = this.resultsStore.dataGraph.nodes.get().some((node) => !!node["classNum"]);
            if (!reactionClassesAvailable) {
                return;
            }
            let allClasses = this.allTrees.map((tree) => {
                return Object.fromEntries(
                    tree.nodes
                        .filter((node) => node.type === "reaction")
                        .map((node) => {
                            let dataNode = this.resultsStore.dataGraph.nodes.get(node["smiles"]);
                            return [dataNode["classNum"], dataNode["className"]];
                        })
                );
            });
            this.reactionClassesByTree = Object.fromEntries(
                allClasses.map((classes, index) => {
                    return [index, new Set(Object.keys(classes))];
                })
            );
            this.reactionClassNames = allClasses.reduce((a, b) => Object.assign(a, b), {});
            this.reactionClassOptions = Object.entries(this.reactionClassNames)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .map(([num, name]) => ({ text: `${num}: ${name}`, value: num }));
        },
        initializeIntermediateFilter() {
            this.intermediatesByTree = Object.fromEntries(
                this.allTrees.map((tree, index) => {
                    let intermediates = tree.nodes
                        .filter((node) => {
                            let result = node.type === "chemical" && !this.resultsStore.dataGraph.nodes.get(node["smiles"]).terminal;
                            if (this.resultsStore.savedResultInfo.type === "tree_builder") {
                                result &&= node.smiles !== this.resultsStore.savedResultInfo.smiles;
                            } else if (this.resultsStore.savedResultInfo.type === "graph_optimization") {
                                result &&= this.resultsStore.savedResultInfo.targets.includes(node.smiles);
                            }
                            return result;
                        })
                        .map((node) => node["smiles"]);
                    return [index, new Set(intermediates)];
                })
            );
            this.intermediateOptions = [
                ...Object.values(this.intermediatesByTree).reduce((a, b) => {
                    b.forEach((item) => a.add(item));
                    return a;
                }, new Set()),
            ].sort();
        },
        initializeStartingMaterialFilter() {
            this.startingMaterialsByTree = Object.fromEntries(
                this.allTrees.map((tree, index) => {
                    let startingMaterials = tree.nodes.filter((node) => node.type === "chemical" && this.resultsStore.dataGraph.nodes.get(node["smiles"]).terminal).map((node) => node["smiles"]);
                    return [index, new Set(startingMaterials)];
                })
            );
            this.startingMaterialOptions = [
                ...Object.values(this.startingMaterialsByTree).reduce((a, b) => {
                    b.forEach((item) => a.add(item));
                    return a;
                }, new Set()),
            ].sort();

            console.log(this.startingMaterialOptions)
        },
        showNode(selection) {
            const nodeId = selection.nodes[0];
            const dispNode = this.networkData.nodes.get(nodeId);
            const dataNode = this.resultsStore.dataGraph.nodes.get(dispNode.smiles);
            this.selected = {
                id: dispNode.id,
                smiles: dispNode.smiles,
                type: dispNode.type,
                data: dataNode,
                disp: dispNode,
            };
            if (dataNode.type === "chemical" && !dataNode.source) {
                this.resultsStore.updatePrice([dataNode.id]).then(() => {
                    let newData = this.resultsStore.dataGraph.nodes.get(dispNode.smiles);
                    let newDisp = this.networkData.nodes.get(dispNode.id);
                    this.selected["data"] = newData;
                    this.selected["disp"] = newDisp;
                });
            }
        },
        clearSelection() {
            this.selected = null;
        },
        buildTreeList() {
            /* Callback used by list view panel for drawing trees after panel creation */
            this.treeListItems.forEach((tree, index) => {
                let elem = document.getElementById(`treeList-${index}`);
                let networkData = this.loadNodeLinkGraph(tree, false);
                initializeNetwork(networkData, elem, false);
            });
        },
        runPathwayRanking() {
            if (this.analysisTaskRunning) {
                alert("An analysis task is already running. Please wait until it finishes before submitting another.");
            }
            if (!confirm("This will start a pathway ranking job for this result. If you stay on this page, you will receive a notification once the job is complete.")) {
                return;
            }
            const url = `/api/tree-analysis/controller/call-async`;
            const body = {
                result_id: this.resultsStore.savedResultInfo.id,
                task: "pathway_ranking",
            };
            API.post(url, body)
                .then((json) => {
                    // this.$bvToast.toast("Pathway ranking job submitted!", {
                    //     title: "Pathway ranking",
                    // });
                    return API.pollCeleryResult(json);
                })
                .then((output) => {
                    if (output.success) {
                        this.$bvToast.toast("Pathway ranking job complete! Refresh the page to view updated results.", {
                            title: "Pathway ranking",
                            noAutoHide: true,
                        });
                    } else {
                        this.$bvToast.toast(`Pathway ranking job failed: ${output.error}`, {
                            title: "Pathway ranking",
                            noAutoHide: true,
                        });
                    }
                })
                .catch(() => {
                    this.$bvToast.toast("Pathway ranking job failed! Please try again or try submitting a new tree builder job.", {
                        title: "Pathway ranking",
                        noAutoHide: true,
                    });
                })
                .finally(() => {
                    this.analysisTaskRunning = false;
                });
        },
        runAnalogCounting(selectedTree = false) {
            if (this.analysisTaskRunning) {
                alert("An analysis task is already running. Please wait until it finishes before submitting another.");
            }
            if (!confirm("This will start a job to estimate the number of analogs possible for this result. If you stay on this page, you will receive a notification once the job is complete.")) {
                return;
            }

            let selectTreeIdx = -1;
            if (selectedTree) {
                selectTreeIdx = this.allTrees.indexOf(this.currentTree);
            }

            const url = `/api/tree-analysis/controller/call-async`;
            const body = {
                result_id: this.resultsStore.savedResultInfo.id,
                task: "count_analogs",
                index: selectTreeIdx,
                min_plausibility: this.resultsStore.savedResultInfo.tbSettings["filter_threshold"],
            };
            API.post(url, body)
                .then((json) => {
                    // this.$bvToast.toast("Analog counting job submitted!", {
                    //     title: "Analog counting",
                    // });
                    return API.pollCeleryResult(json);
                })
                .then((output) => {
                    if (output.success) {
                        this.$bvToast.toast("Analog counting job complete! Refresh the page to view updated results.", {
                            title: "Analog counting",
                            noAutoHide: true,
                        });
                    } else {
                        this.$bvToast.toast(`Analog counting job failed: ${output.error}`, {
                            title: "Analog counting",
                            noAutoHide: true,
                        });
                    }
                })
                .catch(() => {
                    this.$bvToast.toast("Analog counting job failed! Please try again or try submitting a new tree builder job.", {
                        title: "Analog counting",
                        noAutoHide: true,
                    });
                })
                .finally(() => {
                    this.analysisTaskRunning = false;
                });
        },
        runReactionClassification() {
            if (this.analysisTaskRunning) {
                alert("An analysis task is already running. Please wait until it finishes before submitting another.");
            }
            if (!confirm("This will start a reaction classification job for this result. If you stay on this page, you will receive a notification once the job is complete.")) {
                return;
            }
            const url = `/api/tree-analysis/controller/call-async`;
            const body = {
                result_id: this.resultsStore.savedResultInfo.id,
                task: "reaction_classification",
            };
            API.post(url, body)
                .then((json) => {
                    this.$bvToast.toast("Reaction classification job submitted!", {
                        title: "Reaction classification",
                    });
                    return API.pollCeleryResult(json.task_id);
                })
                .then((output) => {
                    if (output.success) {
                        this.$bvToast.toast("Reaction classification job complete! Refresh the page to view updated results.", {
                            title: "Reaction classification",
                            noAutoHide: true,
                        });
                    } else {
                        this.$bvToast.toast(`Reaction classification job failed: ${output.error}`, {
                            title: "Reaction classification",
                            noAutoHide: true,
                        });
                    }
                })
                .catch(() => {
                    this.$bvToast.toast("Reaction classification job failed! Please try again or try submitting a new tree builder job.", {
                        title: "Reaction classification",
                        noAutoHide: true,
                    });
                });
        },
        runGraphOptimization() {
            if (
                !confirm(
                    "This will start a network optimization job for this result. Please note that this analysis will take a long time and depends on the number of reactions in the full reaction network. If you stay on this page, you will receive a notification once the job is complete."
                )
            ) {
                return;
            }
            const url = `/api/v2/optimization/`;
            const body = {
                smiles: this.esultsStore.savedResultInfo.smiles,
                result_id: this.resultsStore.savedResultInfo.id,
            };
            let resultId = "";
            API.post(url, body)
                .then((json) => {
                    this.$bvToast.toast("Network optimization job submitted!", {
                        title: "Network optimization",
                    });
                    resultId = json.task_id;
                    return API.pollCeleryResult(json.task_id);
                })
                .then(() => {
                    this.$bvToast.toast("Network optimization job complete! Click here to view results.", {
                        title: "Network optimization",
                        href: `/retro/network/?tab=2&id=${resultId}`,
                        noAutoHide: true,
                    });
                })
                .catch(() => {
                    this.$bvToast.toast("Network optimization job failed! Please try again or try submitting a new tree builder job.", {
                        title: "Network optimization",
                        noAutoHide: true,
                    });
                });
        },
        runPmiCalculation(selectedTree = false) {
            if (this.analysisTaskRunning) {
                alert("An analysis task is already running. Please wait until it finishes before submitting another.");
            }
            if (
                !confirm(
                    "This will start a PMI calculation job for this result. Please note that this analysis will take a long time and depends on the number of trees and reactions. If you stay on this page, you will receive a notification once the job is complete."
                )
            ) {
                return;
            }

            let selectTreeIdx = -1;
            if (selectedTree) {
                selectTreeIdx = this.allTrees.indexOf(this.currentTree);
            }

            const url = `/api/tree-analysis/controller/call-async`;
            const body = {
                result_id: this.resultsStore.savedResultInfo.id,
                task: "pmi_calculation",
                index: selectTreeIdx,
            };
            API.post(url, body)
                .then((json) => {
                    // this.$bvToast.toast("PMI job submitted!", {
                    //     title: "pmi_calculation",
                    // });
                    return API.pollCeleryResult(json);
                })
                .then(() => {
                    this.$bvToast.toast("PMI calculation job is complete! Refresh the page to view updated results.", {
                        title: "pmi calculation",
                        noAutoHide: true,
                    });
                })
                .catch(() => {
                    this.$bvToast.toast("PMI calculation job failed! Please try again or try submitting a new tree builder job.", {
                        title: "PMI calculation",
                        noAutoHide: true,
                    });
                });
        },
        num2str,
    },
    watch: {
        allTrees(newVal) {
            if (newVal.length) {
                this.initializeFilterData();
            }
        },
        cluster() {
            this.currentClusterId = this.minClusterId;
            this.currentTreeId = 0;
        },
        currentTree(newVal) {
            if (newVal) {
                this.buildTree();
            } else {
                this.network.destroy();
            }
        },
        tabActive(newVal) {
            if (newVal) {
                // this.init();
            }
        },
        trees() {
            this.currentTreeId = 0;
        },
        treeListItems() {
            if (this.showListView) {
                // Build vis-networks on next tick to allow v-for divs to be created first
                this.$nextTick(this.buildTreeList);
            }
        },
    },
};
</script>
  
<style>
#graph {
    width: 100%;
    height: calc(100vh - 20.5rem);
    border: 1px solid lightgray;
}

#tree-data-overlay {
    position: absolute;
    top: 2px;
    left: 2px;
    padding: 0.5rem;
    background-color: rgba(255, 255, 255, 0.8);
}

.list-view-tree {
    height: 300px;
    border: 1px solid lightgray;
}

.vis-tooltip {
    background-color: #eee !important;
    font-family: unset !important;
    text-align: center !important;
}
</style>
  