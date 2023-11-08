<template>
  <!-- <b-modal id="rec-templates-modal" title="Recommended Templates" size="xxl" footer-class="justify-content-between" centered scrollable @show="openRecTemplatesModal">
    <div class="text-center mb-3">
      <h3>Current Target</h3>
      <smiles-image :smiles="selected.smiles"></smiles-image>
    </div>
    <b-table v-else ref="rtmTable" :items="rtmItems" :fields="rtmFields" :current-page="rtmCurrentPage" :per-page="rtmItemsPerPage" hover responsive="true">
      <template #cell(reaction_smarts)="data">
        <smiles-image :smiles="data.value" transparent lazy allow-copy></smiles-image>
        <a :href="`/template/?id=${data.item._id}`" target="_blank">{{ data.item._id }} ({{ data.item.template_set }})</a>
      </template>
      <template #cell(results)="data">
        <template v-if="data.item.results !== undefined">
          <template v-if="data.item.results[0]">
            <smiles-image :smiles="data.item.results[0]" transparent lazy></smiles-image>
          </template>
          <template v-else> No Precursors </template>
        </template>
        <template v-else>
          <loading-button variant="primary" :loading="applyingTemplate === data.item._id" @click="apply(selected.smiles, data.item)"> Apply Template </loading-button>
        </template>
      </template>
    </b-table>
    <template #modal-footer="{ close }">
      <loading-button variant="info" :loading="loading" @click="predict(selected.smiles)"> Re-evaluate </loading-button>
      <b-button variant="outline-secondary" @click="close()">Close</b-button>
    </template>
  </b-modal> -->
  <v-dialog v-show="openRecTemplatesModal" max-width="85%">
    <v-card>
      <v-card-text>
        <v-col cols="12" class="text-center pa-0">
          <h3>Current Target</h3>
        </v-col>
        <v-col cols="12" align="center" justify="center" class="pa-0">
          <smiles-image class="align-center justify-center" :smiles="selected.smiles" max-width="300px"></smiles-image>
        </v-col>
        <v-data-table :headers="rtmFields" :items="rtmItems">
              <template #item.reaction_smarts="{ item }">
                <smiles-image :smiles="item.columns.reaction_smarts" input-type="template" highlight allow-copy></smiles-image>
                <a :href="`/template/?id=${item.raw._id}`" target="_blank">{{ item.raw._id }} ({{ item.raw.template_set }})</a>
              </template>
              <template #item.rank="{ item }">
                  <a :href="`/template/?id=${item.raw._id}`" target="_blank">{{ item.raw._id }} ({{ item.raw.template_set }})</a>
                </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="info" :loading="loading" @click="predict(selected.smiles)">Re-evaluate</v-btn>
        <v-btn text @click="dialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 
    <v-dialog v-model="dialog" width="90%">
      <template #activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on">Open Dialog</v-btn>
      </template>
      <v-card>
        <v-toolbar dense flat>
          <v-toolbar-title>Current Target</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <div class="text-center mb-3">
            <smiles-image :smiles="selected.smiles"></smiles-image>
          </div>
          <v-pagination v-model="rtmCurrentPage" :length="Math.ceil(rtmItems.length / rtmItemsPerPage)" circle></v-pagination>
          <v-skeleton-loader v-if="loading" type="table"></v-skeleton-loader>
          <v-data-table
            v-else
            :headers="rtmFields"
            :items="rtmItems"
            :items-per-page="rtmItemsPerPage"
            :page.sync="rtmCurrentPage"
          >
            <template #item.reaction_smarts="{ item }">
              <smiles-image :smiles="item.reaction_smarts" transparent lazy allow-copy></smiles-image>
              <a :href="`/template/?id=${item._id}`" target="_blank">{{ item._id }} ({{ item.template_set }})</a>
            </template>
            <template #item.results="{ item }">
              <template v-if="typeof item.results !== 'undefined'">
                <template v-if="item.results[0]">
                  <smiles-image :smiles="item.results[0]" transparent lazy></smiles-image>
                </template>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="info" :loading="loading" @click="predict(selected.smiles)">Re-evaluate</v-btn>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->
</template>

<script>
import { ref, computed } from "vue";
import CopyTooltip from "@/components/CopyTooltip";
import SmilesImage from "@/components/SmilesImage";
import { num2str } from "@/common/utils";
import { useResultsStore } from "@/store/results";

export default {
  name: "RecTemplatesModal",
  components: {
    SmilesImage,
    CopyTooltip,
  },
  props: {
    selected: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const resultsStore = useResultsStore();
    const rtmFields = ref([
      { key: "rank", title: "Original Rank", align: 'center' },
      { key: "score", title: "Score", align: 'center', formatter: (val) => num2str(val) },
      { key: "p_index", title: "Prioritizer", align: 'center' },
      { key: "reaction_smarts", title: "Template", align: 'center' },
    ]);
    const rtmItemsPerPage = ref(20);
    const rtmCurrentPage = ref(1);
    const loading = ref(false);
    const applyingTemplate = ref(null);

    const rtmItems = computed(() => {
      console.log(resultsStore)
      if (resultsStore.recommendedTemplates[props.selected.smiles]) {
        return Object.values(resultsStore.recommendedTemplates[props.selected.smiles]);
      } else {
        return [];
      }
    });

    const openRecTemplatesModal = () => {
      if (!resultsStore.recommendedTemplates[props.selected.smiles]) {
        predict(props.selected.smiles);
      }
    };

    const predict = (smiles) => {
      loading.value = true;
      resultsStore.templateRelevance(smiles)
      console.log(resultsStore.templateRelevance(smiles))
        .finally(() => {
          loading.value = false;
        });
    };

    // const apply = (smiles, template) => {
    //   applyingTemplate.value = template._id;
    //   resultsStore.applyTemplate({ smiles: smiles, template: template }).finally(() => {
    //     if (rtmTable.value) {
    //       rtmTable.value.refresh();
    //     }
    //     applyingTemplate.value = null;
    //   });
    // };

    return {
      rtmFields,
      rtmItemsPerPage,
      rtmCurrentPage,
      rtmItems,
      loading,
      applyingTemplate,
      openRecTemplatesModal,
      predict,
      // apply,
    };
  },
  mounted() {
    // The mounted lifecycle hook will signal the "ready" event when this component is rendered, allowing the parent to know that this component has finished rendering.
    this.$emit("ready");
  },
};
</script>
