<template>
  <!-- <b-modal id="rec-templates-modal" title="Recommended Templates" size="xxl" footer-class="justify-content-between" centered scrollable @show="openRecTemplatesModal">
    <div class="text-center mb-3">
      <h3>Current Target</h3>
      <smiles-image :smiles="selected.smiles"></smiles-image>
    </div>
    <b-pagination v-model="rtmCurrentPage" :total-rows="rtmItems.length" :per-page="rtmItemsPerPage" align="center"></b-pagination>

    <b-skeleton-table v-if="loading" :rows="20" :columns="4"></b-skeleton-table>
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

  <template>
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
                <template v-else>No Precursors</template>
              </template>
              <template v-else>
                <v-btn :loading="applyingTemplate === item._id" @click="apply(selected.smiles, item)">Apply Template</v-btn>
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
    </v-dialog>
  </template>

</template>

<script>
  import { ref, computed } from "vue";
  // import LoadingButton from "@/components/LoadingButton";
  import SmilesImage from "@/components/SmilesImage";
  import { num2str } from "@/common/utils";
  import { useResultsStore } from "@/store/results";

  export default {
    name: "RecTemplatesModal",
    components: {
      SmilesImage,
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
        { key: "rank", label: "Original Rank", class: "text-center" },
        { key: "score", label: "Score", class: "text-center", formatter: (val) => num2str(val) },
        { key: "p_index", label: "Prioritizer", class: "text-center" },
        { key: "reaction_smarts", label: "Template", class: "text-center" },
        { key: "results", label: "Result", class: "text-center" },
      ]);
      const rtmItemsPerPage = ref(20);
      const rtmCurrentPage = ref(1);
      const loading = ref(false);
      const applyingTemplate = ref(null);
      const rtmTable = ref(null);

      const rtmItems = computed(() => {
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
        resultsStore.templateRelevance(smiles).finally(() => {
          loading.value = false;
        });
      };

      const apply = (smiles, template) => {
        applyingTemplate.value = template._id;
        resultsStore.applyTemplate({ smiles: smiles, template: template }).finally(() => {
          if (rtmTable.value) {
            rtmTable.value.refresh();
          }
          applyingTemplate.value = null;
        });
      };

      return {
        rtmFields,
        rtmItemsPerPage,
        rtmCurrentPage,
        rtmItems,
        loading,
        applyingTemplate,
        openRecTemplatesModal,
        predict,
        apply,
      };
    },
    mounted() {
      // The mounted lifecycle hook will signal the "ready" event when this component is rendered, allowing the parent to know that this component has finished rendering.
      this.$emit("ready");
    },
  };
</script>
