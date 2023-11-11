<template>
  <v-navigation-drawer expand-on-hover rail elevation="2" width="1000px" class="sidebar"
    @update:rail="($event) => rail = $event">
    <v-list>
      <v-list-item prepend-icon="mdi-tools" title="ASKCOS" subtitle="Demo" to="/" value="home"
        :active="false"></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list nav v-model:opened="openedGroups" color="primary">
      <v-list-item prepend-icon="mdi-home" title="Home" to="/" value="home" :active="route.path === '/'"></v-list-item>
      <v-list-group value="modules" no-action>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-file-tree" title="Modules" :active="activeModules"
            :variant="activeModules ? 'tonal' : 'text'"></v-list-item>
        </template>
        <v-list-group value="Retrosynthesis" subgroup>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Retrosynthesis"></v-list-item>
          </template>

          <v-list-item to="/network?tab=IPP" title="Interactive Path Planning/Tree Builder" value="IPP"
            :active="route.query.tab === 'IPP'"></v-list-item>
          <v-list-item to="/network?tab=RP" title="Retrosynthesis Prediction" value="RP"
            :active="route.query.tab === 'RP'"></v-list-item>
        </v-list-group>

        <v-list-group value="ForwardSynthesis" subgroup>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Forward Synthesis"></v-list-item>
          </template>

          <v-list-item to="/forward?tab=context" title="Condition Recommendation" value="context"
            :active="route.query.tab === 'context'"></v-list-item>
          <v-list-item to="/forward?tab=forward" title="Product Prediction" value="forward"
            :active="route.query.tab === 'forward'"></v-list-item>
          <v-list-item to="/forward?tab=impurity" title="Impurity Prediction" value="impurity"
            :active="route.query.tab === 'impurity'"></v-list-item>
          <v-list-item to="/forward?tab=selectivity" title="Regio-selectivity Prediction" value="selectivity"
            :active="route.query.tab === 'selectivity'"></v-list-item>
          <v-list-item to="/forward?tab=sites" title="Aromatic C-H Functionalization" value="sites"
            :active="route.query.tab === 'sites'"></v-list-item>
        </v-list-group>

        <v-list-group value="Utilities" subgroup>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Utilities"></v-list-item>
          </template>

          <v-list-item to="/solprop?tab=solpred" title="Solubility Prediction" value="USP"
            :active="route.query.tab === 'solpred'"></v-list-item>
          <v-list-item to="/solprop?tab=solscreen" title="Solvent Screening" value="USS"
            :active="route.query.tab === 'solscreen'"></v-list-item>
          <v-list-item to="/buyables" title="Buyable Look-up" value="UBLU"></v-list-item>
          <v-list-item to="/drawing" title="Drawing" value="UD"></v-list-item>
        </v-list-group>
      </v-list-group>
      <v-list-item to="/status" prepend-icon="mdi-list-status" title="Server Status" value="status"
        :active="route.path === '/status'"></v-list-item>
      <v-divider></v-divider>
      <v-list-item prepend-icon="mdi-book-open-variant" title="Wiki" value="wiki" :active="false"
        href="https://gitlab.com/mlpds_mit/askcosv2/askcos-docs/-/wikis/home" target="_blank" />
      <v-list-item prepend-icon="mdi-bug" title="Report a bug" value="bug" :active="false">
        <TheSupportModal />
      </v-list-item>
      <v-list-item prepend-icon="mdi-code-json" title="Logs" value="logs" to="/logs"></v-list-item>
      <v-divider></v-divider>
      <v-list-item v-if=!isLoggedIn to="/login" prepend-icon="mdi-login" title="Login" :active="false"></v-list-item>
      <v-list-group v-if=isLoggedIn value="profile" no-action>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-account-circle" title="Profile" :active="activeProfile"
            :variant="activeProfile ? 'tonal' : 'text'"></v-list-item>
        </template>
        <v-list-item prepend-icon="mdi-table" title="My Results" value="result" to="/results"></v-list-item>
        <v-list-item prepend-icon="mdi-cancel" title="My Banlist" value="banlist" to="/banlist"></v-list-item>
      </v-list-group>
      <v-list-item v-if=isLoggedIn @click="logout" prepend-icon="mdi-logout" title="Logout" :active="false"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, computed } from "vue";
import TheSupportModal from "@/components/TheSupportModal.vue"

const _openedGroups = ref(['modules', 'profile']);
const route = useRoute();
const router = useRouter();
const rail = ref(true)

const openedGroups = computed({
  get: () => rail.value ? [] : _openedGroups.value,
  set: val => {
    if (val.length === 0) {
      _openedGroups.value = ['modules', 'profile']
    } else {
      _openedGroups.value = val
    }
  },
})

const activeModules = computed(() => {
  const shouldBeActiveModules = ['/network', '/buyables', '/forward', '/solprop']
  return shouldBeActiveModules.some(el => route.path.includes(el));
})

const activeProfile = computed(() => {
  const shouldBeActiveProfile = ['/results', '/banlist']
  return shouldBeActiveProfile.some(el => route.path.includes(el));
})

const isLoggedIn = computed(() => {
  const accessToken = localStorage.getItem('accessToken');
  return accessToken ? true : false;
})

function logout() {
  localStorage.removeItem("accessToken");
  router.push({ path: '/login' })
}
</script>

<style scoped>
.sidebar {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
}

.v-icon {
  margin-inline-end: 0px;
}
</style>
