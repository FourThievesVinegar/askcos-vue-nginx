<template>
    <v-container fluid style="min-height: 100vh">
        <v-row class="justify-center">
            <v-col cols="12" sm="8" md="10">
                <div class="my-8">
                    <v-breadcrumbs class="pa-0" :items="[{
                        title: 'Home',
                        disabled: false,
                        href: '/',
                    },
                    {
                        title: 'Template',
                        disabled: true,
                    }]"></v-breadcrumbs>
                    <h1>
                        Template Info
                    </h1>
                </div>
            </v-col>
        </v-row>
        <v-row class="justify-center">
            <v-col cols="12" sm="8" md="10">
                <table class="table table-borderless">
                    <tr>
                        <th>Template:</th>
                        <td>
                            <copy-tooltip :data="templateInfo['reaction_smarts']">
                                <span class="smiles">{{ templateInfo['reaction_smarts'] }}</span>
                            </copy-tooltip>
                        </td>
                    </tr>
                    <tr>
                        <th>Template set:</th>
                        <td>{{ templateInfo['template_set'] }}</td>
                    </tr>
                </table>
            </v-col>
        </v-row>
        <v-row class="justify-center">
            <v-col cols="12" sm="8" md="10">
                <smiles-image v-if="!!templateInfo['reaction_smarts']" :smiles="templateInfo['reaction_smarts']"
                    input-type="template"></smiles-image>
            </v-col>
        </v-row>
        <v-row class="justify-center">
            <v-col col="12" sm="8" md="10">
                <p v-if="templateInfo['necessary_reagent']"><em>
                        Note: This reaction would require a reagent to contribute {{
                            templateInfo['necessary_reagent'] }}
                    </em></p>
                <p v-if="templateInfo['intra_only']"><em>
                        Note: This template should be used for intramolecular reactions <b>only</b>
                    </em></p>
                <p v-if="templateInfo['dimer_only']"><em>
                        Note: This template should be used for symmetric (dimerization) reactions <b>only</b>
                    </em></p>
            </v-col>
        </v-row>
        <v-row class="justify-center">
            <v-col cols="12" sm="8" md="10" class="d-flex flex-row align-center justify-center">
                <div>
                    <span>{{ templateInfo.count }} total references</span>
                </div>
                <div>
                    <copy-tooltip class="btn btn-outline-secondary ml-2" :data="allReactionReferences" no-highlight>
                        <v-btn variant="outlined">Copy all reaction IDs</v-btn>
                    </copy-tooltip>
                </div>
                <div>
                    <v-btn v-if="templateInfo.template_set === 'reaxys'" variant="outlined" class="ml-2"
                        @click="downloadReactionQuery">
                        <i class="fas fa-file-download"></i> Export all reaction IDs as Reaxys query
                    </v-btn>
                </div>
                <div>
                    <v-btn v-if="templateInfo.template_set === 'reaxys'" variant="outlined" class="ml-2" :href="rexaysURL"
                        target="_blank">
                        <i class="fas fa-external-link-alt"></i> Find current page of reactions in Reaxys
                    </v-btn>
                </div>

                <template v-if="templateInfo.template_set === 'cas' && rxnListItems && rxnListItems.length">
                    <sci-findern-button class="ml-2" @click="casSearch"></sci-findern-button>
                    <v-menu location="bottom" :close-on-content-click="false" id="proxy-settings">
                        <template v-slot:activator="{ props }">
                            <v-btn color="primary" dark v-bind="props">
                                Proxy Settings
                            </v-btn>
                        </template>
                        <v-card style="width: 18rem;">
                            <v-card-text>
                                <span> If your institution requires a proxy connection to access SciFinder<sup>n</sup>,
                                    enter
                                    the URL below:</span>
                                <v-text-field label="Proxy URL" variant="outlined" v-model="proxyUrl"
                                    hide-details></v-text-field>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn class="ml-2" variant="primary" type="submit" @click="saveProxyUrl">Save</v-btn>
                            </v-card-actions>
                        </v-card>

                    </v-menu>
                </template>
            </v-col>
        </v-row>
        <v-row class="justify-center">
            <v-col cols="12" md="6">
                <div class="text-center">
                    <v-pagination v-model="rxnListCurrentPage" :length="rxnListTotalItems"></v-pagination>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" md="10">
                <table id="reaction-table" class="table table-hover" style="width: 100%">
                    <thead>
                        <tr>
                            <th class="text-center">Reaction ID</th>
                            <th class="text-center">Reaction</th>
                            <th class="text-center">Spectators</th>
                            <th class="text-center">Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="loading">
                            <tr>
                                <td colspan="4" class="text-center">
                                    <div class="spinner-border text-secondary" role="status"></div>
                                </td>
                            </tr>
                        </template>
                        <template v-else-if="!rxnListItems || rxnListItems.length === 0">
                            There's no reaction information to show
                            <tr>
                                <td colspan="4" class="text-center">
                                    <h4>Reaction data not available!</h4>
                                </td>
                            </tr>
                        </template>
                        <template v-else>
                            There is reaction information to show
                            <tr v-for="reaction in rxnListItems" :key="reaction['reaction_id']">
                                <td class="text-center">{{ reaction['reaction_id'] }}</td>
                                <td class="text-center">
                                    <smiles-image v-if="!!reaction['reaction_smiles']" :smiles="reaction['reaction_smiles']"
                                        input-type="reaction" lazy></smiles-image>
                                </td>
                                <td class="text-center">{{ reaction['spectators'] }}</td>
                                <td class="text-center" v-if="!!reaction['reference_url']">
                                    <a v-if="!!reaction['reference']" :href="reaction['reference_url']" target="_blank">
                                        {{ reaction['reference'] }}
                                    </a>
                                    <a v-else :href="reaction['reference_url']" target="_blank">
                                        link
                                    </a>
                                </td>
                                <td class="text-center" v-else>{{ reaction['reference'] }}</td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <b>Reaction reference IDs: </b>
                <copy-tooltip :data="allReactionReferences">
                    <i class="far fa-copy"></i> {{ allReactionReferences }}
                </copy-tooltip>
            </v-col>
        </v-row>
    </v-container>
</template>
  
<script>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import CopyTooltip from "@/components/CopyTooltip";
import SciFindernButton from "@/components/SciFindernButton";
import SmilesImage from "@/components/SmilesImage";
import { API } from "@/common/api";
import { createReaxysQuery, createReaxysUrl } from "@/common/reaxys";
import { createCasClient } from "@/common/cas-client";
import { storageAvailable } from "@/common/utils";
// import { saveAs } from 'file-saver';

const PROXY_STORAGE_KEY = 'casProxyUrl';

export default {
    name: 'App',
    components: {
        CopyTooltip,
        SciFindernButton,
        SmilesImage,
    },
    setup() {
        const casClient = ref(null);
        const casUser = ref(null);
        const casUrl = ref(null);
        const proxyUrl = ref('');
        const templateId = ref(null);
        const templateInfo = ref({});
        const reactionsByPage = reactive({});
        const rxnListCurrentPage = ref(1);
        const rxnListItemsPerPage = ref(50);
        const loading = ref(false);

        const headers = ref([
            { key: 'reaction_id', title: 'Reaction ID', },
            { key: 'rxnid', title: 'Reaction' },
            { key: 'spectators', title: 'Spectators' },
            { key: 'reference', title: 'Reference' },
        ]);

        const lookupTemplate = async () => {
            if (templateId.value) {
                loading.value = true;
                API.get(`/api/template/retrieve?pk=${templateId.value}`).then(async (json) => {
                    templateInfo.value = json.template;
                    await lookupReactions();
                })
            }
        };

        const lookupReactions = async () => {
            loading.value = true;
            const json = await API.post('/api/reactions/post', {
                template_set: templateInfo.value.template_set,
                ids: currentReactionReferences.value,
            });
            let reactions = generateReferences(json.reactions, currentReactionReferences.value);
            reactionsByPage[rxnListCurrentPage.value] = reactions;
            loading.value = false;
        };

        const downloadReactionQuery = () => {
            let blob = new Blob([createReaxysQuery(templateInfo.value.references)], { type: 'data:text/json;charset=utf-8' });
            saveAs(blob, 'reaxys_query.json');
        };

        const generateReferences = (reactions, reactionIds) => {
            if (templateInfo.value.template_set.startsWith('reaxys')) {
                return generateReaxysReferences(reactions, reactionIds);
            } else if (templateInfo.value.template_set.startsWith('pistachio')) {
                return generatePistachioReferences(reactions);
            } else {
                return reactions;
            }
        };

        const generateReaxysReferences = (reactions, reactionIds) => {
            if (reactions.length) {
                return reactions.map((r) => {
                    return {
                        'reference_url': createReaxysUrl([r['reaction_id']]),
                        ...r,
                    };
                });
            } else {
                return reactionIds.map((rid) => {
                    return {
                        'reaction_id': rid,
                        'reference_url': createReaxysUrl([rid]),
                    };
                });
            }
        };

        const generatePistachioReferences = (reactions) => {
            return reactions.map((r) => {
                return {
                    'reference': r.title.includes('_') ? r.title.replace('_', ' [') + ']' : r.title,
                    'reference_url': createPistachioUrl(r.title),
                    ...r,
                };
            });
        };

        const createPistachioUrl = (pid) => {
            // if (context.pistachioUrl) {
            //     return `${context.pistachioUrl}/#search/${pid}//p1`;

            return `https://patents.google.com/patent/${pid.split('_')[0]}/`;

        };

        const casLogin = () => {
            return casClient.value.login()
                .then((user) => {
                    console.log('Logged in!');
                    casUser.value = user;
                })
                .catch((err) => {
                    console.log('Could not login: ', err);
                });
        };

        const createCasUrl = () => {
            if (!casUser.value || casUser.value.expired || !rxnListItems.value) {
                return;
            }
            const data = {
                uriList: rxnListItems.value.map((rxn) => `reaction/pt/${rxn['rxnid']}`),
            };
            return casClient.value.post('/api/v1/import/reactions', data)
                .then((json) => {
                    const host = proxyUrl.value || casClient.value.apiServer;
                    casUrl.value = host + json.path;
                })
                .catch((err) => {
                    console.log('Could not import reactions: ', err);
                    alert('Could not import reactions using SciFinder API.');
                });
        };

        const casSearch = () => {
            if (!rxnListItems.value) {
                return;
            }
            if (casUrl.value) {
                window.open(casUrl.value, '_blank');
            } else if (!casUser.value || casUser.value.expired) {
                casLogin()
                    .then(() => {
                        return createCasUrl();
                    })
                    .then(() => {
                        if (casUrl.value) {
                            // Open in current window because popup will be blocked
                            window.location = casUrl.value;
                        }
                    });
            } else {
                createCasUrl()
                    .then(() => {
                        if (casUrl.value) {
                            // Open in current window because popup will be blocked
                            window.location = casUrl.value;
                        }
                    });
            }
        };

        const initializeCasClient = () => {
            return createCasClient({}, proxyUrl.value)
                .then((client) => {
                    casClient.value = client;
                    return casClient.value.getUser();
                })
                .then((user) => {
                    casUser.value = user;
                });
        };

        const saveProxyUrl = () => {
            if (storageAvailable('localStorage')) {
                localStorage.setItem(PROXY_STORAGE_KEY, encodeURIComponent(proxyUrl.value));
            }
            initializeCasClient();
        };

        // const context = JSON.parse(document.getElementById('django-context').textContent);

        const allReactionReferences = computed(() => {
            // Returns all reaction references as a semicolon delimited string
            if (!!templateInfo.value && !!templateInfo.value.references) {
                return templateInfo.value.references.join('; ');
            } else {
                return '';
            }
        });

        const currentReactionReferences = computed(() => {
            // Returns reaction references for the current page as an array
            if (!!templateInfo.value && !!templateInfo.value.references) {
                const start = (rxnListCurrentPage.value - 1) * rxnListItemsPerPage.value;
                const end = start + rxnListItemsPerPage.value;
                return templateInfo.value.references.slice(start, end);
            } else {
                return [];
            }
        });

        const rxnListItems = computed(() => {
            return reactionsByPage[rxnListCurrentPage.value];
        });

        const rxnListTotalItems = computed(() => {
            if (!!templateInfo.value && !!templateInfo.value.references) {
                return templateInfo.value.references.length;
            } else {
                return 0;
            }
        });

        const rexaysURL = computed(() => {
            return createReaxysUrl(currentReactionReferences.value)
        })

        onMounted(async () => {
            const urlParams = new URLSearchParams(window.location.search);
            templateId.value = urlParams.get('id');
            const lookupPromise = await lookupTemplate();
            if (storageAvailable('localStorage')) {
                const value = localStorage.getItem(PROXY_STORAGE_KEY)
                if (value) {
                    proxyUrl.value = decodeURIComponent(value)
                }
            }

            const authPromise = initializeCasClient()

            Promise.all([lookupPromise, authPromise])
                .then(() => {
                    createCasUrl()
                })
        });

        watch(rxnListCurrentPage, (newVal) => {
            if (reactionsByPage[newVal] === undefined) {
                lookupReactions()
                    .then(() => {
                        createCasUrl();
                    });
            }
        });

        return {
            casClient,
            casUser,
            casUrl,
            proxyUrl,
            templateId,
            templateInfo,
            reactionsByPage,
            rxnListCurrentPage,
            rxnListItemsPerPage,
            loading,
            allReactionReferences,
            currentReactionReferences,
            rexaysURL,
            rxnListItems,
            rxnListTotalItems,
            headers,
            lookupTemplate,
            lookupReactions,
            downloadReactionQuery,
            generateReferences,
            generateReaxysReferences,
            generatePistachioReferences,
            createPistachioUrl,
            casLogin,
            createCasUrl,
            casSearch,
            initializeCasClient,
            saveProxyUrl,
        };
    },
};
</script>