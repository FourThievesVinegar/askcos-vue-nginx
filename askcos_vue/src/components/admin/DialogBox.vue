<template>
    <v-dialog width="500px" v-model="openDialog">
        <v-card>
            <v-card-title>
                Change {{props.label}}
            </v-card-title>
            <v-card-text>
                <v-text-field v-model="value" variant="outlined" :label="props.label" hide-details clearable
                    :type="hide ? 'password' : ''"></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="openDialog = false">Cancel</v-btn>
                <v-btn text @click="$emit('updateValue', value)">Submit</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
const openDialog = defineModel("openDialog", { default: false, required: true })
const value = defineModel("value", { required: true })
const props = defineProps({ label: { type: String, required: true }, hide: { type: Boolean, default: false } })
</script>