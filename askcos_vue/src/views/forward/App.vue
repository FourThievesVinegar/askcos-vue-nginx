<template>
    <v-container fluid style="min-height: calc(100vh-50px)" class="my-10">
        <v-row style="min-height: 100vh" class="justify-center">
            <v-col cols="12" sm="8" md="10">
                <v-sheet elevation="5" rounded="lg" class="pa-10">
                    <h1 class="my-2">
                        Forward Synthesis Planner
                    </h1>
    <div class="row my-3">
        <smiles-input class="col-3 col-xl-6" id="reactants" label="Reactants"
        ></smiles-input>
        <smiles-input class="col-3 col-xl-6" id="reactants" label="Reactants"
        ></smiles-input>
        <smiles-input class="col-3 col-xl-6" id="reactants" label="Reactants"
        ></smiles-input>
        <smiles-input class="col-3 col-xl-6" id="reactants" label="Reactants"
        ></smiles-input>
    </div>

                 <div class="text-center my-3">
                    <b-button variant="success" id="submit-button" type="submit">Submit</b-button>
                  </div>

                </v-sheet>

                <v-sheet elevation="5" rounded="lg" class="my-6 ">
                    <v-tabs v-model="tab" color="primary" align-tabs="center" grow class="mb-4">
                        <v-tab value="1">Interactive Path Planner</v-tab>
                        <v-tab value="2">Retro Synthesis</v-tab>
                        <v-tab value="3">Tree Explorer</v-tab>
                    </v-tabs>
                </v-sheet>

                <v-window v-model="tab" class="elevation-2">
                    <v-window-item value="1">
                        IPP
                    </v-window-item>
                    <v-window-item value="2"> RP </v-window-item>
                    <v-window-item value="3"> TE </v-window-item>
                </v-window>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from "vue-router";
import SmilesInput from "@/components/SmilesInput.vue";

const route = useRoute();
const router = useRouter();
const tab = ref(route.query.tab || "1");

watch(route, (newRoute) => {
    tab.value = newRoute.query.tab || "1";
});

function changeTab(newTab) {
    tab.value = newTab;
    router.push({
        query: {
            ...route.query,
            tab: newTab
        }
    });
}
</script>
