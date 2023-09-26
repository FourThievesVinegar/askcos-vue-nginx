<template>
    <v-container fluid>
        <v-row class="justify-center">
            <v-col cols="12" sm="8" md="10">
                <div class="mt-8 mb-5">
                    <v-breadcrumbs class="pa-0" :items="['Home', 'Profile']"></v-breadcrumbs>
                    <h1>
                        Profile
                    </h1>
                </div>
            </v-col>
        </v-row>
        <v-row class="justify-center align-center">
            <v-col cols="12" md="10" class="d-flex justify-center">
                <v-card class="pa-5">
                    <template v-slot:prepend>
                        <v-card-title>
                            <v-icon icon="mdi-account" start></v-icon>
                            User Details
                        </v-card-title>
                    </template>
                    <v-divider  class="mx-2"></v-divider>
                    <v-card-text>
                        <h2>Tim Beaver</h2>
                        <p>Username: new</p>
                        <p>Email: tim@mit.edu</p>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn to="/results" variant="tonal" color="primary">Results</v-btn>
                        <v-btn to="/banlist" variant="tonal" color="primary">Banlist</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
</script>