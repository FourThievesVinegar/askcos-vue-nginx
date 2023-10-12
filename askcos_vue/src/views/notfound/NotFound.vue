
import { ref } from 'vue';

<template>
    <v-container fluid class="d-flex justify-center align-center" style="height:100%">
        <v-row class="justify-center">
            <v-col cols="12" md="10" class="d-flex justify-center text-center">
                <div>
                    <v-img :width="400" :src="pageNotFoundSrc" class="mb-3"></v-img>
                    <h6 class="text-h6 mb-3">Page Not Found</h6>
                    <v-btn variant="tonal" to="/">Take me home</v-btn>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import {ref} from 'vue'
import pageNotFound from "@/assets/pageNotFound.svg";

const pageNotFoundSrc = ref(pageNotFound)
</script>