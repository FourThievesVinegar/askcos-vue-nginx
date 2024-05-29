<template>
    <v-row class="justify-center">
            <v-col cols="12" md="12" xl="10">
                <div class="my-4">
                    <v-breadcrumbs class="pa-0 text-body-1" :items="breadCrumbItems">
                        <template v-slot:prepend>
                            <v-icon icon="mdi-home" size="large"></v-icon>
                        </template>
                    </v-breadcrumbs>
                    <h4 class="text-h4 text-primary">
                        {{ props.pageTitle }}
                    </h4>
                </div>
            </v-col>
        </v-row>
</template>

<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
const breadCrumbItems = [{ title: 'Home', to: "/" }, { title: route.meta.title }]
const props = defineProps({pageTitle: {type: String, required: true}})
</script>