<template>
    <v-container fluid>
        <v-row class="justify-center">
            <v-col cols="12" sm="8" md="10">
                <div class="mt-8 mb-5">
                    <v-breadcrumbs class="pa-0" :items="['Home', 'Logs']"></v-breadcrumbs>
                    <h1>
                        User's FastAPI Logs
                    </h1>
                </div>
            </v-col>
        </v-row>
        <v-row class="justify-center">
            <v-col cols="12" sm="8" md="10">
                <v-expansion-panels multiple density="compact">
                    <v-expansion-panel v-for="(log, index) in fastapiStore.logs" :key="index" density="compact">
                        <template v-slot:title>
                            <v-chip :color="methodToColors[log.method]">{{ log.method }}</v-chip> <span class="text-body-1 ml-2"><b>{{
                                log.endpoint }}</b></span>
                        </template>
                        <template v-slot:text>
                            <v-row>
                                <v-col>
                                    <h6 class="text-h6">Request:</h6>
                                    <pre>{{ log.request || "No Request" }}</pre>
                                </v-col>
                                <v-col>
                                    <h6 class="text-h6">Response:</h6>
                                    <pre>{{ log.response || "No Response" }}</pre>
                                </v-col>
                            </v-row>
                        </template>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref } from "vue"
import { useFastapiStore } from "@/store/fastapi"
const fastapiStore = useFastapiStore();

const methodToColors = ref({
    GET: "blue",
    POST: "green"
})
</script>