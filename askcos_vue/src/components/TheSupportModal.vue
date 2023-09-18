<template>
    <b-modal id="support-modal" title="Send support email" centered @ok="submitSupport" ok-title="Submit"
        ok-variant="success">
        <div id="support-form" class="form mb-3">
            <b-form-group id="support-module" label="Select module" label-for="support-module-select">
                <b-form-select v-model="selectedModule" :options="moduleOptions" id="support-module-select" />
            </b-form-group>
            <b-form-group id="support-category" label="Select issue category" label-for="support-category-select">
                <b-form-select v-model="selectedCategory" :options="categoryOptions" id="support-category-select" />
            </b-form-group>
            <b-form-group id="support-subject" label="Email subject line" label-for="support-subject-input">
                <b-form-input v-model="supportSubject" placeholder="Subject line (max length: 150 characters)"
                    maxlength="150" autocomplete="off" id="support-subject-input" />
            </b-form-group>
            <b-form-checkbox v-model="supportShared" id="support-shared-check">
                I wish to share this information with other Consortium members
            </b-form-checkbox>
        </div>
        <div class="text-justify">
            NOTE: Clicking "Submit" should launch your email client to send us an email. If this is blocked for some
            reason, please include the above information in an email you compose separately to {{ context.contactEmail }}.
        </div>
    </b-modal>
</template>

<script setup>
import { ref, computed } from "vue";

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