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
                            <v-container fluid>
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
                                                                                    density="compact" icon="mdi-close"
                                                                                    color="red"
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
                                                                :model-value="strategy.max_cum_prob"
                                                                hide-details></v-text-field>
                                                        </setting-input>
                                                    </div>
                                                </v-card-text>
                                            </v-card>
                                        </div>
                                    </div>
                                </div>
                                <setting-input label="Precursor scoring" label-for="precursorScoring"
                                    help-text="This settings changes how the precursors are ranked by the server. Results can also be re-ordered dynamically as explained in the tutorial.">
                                    <v-select :model-value="precursorScoring" :items="precursorScoringItems"
                                        variant="outlined" class="my-5" hide-details></v-select>
                                </setting-input>
                                <setting-input label="Min. plausibility" label-for="minPlausibility"
                                    help-text="This is the minimum plausibility that a predictor transformation must receive from the Fast Filter model in order to be kept and returned as a result.
        The plausibility score can help filter out bad suggestions, but in some cases can be over conservative and filter out false negatives.">
                                    <!-- <b-form-input id="minPlausibility" size="sm" type="number" min="0" max="1"
                                        step="0.000001" v-model.number="minPlausibility"></b-form-input> -->
                                </setting-input>
                                <setting-input label="Regio-selectivity model" label-for="selectivityModel"
                                    help-text="This setting changes the regioselectivity model used to predict product probabilities.">
                                    <!-- <b-form-select id="selectivityModel" size="sm" v-model="selectivityModel">
                                        <b-form-select-option value="qm_GNN">QM-WLN</b-form-select-option>
                                        <b-form-select-option value="GNN">WLN</b-form-select-option>
                                    </b-form-select> -->
                                </setting-input>
                                <setting-input label="Apply regio-selectivity checking"
                                    help-text="When enabled, will automatically identify reactions which have potential regio-selectivity considerations.">
                                    <!-- <b-checkbox id="checkSelec" v-model="allowSelec" class="col-form-label" switch>
                                        <span class="sr-only">Apply regio-selectivity checking</span>
                                    </b-checkbox> -->
                                </setting-input>

                            </v-container>
                        </v-window-item>
                        <v-window-item value="mctsTB">
                            <v-container fluid>
                                <h5>MCTS algorithm options</h5>
                                <div v-show="tbVersion > 1000">
                                    <p>
                                        <em>
                                            Note: The C++ tree builder is still experimental and many features are not
                                            supported yet. Template prioritizer settings above do not apply for the C++ tree
                                            builder, except for max.
                                            cum. prob. and min. plausibility. Setting max iterations to 2000 is recommended
                                            as a starting point.
                                        </em>
                                    </p>
                                </div>
                                <setting-input label="Tree builder version" label-for="tbVersion"
                                    help-text="Which tree builder algorithm to use.">
                                    <!-- <b-form-select id="tbVersion" size="sm" v-model.number="tbVersion">
                                        <b-form-select-option value="1">v1</b-form-select-option>
                                        <b-form-select-option value="2">v2</b-form-select-option>
                                        <b-form-select-option value="1001">C++ v1 (experimental)</b-form-select-option>
                                    </b-form-select> -->
                                </setting-input>
                                <setting-input label="Expansion time (seconds)" label-for="expansionTime"
                                    help-text="This is how long the server is allowed to search for template applications.
        It is roughly how long it will take for results to be returned, however there is an additional pathway resolution step following expansion that may take some time as well.">
                                    <!-- <b-form-input id="expansionTime" size="sm" type="number" min="1" max="300" step="1"
                                        v-model.number="expansionTime"></b-form-input> -->
                                </setting-input>
                                <setting-input label="Maximum iterations" label-for="maxIterations"
                                    help-text="This is how many iterations the MCTS algorithm is allowed to perform before returning results.">
                                    <!-- <b-form-input id="maxIterations" size="sm" type="number" min="1" step="1"
                                        v-model.number="maxIterations"></b-form-input> -->
                                </setting-input>
                                <setting-input v-if="tbVersion < 1000" label="Maximum chemicals" label-for="maxChemicals"
                                    help-text="This is how many chemicals the MCTS algorithm is allowed to explore before returning results.">
                                    <!-- <b-form-input id="maxChemicals" size="sm" type="number" min="1" step="1"
                                        v-model.number="maxChemicals"></b-form-input> -->
                                </setting-input>
                                <setting-input v-if="tbVersion < 1000" label="Maximum reactions" label-for="maxReactions"
                                    help-text="This is how many reactions the MCTS algorithm is allowed to explore before returning results.">
                                    <!-- <b-form-input id="maxReactions" size="sm" type="number" min="1" step="1"
                                        v-model.number="maxReactions"></b-form-input> -->
                                </setting-input>
                                <setting-input v-if="tbVersion < 1000" label="Maximum templates" label-for="maxTemplates"
                                    help-text="This is how many template applications the MCTS algorithm is allowed to try before returning results.">
                                    <!-- <b-form-input id="maxTemplates" size="sm" type="number" min="1" step="1"
                                        v-model.number="maxTemplates"></b-form-input> -->
                                </setting-input>
                                <setting-input label="Max expansion depth" label-for="maxDepth"
                                    help-text="This is the maximum depth (or number of steps) for any given reaction pathway return by the search algorithm.">
                                    <!-- <b-form-input id="maxDepth" size="sm" type="number" min="1" max="9" step="1"
                                        v-model.number="maxDepth"></b-form-input> -->
                                </setting-input>
                                <setting-input label="Max branching" label-for="maxBranching"
                                    help-text="This is the maximum branching for any given chemical in the reaction tree/graph.
        Once this maximum branching factor is reached, no more template applications will be attempted for that chemical during the search.">
                                    <!-- <b-form-input id="maxBranching" size="sm" type="number" min="1" max="50" step="1"
                                        v-model.number="maxBranching"></b-form-input> -->
                                </setting-input>
                                <h5>Terminal chemical criteria</h5>
                                <template v-if="tbVersion < 1000">
                                    <p>
                                        The following options allow you to set additional criteria to be used in determining
                                        whether a precursor is terminal. All AND criteria must be satisfied simultaneously.
                                        Any OR criteria
                                        are sufficient on their own.
                                    </p>
                                    <setting-input label="Buyables sources"
                                        help-text="Restrict buyables database lookup to specific sources. Note that this also applies to one-step predictions.">
                                        <!-- <b-dropdown variant="outline-secondary" size="sm" block
                                            :text="buyablesSourceDisplay">
                                            <b-dropdown-form>
                                                <b-form-checkbox v-model="buyablesSourceAll"
                                                    @change="buyablesSource = []">All</b-form-checkbox>
                                                <b-form-checkbox v-for="source in buyablesSources" v-model="buyablesSource"
                                                    :key="source" :value="source" :disabled="buyablesSourceAll">
                                                    {{ source === NO_SOURCE ? NO_SOURCE_TEXT : source }}
                                                </b-form-checkbox>
                                            </b-dropdown-form>
                                        </b-dropdown> -->
                                    </setting-input>
                                    <setting-input label="Buyability logic" label-for="buyableLogic"
                                        help-text="Sets the logic type for considering buyability. This only checks for existence in the buyables database and does not consider price.">
                                        <!-- <b-form-select id="buyableLogic" size="sm" :options="logicOptions"
                                            v-model="buyableLogic"></b-form-select> -->
                                    </setting-input>
                                    <setting-input label="Chemical price logic" label-for="ppgLogic"
                                        help-text="Sets the logic type for considering max chemical price.">
                                        <!-- <b-form-select id="ppgLogic" size="sm" :options="logicOptions"
                                            v-model="maxPPGLogic"></b-form-select> -->
                                    </setting-input>
                                    <setting-input v-if="maxPPGLogic !== 'none'" label="Max chemical price ($/g)"
                                        label-for="maxPPG"
                                        help-text="This is the maximum price below which a precursor will be considered terminal in the MCTS search."
                                        class="ml-3">
                                        <!-- <b-form-input id="maxPPG" size="sm" type="number"
                                            v-model.number="maxPPG"></b-form-input> -->
                                    </setting-input>
                                    <setting-input label="Chemical SCScore logic" label-for="scscoreLogic"
                                        help-text="Sets the logic type for considering max synthetic complexity score.">
                                        <!-- <b-form-select id="scscoreLogic" size="sm" :options="logicOptions"
                                            v-model="maxScscoreLogic"></b-form-select> -->
                                    </setting-input>
                                    <setting-input v-if="maxScscoreLogic !== 'none'" label="Max chemical SCScore (1-5)"
                                        label-for="maxScscore" help-text="This is the maximum synthetic complexity score below which a precursor will be considered terminal in the MCTS search.
        Values range from 1-5, with 5 being most synthetically complex." class="ml-3">
                                        <!-- <b-form-input id="maxScscore" size="sm" type="number" min="1" max="5"
                                            v-model.number="maxScscore"></b-form-input> -->
                                    </setting-input>
                                    <setting-input label="Chemical property logic" label-for="chemPropLogic"
                                        help-text="Sets the logic type for considering maximum chemical size in terms of element counts.">
                                        <!-- <b-form-select id="chemPropLogic" size="sm" :options="logicOptions"
                                            v-model="chemicalPropertyLogic"></b-form-select> -->
                                    </setting-input>
                                    <setting-input v-if="chemicalPropertyLogic !== 'none'" label="Max atoms"
                                        help-text="This is the maximum number of each element below which a precursor will be considered terminal in the MCTS search."
                                        class="ml-3">
                                        <!-- <b-form-group label-cols="auto" label-for="chemPropC">
                                            <template #label>C &le;</template>
                                            <b-form-input id="chemPropC" size="sm" type="number" min="1" step="1"
                                                v-model.number="chemicalPropertyC"></b-form-input>
                                        </b-form-group>
                                        <b-form-group label-cols="auto" label-for="chemPropN">
                                            <template #label>N &le;</template>
                                            <b-form-input id="chemPropN" size="sm" type="number" min="1" step="1"
                                                v-model.number="chemicalPropertyN"></b-form-input>
                                        </b-form-group>
                                        <b-form-group label-cols="auto" label-for="chemPropO">
                                            <template #label>O &le;</template>
                                            <b-form-input id="chemPropO" size="sm" type="number" min="1" step="1"
                                                v-model.number="chemicalPropertyO"></b-form-input>
                                        </b-form-group>
                                        <b-form-group label-cols="auto" label-for="chemPropH">
                                            <template #label>H &le;</template>
                                            <b-form-input id="chemPropH" size="sm" type="number" min="1" step="1"
                                                v-model.number="chemicalPropertyH"></b-form-input>
                                        </b-form-group> -->
                                    </setting-input>
                                    <setting-input label="Chemical popularity logic" label-for="chemPopLogic"
                                        help-text="Sets the logic type for considering the number of times a chemical appeared in the training data for the template relevance machine learning model.">
                                        <!-- <b-form-select id="chemPopLogic" size="sm" :options="logicOptions"
                                            v-model="chemicalPopularityLogic"></b-form-select> -->
                                    </setting-input>
                                    <setting-input v-if="chemicalPopularityLogic !== 'none'" label="Min occurrences"
                                        help-text="This is the minimum number of prior occurrences above which a precursor will be considered terminal in the MCTS search."
                                        class="ml-3">
                                        <!-- <b-form-group label-cols="auto" label-for="chemPopR">
                                            <template #label>As reactant &ge;</template>
                                            <b-form-input id="chemPopR" size="sm" type="number" min="1" step="1"
                                                v-model.number="chemicalPopularityReactants"></b-form-input>
                                        </b-form-group>
                                        <b-form-group label-cols="auto" label-for="chemPopP">
                                            <template #label>As product &ge;</template>
                                            <b-form-input id="chemPopP" size="sm" type="number" min="1" step="1"
                                                v-model.number="chemicalPopularityProducts"></b-form-input>
                                        </b-form-group> -->
                                    </setting-input>
                                </template>
                                <div v-else>
                                    <p>
                                        <em>Terminal chemical criteria cannot be adjusted for the C++ tree builder
                                            currently.</em>
                                    </p>
                                </div>
                                <h5>Pathway clustering options</h5>
                                <template v-if="tbVersion < 1000">
                                    <setting-input label="Cluster pathways"
                                        help-text="This setting toggles whether or not clustering is performed for pathways found by the tree builder.">
                                        <!-- <b-checkbox id="clusterTrees" v-model="pathClusterEnabled" class="col-form-label"
                                            switch>
                                            <span class="sr-only">Cluster pathways</span>
                                        </b-checkbox> -->
                                    </setting-input>
                                    <setting-input label="Pathway clustering algorithm" label-for="pathClusterMethod"
                                        help-text="Sets the clustering algorithm to use for pathway clustering.">
                                        <!-- <b-form-select id="pathClusterMethod" size="sm" v-model="pathClusterMethod">
                                            <b-form-select-option value="hdbscan">hdbscan</b-form-select-option>
                                            <b-form-select-option value="kmeans">kmeans</b-form-select-option>
                                        </b-form-select> -->
                                    </setting-input>
                                    <setting-input v-show="pathClusterMethod === 'hdbscan'" label="Min. cluster size"
                                        label-for="pathClusterMinSize"
                                        help-text="This is the min_cluster_size parameter for the hdbscan algorithm.">
                                        <!-- <b-form-input id="pathClusterMinSize" size="sm" type="number" min="1" max="100"
                                            step="1" v-model.number="pathClusterMinSize"></b-form-input> -->
                                    </setting-input>
                                    <setting-input v-show="pathClusterMethod === 'hdbscan'" label="Min. samples"
                                        label-for="pathClusterMinSamples"
                                        help-text="This is the min_samples parameter for the hdbscan algorithm.">
                                        <!-- <b-form-input id="pathClusterMinSamples" size="sm" type="number" min="1" max="100"
                                            step="1" v-model.number="pathClusterMinSamples"></b-form-input> -->
                                    </setting-input>
                                </template>
                                <div v-else>
                                    <p>
                                        <em>Pathway clustering is not available for the C++ tree builder currently.</em>
                                    </p>
                                </div>
                                <h5>Result output options</h5>
                                <setting-input v-show="tbVersion < 1000" label="Return ASAP"
                                    help-text="This setting will make the tree search algorithm terminate upon finding any pathway with terminal nodes that meet the stopping criteria (price, and or property/popularity logic).">
                                    <!-- <b-checkbox id="returnFirst" v-model="returnFirst" class="col-form-label" switch>
                                        <span class="sr-only">Return ASAP</span>
                                    </b-checkbox> -->
                                </setting-input>
                                <setting-input label="Maximum pathways to return" label-for="maxTrees"
                                    help-text="This allows limiting how many pathways are returned by the tree builder. Note that the cutoff is checked during depth-first pathway enumeration, so there is no guarantee on which pathways are returned.">
                                    <!-- <b-form-input id="maxTrees" size="sm" type="number" min="1" step="1"
                                        v-model.number="maxTrees"></b-form-input> -->
                                </setting-input>
                                <setting-input label="Classify reactions"
                                    help-text="This setting toggles whether or not to predict reaction classes for all reactions explored by the tree builder.
        Predicting reaction classes provides additional data for filtering trees, but takes more time (~0.1s per reaction).">
                                    <!-- <b-checkbox id="classifyReactions" v-model="classifyReactions" class="col-form-label"
                                        switch>
                                        <span class="sr-only">classifyReactions</span>
                                    </b-checkbox> -->
                                </setting-input>
                                <setting-input label="Redirect to IPP results view"
                                    help-text="This setting allows you to redirect to the entire graph visualization of the tree builder results in this IPP interface instead of the pathway visualization page that lets you view individual pathways one at a time.">
                                    <!-- <b-checkbox id="redirectToGraph" v-model="redirectToGraph" class="col-form-label"
                                        switch>
                                        <span class="sr-only">Redirect to IPP results view</span>
                                    </b-checkbox> -->
                                </setting-input>

                            </v-container>
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
            precursorScoringItems: [
                { title: "Relevance Heuristic", value: "relevance_heuristic" },
                { title: "SCScore", value: "scscore" }
            ]
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
                return this.settingsStore.interactive_path_planner_settings.fast_filter_threshold;
            },
            set(value) {
                this.settingsStore.interactive_path_planner_settings.fast_filter_threshold = value;
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
                return this.settingsStore.interactive_path_planner_settings.retro_backend_options;
            },
            set(value) {
                this.settingsStore.interactive_path_planner_settings.retro_backend_options = value;
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
                return this.settingsStore.interactive_path_planner_settings.retro_rerank_backend;
            },
            set(value) {
                this.settingsStore.interactive_path_planner_settings.retro_rerank_backend = value;
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
        API.get("/api/admin/get-backend-status").then((json) => {
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
  