<template>
    <v-dialog id="settings-modal" scrollable v-model="showSettings" width="900px" @close="clearEmit">
        <v-card>
            <v-card-title>Strategy Settings</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <div class="d-flex flex-row">
                    <v-tabs v-model="tab" direction="vertical" color="primary">
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
                    <v-window v-model="tab">
                        <v-window-item value="general">
                            <v-card flat>
                                <v-card-text>
                                </v-card-text>
                            </v-card>
                        </v-window-item>
                        <v-window-item value="mctsTB">
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

export default {
    name: "SettingsModal",
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
        }
    },
    methods: {
        clearEmit() {
            this.$emit('update:settingsVisible', false);
        },
    },
};
</script>
  
<style>.modal-right {
    margin: 1.75rem 1.75rem 1.75rem auto !important;
}</style>
  