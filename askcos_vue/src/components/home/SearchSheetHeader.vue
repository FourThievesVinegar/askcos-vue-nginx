<template>
    <v-row class="justify-center align-center pa-0 ma-0">
        <v-col cols="12" class="d-flex justify-center align-center text-center">
            <img src="https://synth.fourthievesvinegar.org/apple-touch-icon.png" width="44" class="mr-2"/>
            <h2 class="text-h2 text-primary header font-weight-medium text-center">
                <strong>Explore ChemHacktica</strong>
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
                #491d88 20%,
                #143B86 30%,
                #6ac4b0 70%,
                #d9c84b 75%,
                #cf4673 80%);
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