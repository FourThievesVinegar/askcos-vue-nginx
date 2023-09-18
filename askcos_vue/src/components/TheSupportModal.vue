<template>
    <v-dialog v-model="dialogVisible" max-width="600px">
        <v-card>
            <v-card-title>Send support email</v-card-title>

            <v-card-text>
                <v-form>
                    <v-select v-model="selectedModule" :items="moduleOptions" label="Select module"></v-select>
                    <v-select v-model="selectedCategory" :items="categoryOptions" label="Select issue category"></v-select>
                    <v-text-field v-model="supportSubject" label="Email subject line"
                        placeholder="Subject line (max length: 150 characters)" maxlength="150"
                        autocomplete="off"></v-text-field>
                    <v-checkbox v-model="supportShared"
                        label="I wish to share this information with other Consortium members"></v-checkbox>
                </v-form>
            </v-card-text>

            <v-card-text class="text-justify">
                NOTE: Clicking "Submit" should launch your email client to send us an email. If this is blocked for some
                reason, please include the above information in an email you compose separately to {{ context.contactEmail
                }}.
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="success" @click="submitSupport">Submit</v-btn>
                <v-btn text @click="dialogVisible = false">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";

const dialogVisible = ref(false);


const selectedModule = ref("onestep");
const moduleOptions = ref([
    { value: "onestep", text: "One-step Retrosynthesis" },
    { value: "pathplanner", text: "Interactive Path Planning" },
    { value: "treebuilder", text: "Tree Builder" },
    { value: "context", text: "Context Recommendation" },
    { value: "synthpred", text: "Synthesis Predictor" },
    { value: "impurity", text: "Impurity Predictor" },
    { value: "regioselec", text: "Regioselectivity Predictor" },
    { value: "siteselec", text: "Site-Selectivity Predictor" },
    { value: "general", text: "General" },
]);

const selectedCategory = ref("bug");
const categoryOptions = ref([
    { value: "bug", text: "Report a bug" },
    { value: "enhancement", text: "Request an enhancement" },
    { value: "documentation", text: "Documentation" },
    { value: "general", text: "General query" },
]);
const supportSubject = ref("");
const supportShared = ref(false);
const context = computed(() => JSON.parse(document.getElementById("django-context").textContent));

const submitSupport = () => {
    let mailtoString = `mailto:${context.value.supportEmails}`;
    mailtoString += `?subject=${selectedModule.value}`;
    mailtoString += `|${selectedCategory.value}`;
    mailtoString += `|${supportShared.value ? "shared" : ""}`;
    mailtoString += `|${supportSubject.value}`;
    mailtoString += "&body=Please add your comments here. Please don't modify the beginning of the subject line; we use this for internal purposes.";
    window.open(mailtoString, "_blank");
};
</script>