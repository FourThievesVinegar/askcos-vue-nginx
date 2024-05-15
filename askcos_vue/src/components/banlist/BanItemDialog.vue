<template>
    <v-dialog v-model="showBanItemDialog" max-width="600px">
        <v-card>
            <v-card-title class="mt-2">
                <v-col cols="12">Add new banlist entry</v-col></v-card-title>

            <v-card-text class="text-justify">
                <v-row>
                    <v-col cols="12">
                        <v-select v-model="newType" item-text="key" item-value="title"
                            :items="['chemicals', 'reactions']" label="Entry Type" density="comfortable"
                            variant="outlined" hide-details clearable></v-select>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="newSmiles" label="SMILES" maxlength="150" autocomplete="off"
                            density="comfortable" variant="outlined" hide-details clearable>
                            <template v-slot:append-inner>
                                <v-btn variant="tonal" prepend-icon="mdi mdi-pencil"
                                    @click="openKetcher(newSmiles)">Draw</v-btn>
                            </template>
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" v-if="!!newSmiles">
                        <smiles-image :smiles="newSmiles" height="100px"></smiles-image>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="newDesc" label="Description" maxlength="150" autocomplete="off"
                            density="comfortable" variant="outlined" hide-details clearable></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="mb-2">
                <v-spacer></v-spacer>
                <v-btn color="success" @click="addEntry">Submit</v-btn>
                <v-btn text @click="showBanItemDialog = false">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <ketcher-modal ref="ketcherRef" v-model="showKetcher" :smiles="newSmiles" @input="showKetcher = false"
        @update:smiles="updateSmiles" />
</template>

<script setup>
import { ref, nextTick } from 'vue';
import KetcherModal from "@/components/KetcherModal";
import dayjs from 'dayjs';
import { API } from "@/common/api";
import SmilesImage from "@/components/SmilesImage";

const showBanItemDialog = defineModel("showBanItemDialog", { required: true, default: false })
const pendingTasks = defineModel("pendingTasks", { required: true })
const activeTab = defineModel("activeTab", { required: true })
const emit = defineEmits(['loadCollection'])
const ketcherRef = ref(null);
const showKetcher = ref(false);
const newDesc = ref('');
const newActive = ref(true)
const newType = ref("chemicals");
const newSmiles = ref('');

const addEntry = () => {
    pendingTasks.value++;
    const body = new URLSearchParams({
        description: newDesc.value || 'no description',
        smiles: newSmiles.value,
        active: newActive.value
    }).toString().replace(/\+/g, '%20');
    API.post(`/api/banlist/${newType.value}/post?${body}`)
        .catch(error => console.error(error))
        .finally(() => {
            emit("loadCollection", newType.value === 'chemicals' ? 'chemicals' : 'reactions')
            showBanItemDialog.value = false;
            nextTick(() => {
                if (newType.value === 'chemicals') {
                    activeTab.value = 0;
                } else {
                    activeTab.value = 1;
                }
                pendingTasks.value--;
            });
        })
}

const openKetcher = (source) => {
    newSmiles.value = source;
    showKetcher.value = true;
    ketcherRef.value.smilesToKetcher();
};

const updateSmiles = (source) => {
    newSmiles.value = source;
}
</script>