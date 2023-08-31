<template>
  <v-navigation-drawer expand-on-hover rail elevation="2" @update:rail="onDrawerCollapse" width="100px">
    <v-list>
      <v-list-item :prepend-avatar="logoSrc" title="ASKCOS" subtitle="Demo"></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list nav v-model:opened="openGroups" @update:opened="closeGroupsOnBack" color="primary">
      <v-list-item prepend-icon="mdi-home" title="Home" to="/" value="home" :active="route.path === '/'"></v-list-item>
      <v-list-group value="modules" no-action>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-file-tree" title="Modules" :active="activeModules"
            :variant="activeModules ? 'tonal' : 'text'"></v-list-item>
        </template>
        <v-list-item prepend-icon="mdi-help-box" title="Overview" value="overview"></v-list-item>
        <v-list-group value="Retrosynthesis" subgroup>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Retrosynthesis"></v-list-item>
          </template>

          <v-list-item to="network?tab=IPP" prepend-icon="mdi-help-box" title="Interactive Path Planning/Tree Builder"
            value="IPP" :active="route.query.tab === 'IPP'"></v-list-item>
          <v-list-item to="network?tab=RP" prepend-icon="mdi-help-box" title="Retrosynthesis Prediction" value="RP"
            :active="route.query.tab === 'RP'"></v-list-item>
        </v-list-group>

        <v-list-group value="ForwardSynthesis" subgroup>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Forward Synthesis"></v-list-item>
          </template>

          <v-list-item to="forward?tab=context" prepend-icon="mdi-help-box" title="Condition Recommendation"
            value="context" :active="route.query.tab === 'context'"></v-list-item>
          <v-list-item to="forward?tab=forward" prepend-icon="mdi-help-box" title="Synthesis Prediction" value="forward"
            :active="route.query.tab === 'forward'"></v-list-item>
          <v-list-item to="forward?tab=impurity" prepend-icon="mdi-help-box" title="Impurity Prediction" value="impurity"
            :active="route.query.tab === 'impurity'"></v-list-item>
          <v-list-item to="forward?tab=selectivity" prepend-icon="mdi-help-box" title="Regio-selectivity Prediction"
            value="selectivity" :active="route.query.tab === 'selectivity'"></v-list-item>
          <v-list-item to="forward?tab=sites" prepend-icon="mdi-help-box" title="Aromatic Site Selectivity" value="sites"
            :active="route.query.tab === 'sites'"></v-list-item>
        </v-list-group>

        <v-list-group value="Utilities" subgroup>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Utilities"></v-list-item>
          </template>

          <v-list-item to="solprop?tab=solpred" prepend-icon="mdi-help-box" title="Solubility Prediction"
            value="USP" :active="route.query.tab === 'solpred'"></v-list-item>
          <v-list-item to="solprop?tab=solscreen" prepend-icon="mdi-help-box" title="Solvent Screening"
            value="USS" :active="route.query.tab === 'solscreen'"></v-list-item>
          <v-list-item to="buyables" prepend-icon="mdi-help-box" title="Buyable Look-up" value="UBLU"></v-list-item>
          <v-list-item prepend-icon="mdi-help-box" title="Drawing" value="UD"></v-list-item>
        </v-list-group>
      </v-list-group>
      <v-list-item prepend-icon="mdi-help-box" title="Help" value="help"></v-list-item>
      <v-list-item to="status" prepend-icon="mdi-list-status" title="Server Status" value="status"
        :active="route.path === '/status'"></v-list-item>
      <v-list-item prepend-icon="mdi-book-information-variant" title="Quick Reference" value="reference"></v-list-item>
      <v-divider></v-divider>
      <v-list-item prepend-icon="mdi-book-open-variant" title="Wiki" value="wiki" :active="false" href="https://docusaurus.io/" target="_blank"/>
      <v-list-item prepend-icon="mdi-bug" title="Report a bug" value="bug" :active="false"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import logo from "@/assets/logo.svg";
import { useRoute } from "vue-router";
import { ref, onMounted, computed, nextTick } from "vue";

const logoSrc = ref();
const openGroups = ref([]);
const route = useRoute();
const backPressed = ref(false);
const activeModules = computed(() => {
  const shouldBeActiveModules = ['/network', '/buyables', '/forward', '/solprop']
  return shouldBeActiveModules.some(el => route.path.includes(el));
})

function onDrawerCollapse(value) {
  if (value) {
    openGroups.value = [];
  }
}

async function closeGroupsOnBack(_value) {
  // wait for DOM to update
  await nextTick();
  if (backPressed.value === true) {
    openGroups.value = [];
    backPressed.value = false;
  }

}

onMounted(() => {
  openGroups.value = [];
  logoSrc.value = logo;
  // if back button is pressed
  window.onpopstate = function (_event) {
    backPressed.value = true;
  };
});
</script>

<style>
.v-icon {
  margin-inline-end: 0px;
}
</style>
