<template>
    <v-dialog id="settings-modal" scrollable v-model="showSettings" width="900px" @close="clearEmit">
        <v-card>
            <v-card-title>Strategy Settings</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <div class="d-flex flex-row">
                    <v-tabs v-model="tab" direction="vertical" color="primary" density="compact" bg-color="#F5F5F5"
                        class="mr-2">
                        <v-tab value="general">
                            <v-icon start>
                                mdi-cog
                            </v-icon>
                            General
                        </v-tab>
                        <v-tab value="mctsTB">
                            <v-icon start>
                                mdi-factory
                            </v-icon>
                            MCTS Tree Builder
                        </v-tab>
                        <v-tab value="IPPC">
                            <v-icon start>
                                mdi-group
                            </v-icon>
                            IPP Clustering
                        </v-tab>
                        <v-tab value="graphVis">
                            <v-icon start>
                                mdi-graph
                            </v-icon>
                            Graph Visualization
                        </v-tab>
                    </v-tabs>
                    <v-window v-model="tab" style="width:100%">
                        <v-window-item value="general">
                            <v-container fluid class="">
                                <setting-input v-if="enableResolver" label="Enable PubChem name resolver" help-text="When enabled, any input that cannot be parsed by RDKit on the ASKCOS server will be sent to the
        PubChem Power User Gateway API to resolve a common name (i.e. - fluconazole) to a SMILES string.">
                                    <v-switch label="" v-model="allowResolve" id="allowResolve" hide-details></v-switch>
                                </setting-input>
                                <setting-input label="Highlight changed atoms"
                                    help-text="When enabled, chemical structure images will highlight the atoms involved in a transformation.">
                                    <v-switch label="" v-model="isHighlightAtom" id="checkHighlight"
                                        hide-details></v-switch>
                                </setting-input>
                                <setting-input label="Align node images to target"
                                    help-text="When enabled, ASKCOS will attempt to align chemical node drawings to the target molecule in the graph visualization.">
                                    <v-switch label="" v-model="alignNodeImagesToTarget" id="alignMols"
                                        hide-details></v-switch>
                                </setting-input>
                                <setting-input label="Align precursors to product"
                                    help-text="When enabled, ASKCOS will attempt to align reactants to products for precursors and reaction drawings.">
                                    <v-switch label="" v-model="alignPrecursorsToProduct" id="alignRxns"
                                        hide-details></v-switch>
                                </setting-input>
                                <setting-input label="Top-N result to add to graph" label-for="reactionLimit"
                                    help-text="This number of results from each one-step prediction will automatically be added to the graph visualization.
        In some circumstances, it may be advantageous to add 0 results automatically, and manually choose which to add from the list on the right.">
                                    <v-text-field label="" id="reactionLimit" v-model.number="reactionLimit" type="number"
                                        variant="outlined" density="compact" hide-details></v-text-field>
                                </setting-input>
                                <setting-input label="Strategy Plan" help-text="Tell which strategy to use" class="my-5">
                                    <v-btn variant="flat" @click="addStrategy"> Add <i class="fas fa-plus"></i>
                                    </v-btn>
                                </setting-input>
                                <div class="ml-3">
                                    <div v-if="strategies.length !== 0">
                                        <div v-for="(strategy, idx) in strategies" v-bind:key="idx">
                                            <v-card variant="outlined" class="mb-2" :key="idx">
                                                <v-card-title>
                                                    <v-row>
                                                        <v-col cols="10">
                                                            <span class="text-subtitle-1">{{ "Strategy " + (idx + 1)
                                                            }}</span>
                                                        </v-col>
                                                        <v-col cols="2">
                                                            <v-btn icon="mdi-close" variant="plain" density="compact"
                                                                color="red" @click="deleteStrategy(idx)"></v-btn>
                                                        </v-col>
                                                    </v-row>
                                                </v-card-title>
                                                <v-divider></v-divider>
                                                <v-card-text class="pa-6">
                                                    <setting-input label="Model"
                                                        help-text="Select model to use for this strategy" class="mb-2">
                                                        <v-select :items="models" variant="outlined" density="compact"
                                                            hide-details v-model="strategy.model"></v-select>
                                                    </setting-input>
                                                    <setting-input v-if="strategy.model !== 'template_relevance'"
                                                        label="Training Set"
                                                        help-text="By specifiying this you can change the type of the model used for prediction"
                                                        class="mb-2">
                                                        <v-select density="compact" hide-details
                                                            @input="($event) => updateStrategy(idx, 'trainingSet', $event)"
                                                            :value="strategy.trainingSet" variant="outlined">
                                                            <!-- <b-form-select-option
                                                                v-for="trainingSet in trainingSets(strategy.model)"
                                                                :value="trainingSet" :key="trainingSet">{{ trainingSet
                                                                }}</b-form-select-option> -->
                                                        </v-select>
                                                    </setting-input>
                                                    <div v-else class="mt-4">
                                                        <setting-input label="Template prioritizers" help-text="Specify the template prioritizers you wish to use for one-step retro predictions.
                          If multiple prioritizers are selected, their predictions will be combined.
                          All prioritizers selected here are subject to the remaining template options.">
                                                            <v-btn @click="addTemplatePrioritizer(idx)"> Add <i
                                                                    class="fas fa-plus"></i> </v-btn>
                                                        </setting-input>
                                                        <div class="ml-3 mt-6">
                                                            <table class="table table-borderless table-sm"
                                                                style="table-layout: fixed; width:100%">
                                                                <thead>
                                                                    <tr>
                                                                        <td style="width: 10%"></td>
                                                                        <td style="width: 54%">
                                                                            Template Set
                                                                            <i v-b-tooltip class="fas fa-info-circle mr-1"
                                                                                title="The source of the template set data for the template prioritizer model, depending on what models are available."></i>
                                                                        </td>
                                                                        <td style="width: 27%">
                                                                            Version
                                                                            <i v-b-tooltip class="fas fa-info-circle mr-1"
                                                                                title="The version of template prioritizer model, depending on what models are available."></i>
                                                                        </td>
                                                                        <td style="width: 9%"></td>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <!-- eslint-disable-next-line vue/no-v-for-template-key -->
                                                                    <template
                                                                        v-for="(prioritizer, pIdx) in strategy.templatePrioritizers"
                                                                        :key="pIdx">
                                                                        <tr class="border-top">
                                                                            <td class="align-middle">{{ pIdx + 1 }}</td>
                                                                            <td>
                                                                                <v-select class="mr-2" density="compact"
                                                                                    variant="outlined"
                                                                                    :items="Object.keys(templateSets).filter((key) => templateSets[key].length)"
                                                                                    :model-value="prioritizer.template_set"
                                                                                    @update:modelValue="resetTemplateSetVersion(idx, pIdx, $event)"
                                                                                    hide-details>
                                                                                </v-select>
                                                                            </td>
                                                                            <td>
                                                                                <v-select class="mr-2" density="compact"
                                                                                    variant="outlined"
                                                                                    :items="templateSets[prioritizer.template_set]"
                                                                                    :value="prioritizer.version"
                                                                                    @input="updateTemplatePrioritizer(idx, pIdx, 'version', $event)"
                                                                                    hide-details>
                                                                                </v-select>
                                                                            </td>
                                                                            <td>
                                                                                <v-btn size="small" density="compact"
                                                                                    variant="plain"
                                                                                    @click="deleteTemplatePrioritizer(idx, pIdx)"
                                                                                    icon="mdi-close">
                                                                                </v-btn>
                                                                            </td>
                                                                        </tr>
                                                                        <tr v-if="templateAttributes && templateAttributes[prioritizer.template_set] && templateAttributes[prioritizer.template_set].length"
                                                                            :key="`p-${pIdx}-t`">
                                                                            <td></td>
                                                                            <td class="align-middle">
                                                                                Template attribute filters
                                                                                <i class="fas fa-info-circle mr-1" title="Filter templates based on pre-computed attributes prior to application to the target molecule.
                                    Max. num. templates. and Max cum. prob. are applied after filtering."></i>
                                                                            </td>
                                                                            <td>
                                                                                <v-btn variant="link" size="sm"
                                                                                    @click="addAttributeFilter(idx, pIdx)">
                                                                                    Add <i class="fas fa-plus"></i>
                                                                                </v-btn>
                                                                            </td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr v-if="prioritizer.attribute_filter && prioritizer.attribute_filter.length"
                                                                            :key="`p-${pIdx}-f`">
                                                                            <td></td>
                                                                            <td colspan="3" class="p-0">
                                                                                <table
                                                                                    class="table table-borderless table-sm m-0"
                                                                                    style="table-layout: fixed">
                                                                                    <tbody>
                                                                                        <tr v-for="(filter, afIdx) in prioritizer.attribute_filter"
                                                                                            :key="`p-${idx}-${pIdx}-f-${afIdx}`">
                                                                                            <td style="width: 30%">
                                                                                                <b-form-select class="mr-2"
                                                                                                    size="sm"
                                                                                                    :options="templateAttributes[strategy.templatePrioritizers[pIdx]['template_set']]"
                                                                                                    :value="filter.name"
                                                                                                    @input="updateAttributeFilter(idx, pIdx, afIdx, 'name', $event)">
                                                                                                </b-form-select>
                                                                                            </td>
                                                                                            <td style="width: 30%">
                                                                                                <b-form-select class="mr-2"
                                                                                                    size="sm"
                                                                                                    :value="filter.logic"
                                                                                                    @input="updateAttributeFilter(idx, pIdx, afIdx, 'logic', $event)">
                                                                                                    <b-form-select-option
                                                                                                        value=">">&gt;</b-form-select-option>
                                                                                                    <b-form-select-option
                                                                                                        value=">=">&ge;</b-form-select-option>
                                                                                                    <b-form-select-option
                                                                                                        value="<">&lt;</b-form-select-option>
                                                                                                    <b-form-select-option
                                                                                                        value="<=">&le;</b-form-select-option>
                                                                                                    <b-form-select-option
                                                                                                        value="==">=</b-form-select-option>
                                                                                                </b-form-select>
                                                                                            </td>
                                                                                            <td style="width: 30%">
                                                                                                <b-form-input class="mr-2"
                                                                                                    size="sm" type="number"
                                                                                                    :value="filter.value"
                                                                                                    @input="updateAttributeFilter(idx, pIdx, afIdx, 'value', $event)"></b-form-input>
                                                                                            </td>
                                                                                            <td style="width: 10%">
                                                                                                <b-button variant="link"
                                                                                                    size="sm"
                                                                                                    class="text-danger"
                                                                                                    @click="deleteAttributeFilter(idx, pIdx, afIdx)">
                                                                                                    <i
                                                                                                        class="fas fa-times"></i>
                                                                                                </b-button>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </template>
                                                                </tbody>

                                                            </table>
                                                        </div>
                                                    </div>
                                                </v-card-text>
                                            </v-card>
                                        </div>
                                    </div>
                                </div>
                            </v-container>
                        </v-window-item>
                        <v-window-item value=" mctsTB">
                            <v-card flat>
                                <v-card-text>
                                </v-card-text>
                            </v-card>
                        </v-window-item>
                        <v-window-item value="IPPC">
                            <v-card flat>
                                <v-card-text>
                                </v-card-text>
                            </v-card>
                        </v-window-item>
                        <v-window-item value="graphVis">
                            <v-card flat>
                                <v-card-text>
                                </v-card-text>
                            </v-card>
                        </v-window-item>
                    </v-window>
                </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="tonal" @click="clearEmit">Close</v-btn>
                <v-btn variant="tonal" color="red">Reset</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
  
<script>
import { NO_SOURCE, NO_SOURCE_TEXT } from "@/common/buyables";
import { API } from "@/common/api";
import SettingInput from "./SettingInput";
import { mapStores } from "pinia";
import { useResultsStore } from "@/store/results";
import { useSettingsStore } from "@/store/settings";

export default {
    name: "SettingsModal",
    components: {
        SettingInput,
    },
    props: {
        enableResolver: {
            type: Boolean,
            default: false,
        },
        templateAttributes: {
            type: Object,
            default: () => ({}),
        },
        templateSets: {
            type: Object,
            default: () => ({}),
        },
        visible: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            modelStatus: [],
            templateSetsList: [],
            buyablesSources: [],
            logicOptions: [
                { value: "none", text: "None" },
                { value: "or", text: "Or" },
                { value: "and", text: "And" },
            ],
            NO_SOURCE: NO_SOURCE,
            NO_SOURCE_TEXT: NO_SOURCE_TEXT,
            tab: 'general',
        };
    },
    computed: {
        showSettings: {
            get() {
                return this.visible;
            }
        },
        models() {
            // List of available models for selection
            const models = new Set();
            const types = ["template_prioritizer", "openretro"];
            this.modelStatus
                .filter((item) => types.includes(item["type"]) && item["ready"])
                .forEach((item) => {
                    if (item["name"].startsWith("template_relevance")) {
                        models.add("template_relevance");
                    } else {
                        models.add(item["name"]);
                    }
                });
            return Array.from(models).sort();
        },
        buyablesSourceDisplay() {
            if (this.buyablesSourceAll) {
                return "All";
            } else if (this.buyablesSource.length) {
                return sourceArgsToDisplay(this.buyablesSource);
            } else {
                return "Select Sources";
            }
        },
        allowResolve: {
            get() {
                return this.settingsStore.allowResolve;
            },
            set(value) {
                this.settingsStore.setOption({
                    key: "allowResolve",
                    value: value,
                });
            },
        },
        isHighlightAtom: {
            get() {
                return this.settingsStore.isHighlightAtom;
            },
            set(value) {
                this.settingsStore.setOption({
                    key: "isHighlightAtom",
                    value: value,
                });
            },
        },
        alignNodeImagesToTarget: {
            get() {
                return this.settingsStore.alignNodeImagesToTarget;
            },
            set(value) {
                this.settingsStore.setOption({
                    key: "alignNodeImagesToTarget",
                    value: value,
                });
                this.resutlsStore.updateImageUrls();
            },
        },
        alignPrecursorsToProduct: {
            get() {
                return this.settingsStore.alignPrecursorsToProduct;
            },
            set(value) {
                this.settingsStore.setOption({
                    key: "alignPrecursorsToProduct",
                    value: value,
                });
            },
        },
        reactionLimit: {
            get() {
                return this.settingsStore.reactionLimit;
            },
            set(value) {
                this.settingsStore.setOption({
                    key: "reactionLimit",
                    value: value,
                });
            },
        },
        selectivityModel: {
            get() {
                return this.settingsStore.selectivityModel;
            },
            set(value) {
                this.settingsStore.setOption({
                    key: "selectivityModel",
                    value: value,
                });
            },
        },
        precursorClusterEnabled: {
            get() {
                return this.settingsStore.allowCluster;
            },
            set(value) {
                this.settingsStore.setOption({
                    key: "allowCluster",
                    value: value,
                });
            },
        },
        precursorClusterMethod: {
            get() {
                return this.settingsStore.clusterOptions.cluster_method;
            },
            set(value) {
                this.settingsStore.setClusterOption({
                    key: "cluster_method",
                    value: value,
                });
            },
        },
        precursorClusterFeature: {
            get() {
                return this.settingsStore.clusterOptions.feature;
            },
            set(value) {
                this.settingsStore.setClusterOption({
                    key: "feature",
                    value: value,
                });
            },
        },
        precursorClusterFingerprint: {
            get() {
                return this.settingsStore.clusterOptions.fingerprint;
            },
            set(value) {
                this.settingsStore.setClusterOption({
                    key: "fingerprint",
                    value: value,
                });
            },
        },
        precursorClusterFpBits: {
            get() {
                return this.settingsStore.clusterOptions.fpBits;
            },
            set(value) {
                this.settingsStore.setClusterOption({
                    key: "fpBits",
                    value: value,
                });
            },
        },
        precursorClusterFpRadius: {
            get() {
                return this.settingsStore.clusterOptions.fpRadius;
            },
            set(value) {
                this.settingsStore.setClusterOption({
                    key: "fpRadius",
                    value: value,
                });
            },
        },
        allowSelec: {
            get() {
                return this.settingsStore.tbSettings.allowSelec;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "allowSelec",
                    value: value,
                });
            },
        },
        buyablesSourceAll: {
            get() {
                return this.settingsStore.tbSettings.buyablesSourceAll;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "buyablesSourceAll",
                    value: value,
                });
            },
        },
        buyablesSource: {
            get() {
                return this.settingsStore.tbSettings.buyablesSource;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "buyablesSource",
                    value: value,
                });
            },
        },
        classifyReactions: {
            get() {
                return this.settingsStore.tbSettings.classifyReactions;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "classifyReactions",
                    value: value,
                });
            },
        },
        expansionTime: {
            get() {
                return this.settingsStore.tbSettings.expansionTime;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "expansionTime",
                    value: value,
                });
            },
        },
        maxBranching: {
            get() {
                return this.settingsStore.tbSettings.maxBranching;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "maxBranching",
                    value: value,
                });
            },
        },
        maxChemicals: {
            get() {
                return this.settingsStore.tbSettings.maxChemicals;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "maxChemicals",
                    value: value,
                });
            },
        },
        maxDepth: {
            get() {
                return this.settingsStore.tbSettings.maxDepth;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "maxDepth",
                    value: value,
                });
            },
        },
        maxIterations: {
            get() {
                return this.settingsStore.tbSettings.maxIterations;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "maxIterations",
                    value: value,
                });
            },
        },
        maxReactions: {
            get() {
                return this.settingsStore.tbSettings.maxReactions;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "maxReactions",
                    value: value,
                });
            },
        },
        maxTemplates: {
            get() {
                return this.settingsStore.tbSettings.maxTemplates;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "maxTemplates",
                    value: value,
                });
            },
        },
        maxTrees: {
            get() {
                return this.settingsStore.tbSettings.maxTrees;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "maxTrees",
                    value: value,
                });
            },
        },
        minPlausibility: {
            get() {
                return this.settingsStore.tbSettings.minPlausibility;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "minPlausibility",
                    value: value,
                });
            },
        },
        pathClusterEnabled: {
            get() {
                return this.settingsStore.tbSettings.clusterTrees;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "clusterTrees",
                    value: value,
                });
            },
        },
        pathClusterMethod: {
            get() {
                return this.settingsStore.tbSettings.clusterMethod;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "clusterMethod",
                    value: value,
                });
            },
        },
        pathClusterMinSize: {
            get() {
                return this.settingsStore.tbSettings.clusterMinSize;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "clusterMinSize",
                    value: value,
                });
            },
        },
        pathClusterMinSamples: {
            get() {
                return this.settingsStore.tbSettings.clusterMinSamples;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "clusterMinSamples",
                    value: value,
                });
            },
        },
        strategies: {
            get() {
                return this.settingsStore.tbSettings.strategies;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "strategies",
                    value: value,
                });
            },
        },
        modelSelector: {
            get() {
                return this.settingsStore.tbSettings.model;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "model",
                    value: value,
                });
            },
        },
        trainingSetSelector: {
            get() {
                return this.settingsStore.tbSettings.trainingSet;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "trainingSet",
                    value: value,
                });
            },
        },
        precursorScoring: {
            get() {
                return this.settingsStore.tbSettings.precursorScoring;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "precursorScoring",
                    value: value,
                });
            },
        },
        redirectToGraph: {
            get() {
                return this.settingsStore.tbSettings.redirectToGraph;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "redirectToGraph",
                    value: value,
                });
            },
        },
        returnFirst: {
            get() {
                return this.settingsStore.tbSettings.returnFirst;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "returnFirst",
                    value: value,
                });
            },
        },
        tbVersion: {
            get() {
                return this.settingsStore.tbSettings.version;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "version",
                    value: value,
                });
            },
        },
        buyableLogic: {
            get() {
                return this.settingsStore.tbSettings.buyableLogic;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "buyableLogic",
                    value: value,
                });
            },
        },
        maxPPGLogic: {
            get() {
                return this.settingsStore.tbSettings.maxPPGLogic;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "maxPPGLogic",
                    value: value,
                });
            },
        },
        maxPPG: {
            get() {
                return this.settingsStore.tbSettings.maxPPG;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "maxPPG",
                    value: value,
                });
            },
        },
        maxScscoreLogic: {
            get() {
                return this.settingsStore.tbSettings.maxScscoreLogic;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "maxScscoreLogic",
                    value: value,
                });
            },
        },
        maxScscore: {
            get() {
                return this.settingsStore.tbSettings.maxScscore;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "maxScscore",
                    value: value,
                });
            },
        },
        chemicalPropertyLogic: {
            get() {
                return this.settingsStore.tbSettings.chemicalPropertyLogic;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "chemicalPropertyLogic",
                    value: value,
                });
            },
        },
        chemicalPropertyC: {
            get() {
                return this.settingsStore.tbSettings.chemicalPropertyC;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "chemicalPropertyC",
                    value: value,
                });
            },
        },
        chemicalPropertyN: {
            get() {
                return this.settingsStore.tbSettings.chemicalPropertyN;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "chemicalPropertyN",
                    value: value,
                });
            },
        },
        chemicalPropertyO: {
            get() {
                return this.settingsStore.tbSettings.chemicalPropertyO;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "chemicalPropertyO",
                    value: value,
                });
            },
        },
        chemicalPropertyH: {
            get() {
                return this.settingsStore.tbSettings.chemicalPropertyH;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "chemicalPropertyH",
                    value: value,
                });
            },
        },
        chemicalPopularityLogic: {
            get() {
                return this.settingsStore.tbSettings.chemicalPopularityLogic;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "chemicalPopularityLogic",
                    value: value,
                });
            },
        },
        chemicalPopularityReactants: {
            get() {
                return this.settingsStore.tbSettings.chemicalPopularityReactants;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "chemicalPopularityReactants",
                    value: value,
                });
            },
        },
        chemicalPopularityProducts: {
            get() {
                return this.settingsStore.tbSettings.chemicalPopularityProducts;
            },
            set(value) {
                this.settingsStore.setTbSetting({
                    key: "chemicalPopularityProducts",
                    value: value,
                });
            },
        },
        graphSpringConstant: {
            get() {
                return this.settingsStore.visjsOptions.physics.barnesHut.springConstant;
            },
            set(value) {
                this.settingsStore.setVisSpringConstant(value);
            },
        },
        graphNodeSize: {
            get() {
                return this.settingsStore.visjsOptions.nodes.size;
            },
            set(value) {
                this.settingsStore.setVisNodeSize(value);
            },
        },
        graphNodeFontSize: {
            get() {
                return this.settingsStore.visjsOptions.nodes.font.size;
            },
            set(value) {
                this.settingsStore.setVisNodeFontSize(value);
            },
        },
        graphNodeMass: {
            get() {
                return this.settingsStore.visjsOptions.nodes.mass;
            },
            set(value) {
                this.settingsStore.setVisNodeMass(value);
            },
        },
        graphHierarchicalEnabled: {
            get() {
                return this.settingsStore.visjsOptions.layout.hierarchical.enabled;
            },
            set(value) {
                this.settingsStore.setVisHierachicalEnabled(value);
            },
        },
        graphHierarchicalDirection: {
            get() {
                return this.settingsStore.visjsOptions.layout.hierarchical.direction;
            },
            set(value) {
                this.settingsStore.setVisHierarchicalDirection(value);
            },
        },
        graphHierarchicalLevelSeparation: {
            get() {
                return this.settingsStore.visjsOptions.layout.hierarchical.levelSeparation;
            },
            set(value) {
                this.settingsStore.setVisHierarchicalLevelSeparation(value);
            },
        },
        ...mapStores(useResultsStore, useSettingsStore),
    },
    created() {
        API.get("/api/v2/buyables/sources/").then((json) => {
            this.buyablesSources = json.sources;
        });
        API.get("/api/v2/template/sets/").then((json) => {
            this.templateSetsList = json["template_sets"];
        });
        API.get("/api/v2/status/ml/").then((json) => {
            this.modelStatus = json["models"];
        });
    },
    methods: {
        clearEmit() {
            this.$emit('update:settingsVisible', false);
        },
        trainingSets(model) {
            // List of available training sets based on the selected model
            const sets = new Set();
            this.modelStatus
                .filter((item) => item["name"].startsWith(model) && item["ready"])
                .forEach((item) => {
                    if (model !== "template_relevance" || this.templateSetsList.includes(item["training_set"])) {
                        sets.add(item["training_set"]);
                    }
                });
            return Array.from(sets).sort();
        },
        addAttributeFilter(strategyIndex, prioritizerIndex) {
            console.log("Attr: ", this.templateAttributes);
            console.log("Prior: ", this.templateSets);
            this.settingsStore.addAttributeFilter({
                strategyIndex: strategyIndex,
                prioritizerIndex: prioritizerIndex,
                item: {
                    name: this.templateAttributes[this.strategies[strategyIndex].templatePrioritizers[prioritizerIndex]["template_set"]][0],
                    logic: ">",
                    value: 0.5,
                },
            });
        },
        deleteAttributeFilter(strategyIndex, prioritizerIndex, attrFilterIndex) {
            this.settingsStore.deleteAttributeFilter({
                strategyIndex: strategyIndex,
                prioritizerIndex: prioritizerIndex,
                attrFilteriIndex: attrFilterIndex,
            });
        },
        updateAttributeFilter(strategyIndex, prioritizerIndex, attrFilterIndex, key, value) {
            this.settingsStore.updateAttributeFilter({
                strategyIndex: strategyIndex,
                prioritizerIndex: prioritizerIndex,
                attrFilterIndex: attrFilterIndex,
                key: key,
                value: value,
            });
        },
        addTemplatePrioritizer(strategyIndex) {
            this.settingsStore.addTemplatePrioritizer({
                strategyIndex: strategyIndex,
                item: {
                    template_set: "reaxys",
                    version: 1,
                    attribute_filter: [],
                },
            });
        },
        deleteTemplatePrioritizer(strategyIndex, prioritizerIndex) {
            this.settingsStore.deleteTemplatePrioritizer({
                strategyIndex: strategyIndex,
                prioritizerIndex: prioritizerIndex,
            });
        },
        updateTemplatePrioritizer(strategyIndex, prioritizerIndex, key, value) {
            this.settingsStore.updateTemplatePrioritizer({
                strategyIndex: strategyIndex,
                prioritizerIndex: prioritizerIndex,
                key: key,
                value: value,
            });
        },
        addStrategy() {
            this.settingsStore.addStrategy({
                item: {
                    model: "template_relevance",
                    trainingSet: "",
                    templatePrioritizers: [{ template_set: "reaxys", version: 1, attribute_filter: [] }],
                    numTemplates: 1000,
                    maxCumProb: 0.999,
                },
            });
        },
        deleteStrategy(strategyIndex) {
            this.settingsStore.deleteStrategy({
                strategyIndex: strategyIndex,
            });
        },
        updateStrategy(strategyIndex, key, value) {
            if (key === "numTemplates") {
                value = parseInt(value, 10);
            }
            console.log(typeof value);
            this.settingsStore.updateStrategy({
                strategyIndex: strategyIndex,
                key: key,
                value: value,
            });
        },
        resetSettings() {
            this.settingsStore.resetSettings();
        },
        resetTemplateSetVersion(strategyIndex, prioritizerIndex, value) {
            this.updateTemplatePrioritizer(strategyIndex, prioritizerIndex, 'template_set', value)
            this.updateTemplatePrioritizer(strategyIndex, prioritizerIndex, "version", this.templateSets[value][0]);
            this.updateTemplatePrioritizer(strategyIndex, prioritizerIndex, "attribute_filter", []);
        }
    },
};
</script>
  
<style>
.modal-right {
    margin: 1.75rem 1.75rem 1.75rem auto !important;
}
</style>
  