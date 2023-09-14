<template>
    <v-container fluid>
        <v-row class="justify-center align-center">
            <v-col cols="12" md="6">
                <v-sheet elevation="2" class="pa-5">
                    <v-text-field id="retro-target" @blur="resolve" @keyup.enter="resolve" v-model="target"
                        density="compact" variant="outlined" label="Target" placeholder="SMILES" type="text" clearable
                        hide-details class="target-input">
                        <template v-slot:append-inner>
                            <v-btn variant="tonal" size="small" prepend-icon="mdi-pencil">Draw</v-btn>
                        </template>
                    </v-text-field>
                    <div v-if="!!target" class="my-3">
                        <smiles-image :smiles="target"></smiles-image>
                    </div>
                    <div class="my-3">
                        <v-select id="retro-model-0" label="Model" :items="models" v-model="settings.model"
                            variant="outlined" density="compact"></v-select>
                        <v-select id="retro-training-set-0" label="Training Set" :items="trainingSets"
                            v-model="settings.trainingSet" variant="outlined" density="compact"></v-select>
                        <v-select id="retro-model-version-0" label="Version" :items="modelVersions"
                            v-model="settings.modelVersion" variant="outlined" density="compact"></v-select>
                    </div>
                    <div class="text-center">
                        <v-btn color="success" @click="runRetro()" :disabled="!target || !validSmiles">Submit</v-btn>
                        <v-btn v-b-modal.retro-advanced-modal variant="secondary" class="ml-2"
                            :disabled="!target || !validSmiles">Advanced...</v-btn>
                    </div>
                </v-sheet>
            </v-col>
            <v-col cols="12" md="6">
                <v-sheet elevation="2" v-if="Object.keys(predictions).length">
                    <v-carousel height="300" hide-delimiters :continuous="false" v-model="carouselSlide">
                        <v-carousel-item v-for="(item, index) in predictions" :key="index">
                            <div class="mx-auto d-flex justify-center align-center" style="height:100%">
                                <v-card width="400" prepend-icon="mdi-cog" variant="outlined">
                                    <template v-slot:title>
                                        <div class="d-flex justify-space-between align-center">
                                            <div v-if="item.edit" style="width:100%" class="mr-2 mt-2 mb-2">
                                                <v-text-field label="Label" v-model="labels[index]" variant="outlined"
                                                    @blur="item.edit = false" @keyup.enter="item.edit = false"
                                                    hide-details></v-text-field>
                                            </div>
                                            <div v-else class="d-flex align-items-baseline">
                                                <h4>{{ labels[index] }}</h4>
                                                <v-icon size="small" icon="mdi mdi-pencil" @click="item.edit = true"
                                                    class="ml-2"></v-icon>
                                            </div>
                                            <v-progress-circular v-if="item.loading" color="primary" indeterminate
                                                :width="5"></v-progress-circular>
                                        </div>
                                    </template>
                                    <v-card-text>
                                        <v-table>
                                            <thead>
                                                <tr>
                                                    <th class="text-left">
                                                        Model
                                                    </th>
                                                    <th class="text-left">
                                                        Training Set
                                                    </th>
                                                    <th class="text-left">
                                                        Model Version
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>{{ item.model }}</td>
                                                    <td>{{ item.trainingSet }}</td>
                                                    <td>{{ item.modelVersion }}</td>
                                                </tr>
                                            </tbody>
                                        </v-table>
                                        <div class="d-flex justify-space-between align-center">
                                            <v-checkbox-btn v-model="item.show" label="Show in Table"></v-checkbox-btn>
                                            <v-btn v-if="item.model === 'template_relevance'" variant="plain"
                                                @click="viewSettings(item)">View all settings</v-btn>
                                            <v-btn variant="tonal" density="compact" color="error"
                                                @click="deleteResult(index)" icon="mdi-delete"></v-btn>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </div>
                        </v-carousel-item>
                    </v-carousel>
                    <div class="d-flex justify-end pa-3">
                        <v-btn variant="tonal" class="justify-end" @click="clear()">Clear All</v-btn>
                    </div>
                </v-sheet>
                <v-sheet elevation="2" class="d-flex justify-center align-center flex-column text-center pa-5" v-else>
                    <v-img :width="400" cover :src="emptyVoid" class="mb-3"></v-img>
                    <h2>No Predictions</h2>
                    <p class="text-body-1">Begin by running a new prediction on the left!</p>
                </v-sheet>
            </v-col>
        </v-row>
        <v-row v-if="Object.keys(results).length">
            <v-col cols="12">
                <v-sheet elevation="2">
                    <v-data-table v-model:items-per-page="itemsPerPage" :headers="headers" :items="desserts"
                        item-value="name" class="elevation-1"></v-data-table>
                </v-sheet>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, nextTick } from "vue";
import KetcherModal from "@/components/KetcherModal";
import SmilesImage from "@/components/SmilesImage";
//   import SettingInput from "@/components/SettingInput";
import CopyTooltip from "@/components/CopyTooltip";
import { API } from "@/common/api";
import { resolveChemName } from "@/common/resolver";
import { num2str } from "@/common/utils";
import { useSettingsStore } from "@/store/settings";
import emptyVoid from "@/assets/void.svg";

const defaultSettings = {
    model: "template_relevance",
    trainingSet: "reaxys",
    modelVersion: 1,
    precursorScoring: "RelevanceHeuristic",
    numTemplates: 1000,
    maxCumProb: 0.999,
    minPlausibility: 0.1,
    attributeFilter: [],
};

export default {
    name: "RetroView",
    components: {
        CopyTooltip,
        // SettingInput,
        KetcherModal,
        SmilesImage,
    },
    data() {
        return {
            emptyVoid: emptyVoid
        }
    },
    setup() {
        const slides = ref([
            'First',
            'Second',
            'Third',
            'Fourth',
            'Fifth',
        ]);
        const target = ref("");
        const validSmiles = ref(true);
        const modelStatus = ref([]);
        const templateSets = ref([]);
        const templateAttributes = ref({});
        const settings = reactive(JSON.parse(JSON.stringify(defaultSettings)));
        const predictions = ref({});
        const results = ref({});
        const labels = ref({});
        const selectedSettings = ref(null);
        const showSettingsViewModal = ref(false);
        const selectedTemplate = ref(null);
        const showTemplateInfoModal = ref(false);
        const retroResultTable = ref(null);
        const carouselSlide = ref(0);

        const context = computed(() => JSON.parse(document.getElementById("django-context").textContent));

        const enableResolver = ref(true);

        const maxIndex = computed(() => {
            const indices = Object.keys(predictions.value).map((val) => Number(val));
            return indices.length > 0 ? Math.max(...indices) : 0;
        });

        const models = computed(() => {
            // List of available models for selection
            const modelsSet = new Set();
            const types = ["template_prioritizer", "openretro"];
            modelStatus.value
                .filter((item) => types.includes(item["type"]) && item["ready"])
                .forEach((item) => {
                    if (item["name"].startsWith("template_relevance")) {
                        modelsSet.add("template_relevance");
                    } else {
                        modelsSet.add(item["name"]);
                    }
                });
            return Array.from(modelsSet).sort();
        });

        const trainingSets = computed(() => {
            // List of available training sets based on the selected model
            const sets = new Set();
            modelStatus.value
                .filter((item) => item["name"].startsWith(settings.model) && item["ready"])
                .forEach((item) => {
                    if (settings.model !== "template_relevance" || templateSets.value.includes(item["training_set"])) {
                        sets.add(item["training_set"]);
                    }
                });
            return Array.from(sets).sort();
        });

        const modelVersions = computed(() => {
            // List of available model versions based on selected model and training set
            const versions = new Set();
            modelStatus.value
                .filter((item) => item["name"].startsWith(settings.model) && item["training_set"] === settings.trainingSet && item["ready"])
                .forEach((item) => item["versions"].forEach((v) => versions.add(v)));
            return Array.from(versions).sort();
        });

        const precursors = computed(() => {
            // Compile full list of precursors by combining results from each prediction
            const precursors = {};
            Object.entries(results.value).forEach(([index, results]) => {
                results.forEach((res) => {
                    if (res.smiles in precursors) {
                        precursors[res.smiles][index] = res;
                    } else {
                        precursors[res.smiles] = {};
                        precursors[res.smiles][index] = res;
                        precursors[res.smiles]["plausibility"] = res["plausibility"];
                        precursors[res.smiles]["num_rings"] = res["num_rings"];
                        precursors[res.smiles]["rms_molwt"] = res["rms_molwt"];
                        precursors[res.smiles]["scscore"] = res["scscore"];
                    }
                });
            });
            return precursors;
        });

        const shownPredictions = computed(() => {
            return Object.keys(predictions.value).filter((index) => predictions.value[index].show);
        });

        const tableFields = computed(() => {
            const classes = ["text-center", "align-middle"];
            const fields = [{ key: "smiles", label: "Precursor", stickyColumn: true, tdClass: classes, thClass: classes }];
            Object.entries(predictions.value).forEach(([index, item]) => {
                if (item.show && !item.loading) {
                    fields.push({ key: index, label: labels.value[index], sortable: true, tdClass: classes, thClass: classes });
                }
            });
            return fields;
        });

        const tableItems = computed(() => {
            return Object.entries(precursors.value).map(([smiles, item]) => ({
                smiles: smiles,
                ...item,
            }));
        });

        const allowResolve = computed({
            get() {
                const settingsStore = useSettingsStore();
                return settingsStore.allowResolve;
            },
            set(value) {
                const settingsStore = useSettingsStore();
                settingsStore.setOption({ key: "allowResolve", value: value });
            },
        });

        onMounted(() => {
            API.get("/api/v2/template/sets/").then((json) => {
                templateAttributes.value = json["attributes"];
                templateSets.value = json["template_sets"];
            });
            API.get("/api/v2/status/ml/").then((json) => {
                modelStatus.value = json["models"];
            });
        });

        const toggleResolver = () => {
            allowResolve.value = !allowResolve.value;
        };

        const canonicalize = async (smiles) => {
            const json = await API.post("/api/v2/rdkit/smiles/canonicalize/", { smiles: smiles });
            return json.smiles;
        };

        const resolve = () => {
            console.log("done")
            if (enableResolver.value && allowResolve.value && target.value && !validSmiles.value) {
                resolveChemName(target.value)
                    .then((smiles) => canonicalize(smiles))
                    .then((smiles) => {
                        target.value = smiles;
                        validSmiles.value = true;
                        console.log(validSmiles.value)
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        };

        const checkTrainingSets = (newTrainingSet) => {
            // Returns true if the new training set is NOT compatible with the existing predictions
            let trainingSets = new Set(Object.values(predictions.value).map((pred) => pred.trainingSet));
            trainingSets.add(newTrainingSet);
            return trainingSets.has("cas") && trainingSets.size > 1;
        };

        const runRetro = () => {
            // if (!context.value["casKeyOk"] && checkTrainingSets(settings.trainingSet)) {
            //     alert("The CAS training set cannot be used for predictions alongside other models.");
            //     return;
            // }
            const newIndex = maxIndex.value + 1;
            console.log(maxIndex.value)
            carouselSlide.value = maxIndex.value;
            const url = "/api/v2/retro/";
            const body = {
                target: target.value,
                model: settings.model,
                training_set: settings.trainingSet,
                model_version: settings.modelVersion,
                precursor_prioritizer: settings.precursorScoring,
                num_templates: settings.numTemplates,
                max_cum_prob: settings.maxCumProb,
                filter_threshold: settings.minPlausibility,
                attribute_filter: settings.attributeFilter,
                cluster: false,
                selec_check: false,
            };
            // Make a deep copy of the settings object
            const settingsCopy = JSON.parse(JSON.stringify(settings));
            settingsCopy.loading = true;
            settingsCopy.show = true;
            settingsCopy.edit = false;
            predictions.value[newIndex] = settingsCopy;
            labels.value[newIndex] = `Prediction #${newIndex}`;
            API.runCeleryTask(url, body)
                .then((output) => {
                    results.value[newIndex] = output;
                    /* eslint-disable */
                    nextTick(() => {
                        if (retroResultTable.value) {
                            retroResultTable.value.refresh();
                        }
                    });
                })
                .catch((error) => {
                    alert("There was an error predicting precursors for this target: " + error);
                })
                .finally(() => {
                    predictions.value[newIndex].loading = false;
                });
        };

        const clear = (skipConfirm = false) => {
            let runningPreds = false;
            runningPreds = Object.values(predictions.value).some((prediction) => {
                if (prediction.loading) {
                    return true;
                }
            })
            if (runningPreds) {
                alert("Some predictions are still running!")
                return;
            }
            if (skipConfirm || confirm("This will clear all of your current results. Continue anyway?")) {
                target.value = "";
                predictions.value = {};
                results.value = {};
                labels.value = {};
                selectedSettings.value = null;
                selectedTemplate.value = null;
            }
        };

        const deleteResult = (index) => {
            if (predictions.value[index].loading) {
                alert("Please wait for " + labels.value[index] + " to complete.")
                return;
            }
            if (confirm("Deleting this prediction cannot be undone. Are you sure you want to continue?")) {
                delete predictions.value[index];
                delete results.value[index];
                delete labels.value[index];
                carouselSlide.value = 0;
            }
        };

        const viewSettings = (settings) => {
            selectedSettings.value = settings;
            showSettingsViewModal.value = true;
        };

        const viewTemplate = (template) => {
            selectedTemplate.value = template;
            showTemplateInfoModal.value = true;
        };

        const tableItemProvider = ({ sortBy, sortDesc }) => {
            const mult = sortDesc ? -1 : 1;
            return Object.entries(precursors.value)
                .map(([smiles, item]) => ({
                    smiles: smiles,
                    ...item,
                }))
                .sort((a, b) => mult * sortCompare(a, b, sortBy));
        };

        const sortCompare = (aObj, bObj, field) => {
            const a = aObj[field];
            const b = bObj[field];
            if (a === b) {
                return 0;
            } else if (a === undefined) {
                return 1;
            } else if (b === undefined) {
                return -1;
            } else {
                if (field === "smiles") {
                    return (a > b) - (a < b);
                } else {
                    return (a["rank"] > b["rank"]) - (a["rank"] < b["rank"]);
                }
            }
        };

        const addAttributeFilter = () => {
            settings.attributeFilter.push({
                name: templateAttributes.value[settings.trainingSet][0],
                logic: ">",
                value: 0.5,
            });
        };

        const deleteAttributeFilter = (index) => {
            settings.attributeFilter.splice(index, 1);
        };

        const updateAttributeFilter = (index, key, value) => {
            settings.attributeFilter[index][key] = value;
        };

        watch(
            () => settings.model,
            function () {
                settings.trainingSet = trainingSets.value[0];
                settings.attributeFilter = [];
            }
        );

        watch(
            () => settings.trainingSet,
            function () {
                settings.modelVersion = modelVersions.value[0];
                settings.attributeFilter = [];
            }
        );
        return {
            carouselSlide,
            slides,
            target,
            validSmiles,
            modelStatus,
            templateSets,
            templateAttributes,
            settings,
            predictions,
            results,
            resolve,
            labels,
            selectedSettings,
            showSettingsViewModal,
            selectedTemplate,
            showTemplateInfoModal,
            context,
            enableResolver,
            maxIndex,
            models,
            trainingSets,
            modelVersions,
            precursors,
            shownPredictions,
            tableFields,
            tableItems,
            allowResolve,
            toggleResolver,
            canonicalize,
            checkTrainingSets,
            runRetro,
            clear,
            deleteResult,
            viewSettings,
            viewTemplate,
            tableItemProvider,
            sortCompare,
            addAttributeFilter,
            deleteAttributeFilter,
            updateAttributeFilter,
            num2str,
        };
    },
};
</script>
<style>
.target-input .v-input__control {
    background-color: white;
}
</style>