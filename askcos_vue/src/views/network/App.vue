<template>
  <v-container fluid style="min-height: calc(100vh-50px)">
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <v-sheet elevation="2">
          <v-tabs v-model="tab" color="primary" align-tabs="center" grow class="mb-4">
            <v-tab @click="replaceRoute('IPP')" value="IPP">Interactive Path Planner</v-tab>
            <v-tab @click="replaceRoute('RP')" value="RP">Retro Synthesis</v-tab>
            <v-tab @click="replaceRoute('TE')" value="TE" disabled>Tree Explorer</v-tab>
          </v-tabs>
        </v-sheet>
        <v-window v-model="tab" :class="tab === 'IPP' ? 'elevation-2' : 'elevation-0'">
          <v-window-item value="IPP">
            <NetworkView />
          </v-window-item>
          <v-window-item value="RP">
            <RetroView />
          </v-window-item>
          <v-window-item value="TE"> TE </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import NetworkView from "@/views/network/tabs/NetworkView";
import RetroView from "@/views/network/tabs//RetroView.vue";
import { useResultsStore } from "@/store/results";

export default {
  name: "App",
  components: {
    NetworkView,
    RetroView
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const resultsStore = useResultsStore();
    const network = ref(null);
    const treeDetail = ref(null);
    const treeViewVisible = ref(false);
    const tab = ref("IPP");

    const replaceRoute = (tab) => {
      router.replace({ path: '/network', query: { tab } })
    }

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
      if (tab === "IPP" && network.value) {
        network.value.init();
      } else if (tab === "TE" && treeDetail.value) {
        treeDetail.value.init();
      }
    };

    watch(route, async (newRoute, oldRoute) => {
      if (newRoute.path === '/network') {
        tab.value = newRoute.query.tab
      }
    })

    return {
      replaceRoute,
      treeViewVisible,
      network,
      treeDetail,
      tab,
    };
  },
};
</script>
