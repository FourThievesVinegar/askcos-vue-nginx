<template>
  <v-navigation-drawer
    expand-on-hover
    rail
    elevation="10"
    @update:rail="onDrawerCollapse"
  >
    <v-list>
      <v-list-item
        prepend-icon="mdi-chemical-weapon"
        title="ASKCOS"
        subtitle="by MIT ChemE"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="comfortable" nav v-model:opened="openGroups">
      <v-list-group value="modules" no-action>
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-file-tree"
            title="Modules"
            value="modules"
          ></v-list-item>
        </template>
        <v-list-item
          prepend-icon="mdi-help-box"
          title="Overview"
          value="overview"
        ></v-list-item>
        <v-divider></v-divider>
        <v-list-item
          prepend-icon="mdi-help-box"
          title="Interactive Path Planning/Tree Builder"
          value="IIP"
        ></v-list-item>
      </v-list-group>
      <v-list-item
        prepend-icon="mdi-help-box"
        title="Help"
        value="help"
      ></v-list-item>
      <v-list-item
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
import { ref } from "vue";

// const listGroupExpanded = ref(true);
const openGroups = ref([]);

function onDrawerCollapse(value) {
  if (value) {
    openGroups.value = [];
  }
}
</script>
