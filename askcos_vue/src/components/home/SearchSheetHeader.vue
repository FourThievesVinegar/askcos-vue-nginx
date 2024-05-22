<template>
    <v-row class="justify-center align-center pa-0 ma-0">
        <v-col cols="12" class="d-flex justify-center align-center text-center">
            <v-icon icon="mdi-compass-rose" class="text-h2 text-blue-darken-3 mr-2"></v-icon>
            <h2 class="text-h2 text-blue-darken-3 header font-weight-medium text-center">
                <strong>Explore ASKCOS</strong>
            </h2>
        </v-col>
    </v-row>
    <v-row class="justify-center align-center pa-0 ma-0">
        <v-col cols="12" class="d-flex justify-center align-center">
            <h6 class="text-h6">Enter a molecule or reaction SMILES to explore available tasks</h6>
        </v-col>
    </v-row>
</template>

<style scoped>
.header {
    background: linear-gradient(to right,
            #65676b 20%,
            #006bd6 30%,
            #0080ff 70%,
            #8a8e94 80%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-emphasis-color: transparent;
    background-size: 500% auto;
    animation: paint 5s ease-in-out infinite alternate;
}

@keyframes paint {
    0% {
        background-position: 0% 50%;
    }

    100% {
        background-position: 100% 50%;
    }
}
</style>