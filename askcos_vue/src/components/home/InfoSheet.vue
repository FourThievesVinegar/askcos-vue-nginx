<template>
    <v-sheet elevation="2" rounded="lg" width="100%" class="pa-6">
        <p class="mb-2 text-body-1">
            Here, we have hosted a number of computational tools to assist in
            synthetic planning and other aspects of organic chemistry. These are
            listed under the Modules tab in the navigation bar on the left, with
            more detailed description in
            <a class="text-decoration-none text-primary font-weight-medium d-inline-flex align-center" target="_blank"
                href="https://askcos-docs.mit.edu/" color="primary">
                ASKCOS wiki <v-icon size="x-small">mdi mdi-open-in-new</v-icon></a>.
            Several of the deployed models are described in publications listed
            <a class="text-decoration-none text-primary font-weight-medium d-inline-flex align-center" target="_blank"
                href="https://mlpds.mit.edu/papers/">here<v-icon size="x-small">mdi
                    mdi-open-in-new</v-icon></a>.
            References for the models are included in their respective pages
            where appropriate.
        </p>
        <v-alert border="start" type="info" density="compact" text="Please keep in mind that this service is supported by a fixed amount
              of computational resources. Your requests may take significantly
              longer than expected if there are several other users on the site
              also performing computationally-expensive requests." variant="tonal" class="mb-2 py-2"></v-alert>
        <v-alert border="start" density="compact" variant="tonal" icon="mdi mdi-handshake" class="mb-2">
            <template v-slot:text class="text-body-1">
                Big thanks to open source scientists of all stripes!
                <a class="text-decoration-none text-primary font-weight-medium d-inline-flex align-center"
                    target="_blank" href="https://fourthievesvinegar.org">
                    This fork maintained by the Four Thieves Vinegar Collective<v-icon size="x-small">mdi
                        mdi-open-in-new</v-icon></a>.
            </template>
        </v-alert>
        <expansion-panels />
    </v-sheet>
</template>

<script setup>
import ExpansionPanels from "@/components/home/ExpansionPanels"
</script>