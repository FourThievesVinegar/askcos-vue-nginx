<template>
    <v-container fluid style="min-height: calc(100vh-50px)" class="my-10">
        <v-row style="min-height: 100vh" class="justify-center">
            <v-col cols="12" sm="8" md="10">
                <v-sheet elevation="5" rounded="lg" class="pa-10">
                    <h1 class="my-4">
                        Forward Synthesis Planner
                    </h1>
                                        <h1 class="my-4">
                           input
                        </h1>
                </v-sheet>
                
                    <v-sheet elevation="5" rounded="lg" class="my-6 pa-6">
                        <h1 class="my-4">
                            content
                        </h1>
                    </v-sheet>


            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import SmilesInput from '@/components/SmilesInput.vue'
</script>