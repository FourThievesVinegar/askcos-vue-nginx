<template>
    <v-container fluid>
        <v-row class="justify-center align-center">
            <v-col cols="12" md="3"><v-sheet elevation="2">
                    <div id="retro-input" class="d-flex justify-content-center">
                        <b-input-group>
                            <b-input-group-prepend>
                                <b-input-group-text>Target</b-input-group-text>
                                <b-input-group-text v-if="enableResolver" @click="toggleResolver" role="button">
                                    <i v-if="allowResolve" v-b-tooltip style="color: darkgreen" class="fas fa-server"
                                        title="Connection to NIH name resolver is ON, structures may be sent to an external service. This can be turned off in the settings menu, or by clicking this icon."></i>
                                    <i v-else v-b-tooltip style="color: darkred" class="fas fa-server"
                                        title="Connection to NIH name resolver is OFF, structures will NOT be sent to an external service. Target query must be a SMILES string. This can be turned on in the settings menu, or by clicking this icon."></i>
                                </b-input-group-text>
                            </b-input-group-prepend>
                            <b-input id="retro-target" v-model="target" @blur="resolve" @keyup.enter="resolve"></b-input>
                            <b-input-group-append>
                                <b-button v-b-modal.retro-ketcher-modal>
                                    <i class="fas fa-edit"></i>
                                </b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </div>
                </v-sheet></v-col>
            <v-col cols="12" md="9"><v-sheet elevation="2">H</v-sheet></v-col>
        </v-row>
    </v-container>
</template>