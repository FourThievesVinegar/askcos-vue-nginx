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
                                                            hide-details :model-value="strategy.retro_backend"
                                                            @update:modelValue="($event) => {
                                                                updateStrategy(idx, 'retro_backend', $event);
                                                                updateStrategy(idx, 'retro_model_name', trainingSets($event)[0]);
                                                            }
                                                                "></v-select>
                                                    </setting-input>
                                                    <setting-input v-if="strategy.retro_backend !== 'template_relevance'"
                                                        label="Training Set"
                                                        help-text="By specifiying this you can change the type of the model used for prediction"
                                                        class="mb-2">
                                                        <v-select density="compact" hide-details
                                                            :model-value="strategy.retro_model_name" variant="outlined"
                                                            @update:modelValue="($event) => updateStrategy(idx, 'retro_model_name', $event)"
                                                            :items="trainingSets(strategy.retro_backend)">
                                                        </v-select>
                                                    </setting-input>
                                                    <div v-else class="mt-4">
                                                        <setting-input label="Template Set" help-text="Specify the template prioritizers you wish to use for one-step retro predictions.
                          If multiple prioritizers are selected, their predictions will be combined.
                          All prioritizers selected here are subject to the remaining template options.">
                                                            <v-select class="mr-2" density="compact" variant="outlined"
                                                                :items="Object.keys(templateSets).filter((key) => templateSets[key].length)"
                                                                :model-value="strategy.retro_model_name"
                                                                @update:modelValue="($event) => updateTemplateSet(idx, $event)"
                                                                hide-details>
                                                            </v-select>
                                                        </setting-input>
                                                        <div
                                                            v-if="templateAttributes && templateAttributes[strategy.retro_model_name] && templateAttributes[strategy.retro_model_name].length">
                                                            <setting-input label="Template attribute filters" help-text="Filter templates based on pre-computed attributes prior to application to the target molecule.
                                    Max. num. templates. and Max cum. prob. are applied after filtering." class="my-5">
                                                                <v-btn variant="link" size="sm"
                                                                    @click="addAttributeFilter(idx)">
                                                                    Add <i class="fas fa-plus"></i>
                                                                </v-btn>
                                                            </setting-input>
                                                            <div
                                                                v-if="strategy.attribute_filter && strategy.attribute_filter.length">
                                                                <table class="table table-borderless table-sm m-0"
                                                                    style="table-layout: fixed">
                                                                    <tbody>
                                                                        <tr v-for="(filter, afIdx) in strategy.attribute_filter"
                                                                            :key="`p-${idx}-f-${afIdx}`">
                                                                            <td style="width: 30%">
                                                                                <v-select class="mr-2" variant="outlined"
                                                                                    density="compact"
                                                                                    :items="templateAttributes[strategy['retro_model_name']]"
                                                                                    :model-value="filter.name"
                                                                                    @update:modelValue="updateAttributeFilter(idx, afIdx, 'name', $event)"
                                                                                    hide-details>
                                                                                </v-select>
                                                                            </td>
                                                                            <td style="width: 30%">
                                                                                <v-select class="mr-2" variant="outlined"
                                                                                    density="compact"
                                                                                    :items="['>', '>=', '&lt;', '&le;', '==']"
                                                                                    :model-value="filter.logic"
                                                                                    @update:modelValue="updateAttributeFilter(idx, afIdx, 'logic', $event)"
                                                                                    hide-details>
                                                                                </v-select>
                                                                            </td>
                                                                            <td style="width: 30%">
                                                                                <v-text-field class="mr-2"
                                                                                    variant="outlined" size="small"
                                                                                    density="compact" type="number"
                                                                                    :model-value="filter.value"
                                                                                    @update:modelValue="updateAttributeFilter(idx, afIdx, 'value', $event)"
                                                                                    hide-details></v-text-field>
                                                                            </td>
                                                                            <td style="width: 10%">
                                                                                <v-btn variant="plain" size="small"
                                                                                    density="compact" icon="mdi-close" color="red"
                                                                                    @click="deleteAttributeFilter(idx, afIdx)">
                                                                                </v-btn>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                        <div class="my-4">
                                                            <p>
                                                                <em>Note: Template attribute filters are not supported
                                                                    by
                                                                    the tree builder.</em>
                                                            </p>
                                                        </div>
                                                        <setting-input label="Max. num. templates"
                                                            label-for="max_num_templates"
                                                            help-text="This is the maximum number of reaction rules/templates to try to apply to your target. Depending on the value of maximum cumulative probability (below), a fewer number of templates may actually be applied.">
                                                            <v-text-field id="max_num_templates" density="compact"
                                                                variant="outlined" type="number"
                                                                @update:modelValue="($event) => updateStrategy(idx, 'max_num_templates', $event)"
                                                                :model-value="strategy.max_num_templates"
                                                                hide-details></v-text-field>
                                                        </setting-input>
                                                        <setting-input label="Max. cum. prob." label-for="max_cum_prob"
                                                            help-text="This is the cumulative template score after which templates will stop being applied to your target.
                            For example, if the sum of the scores of the top two templates exceeds this value, only those two template application results will be returned.
                            For computational efficiency, this value is limited to a maximum value of 0.99999. Please directly use the asynchronous API if you need to apply all templates.">
                                                            <v-text-field id="max_cum_prob" density="compact"
                                                                variant="outlined" type="number" min="0" max="1"
                                                                step="0.000001"
                                                                @update:modelValue="($event) => updateStrategy(idx, 'max_cum_prob', Math.min(0.99999, $event))"
                                                                :model-value="strategy.max_cum_prob" hide-details></v-text-field>
                                                        </setting-input>
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
                <v-btn variant="tonal" color="red" @click="resetSettings">Reset</v-btn>
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
            const models = new Set(this.modelStatus.filter((item) => item.name.startsWith("retro_") && item.ready).map(item => item.name.replace('retro_', '')));
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
        API.get("/api/buyables/sources/").then((json) => {
            this.buyablesSources = json.sources;
        });
        API.get("/api/template/sets").then((json) => {
            this.templateSetsList = json["template_sets"];
        });
        API.get("/api/admin/get_backend_status").then((json) => {
            this.modelStatus = json["modules"];
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
                .filter((item) => item.name.startsWith("retro_" + model) && item.ready)
                .forEach((item) => {
                    if (model !== "retro_template_relevance") {
                        item.available_model_names.forEach((trainingSet) => sets.add(trainingSet))
                    }
                });
            console.log(Array.from(sets).sort())
            return Array.from(sets).sort();
        },
        updateTemplateSet(strategyIndex, value) {
            this.updateStrategy(strategyIndex, 'retro_model_name', value)
            this.updateStrategy(strategyIndex, 'attribute_filter', [])
        },
        addAttributeFilter(strategyIndex) {
            console.log("Attr: ", this.templateAttributes);
            console.log("Prior: ", this.templateSets);
            this.settingsStore.addAttributeFilter({
                strategyIndex: strategyIndex,
                item: {
                    name: this.templateAttributes[this.strategies[strategyIndex]["retro_model_name"]][0],
                    logic: ">",
                    value: 0.5,
                },
            });
        },
        deleteAttributeFilter(strategyIndex, attrFilterIndex) {
            this.settingsStore.deleteAttributeFilter({
                strategyIndex: strategyIndex,
                attrFilteriIndex: attrFilterIndex,
            });
        },
        updateAttributeFilter(strategyIndex, attrFilterIndex, key, value) {
            this.settingsStore.updateAttributeFilter({
                strategyIndex: strategyIndex,
                attrFilterIndex: attrFilterIndex,
                key: key,
                value: value,
            });
        },
        addStrategy() {
            this.settingsStore.addStrategy({
                item: {
                    retro_backend: "template_relevance",
                    retro_model_name: "reaxys",
                    attribute_filter: [],
                    max_num_templates: 1000,
                    max_cum_prob: 0.999,
                },
            });
        },
        deleteStrategy(strategyIndex) {
            this.settingsStore.deleteStrategy({
                strategyIndex: strategyIndex,
            });
        },
        updateStrategy(strategyIndex, key, value) {
            if (key === "max_num_templates") {
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
    },
};
</script>
  
<style>
.modal-right {
    margin: 1.75rem 1.75rem 1.75rem auto !important;
}
</style>
  