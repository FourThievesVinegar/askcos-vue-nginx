<template>
  <v-container fluid style="min-height: calc(100vh-50px)">
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <v-sheet elevation="2"
          ><v-tabs
            v-model="tab"
            color="primary"
            align-tabs="center"
            grow
            class="mb-4"
          >
            <v-tab value="IPP">Interactive Path Planner</v-tab>
            <v-tab value="RP">Retro Synthesis</v-tab>
            <v-tab value="TE" disabled>Tree Explorer</v-tab>
          </v-tabs></v-sheet
        >
        <v-window v-model="tab" class="elevation-2">
          <v-window-item value="IPP">
            <NetworkView />
          </v-window-item>
          <v-window-item value="RP"> RP </v-window-item>

          <v-window-item value="TE"> TE </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import NetworkView from "@/views/network/tabs/NetworkView";
import { useResultsStore } from "@/store/results";

export default {
  name: "App",
  components: {
    NetworkView,
  },
  setup() {
    const route = useRoute();
    const resultsStore = useResultsStore();
    const network = ref(null);
    const treeDetail = ref(null);
    const treeViewVisible = ref(false);
    const tab = ref("");

    const loadResultFromURL = async (payload) => {
      await resultsStore.loadResult(payload);
    };

    onMounted(() => {
      let urlParams = route.query;
      let urlTab = urlParams.tab;
      if (urlTab !== null) {
        tab.value = urlTab;
      }

      let resultId = urlParams.id;
      if (resultId) {
        treeViewVisible.value = true;
      }
      let numTrees = urlParams.view;
      if (resultId) {
        loadResultFromURL({ resultId: resultId, numTrees: numTrees }).then(
          () => {
            init(tab.value);
          }
        );
      }
    });

    const init = (tab) => {
      if (tab === "0" && network.value) {
        network.value.init();
      } else if (tab === "2" && treeDetail.value) {
        treeDetail.value.init();
      }
    };

    return {
      treeViewVisible,
      network,
      treeDetail,
      tab,
    };
  },
};
</script>
