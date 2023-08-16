<template>
  <v-navigation-drawer
    expand-on-hover
    rail
    elevation="10"
    @update:rail="onDrawerCollapse"
    width="100px"
  >
    <v-list>
      <v-list-item
        prepend-icon="mdi-chemical-weapon"
        title="ASKCOS"
        subtitle="Demo"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list nav v-model:opened="openGroups" color="primary">
      <v-list-item prepend-icon="mdi-home" title="Home" to="/" value="home"></v-list-item>
      <v-list-group value="modules" no-action >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-file-tree"
            title="Modules"
          ></v-list-item>
        </template>
        <v-list-item
          prepend-icon="mdi-help-box"
          title="Overview"
          value="overview"
        ></v-list-item>
        <v-list-group value="Retrosynthesis" subgroup>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Retrosynthesis"></v-list-item>
          </template>

          <v-list-item
            to="network?tab=IPP"
            prepend-icon="mdi-help-box"
            title="Interactive Path Planning/Tree Builder"
            value="IPP"
            :active="route.query.tab === 'IPP'"
          ></v-list-item>
          <v-list-item
            to="network?tab=RP"
            prepend-icon="mdi-help-box"
            title="Retrosynthesis Prediction"
            value="RP"
            :active="route.query.tab === 'RP'"
          ></v-list-item>
        </v-list-group>
        <v-list-group value="ForwardSynthesis" subgroup>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Forward Synthesis"></v-list-item>
          </template>

          <v-list-item
            prepend-icon="mdi-help-box"
            title="Condition Recommendation"
            value="CR"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-help-box"
            title="Synthesis Prediction"
            value="SP"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-help-box"
            title="Impurity Prediction"
            value="IP"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-help-box"
            title="Regio-selectivity Prediction"
            value="RSP"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-help-box"
            title="Aromatic Site Selectivity"
            value="ARSS"
          ></v-list-item>
        </v-list-group>

        <v-list-group value="Utilities" subgroup>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Utilities"></v-list-item>
          </template>

          <v-list-item
            prepend-icon="mdi-help-box"
            title="Solubility Prediction"
            value="USP"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-help-box"
            title="Solvent Screening"
            value="USS"
          ></v-list-item>
          <v-list-item
            to="buyables"
            prepend-icon="mdi-help-box"
            title="Buyable Look-up"
            value="UBLU"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-help-box"
            title="Drawing"
            value="UD"
          ></v-list-item>
        </v-list-group>
      </v-list-group>
      <v-list-item
        prepend-icon="mdi-help-box"
        title="Help"
        value="help"
      ></v-list-item>
      <v-list-item
        to="status"
        prepend-icon="mdi-list-status"
        title="Server Status"
        value="serverStatus"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-book-information-variant"
        title="Quick Reference"
        value="wiki"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-bug"
        title="Report a bug"
        value="starred"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";

// const listGroupExpanded = ref(true);
const openGroups = ref([]);
const route = useRoute();

function onDrawerCollapse(value) {
  if (value) {
    openGroups.value = [];
  }
}

onMounted(() => {
  openGroups.value = [];
});
</script>

<style>
.v-icon {
  margin-inline-end: 0px;
}
</style>
