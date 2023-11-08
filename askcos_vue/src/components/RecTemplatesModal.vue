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
  <v-dialog v-model="propShow" @open="openRecTemplatesModal" max-width="85%">
    <v-card>
      <v-card-title class="mt-2">
        <v-col cols="12">Recommended Templates</v-col>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-col cols="12" class="text-center pa-0">
          <h3>Current Target</h3>
        </v-col>
        <v-col cols="12" align="center" justify="center" class="pa-0">
          <smiles-image class="align-center justify-center" :smiles="selected.smiles" max-width="300px"></smiles-image>
        </v-col>
        <v-data-table :headers="rtmFields" :items="rtmItems">
          <template #item.reaction_smarts="{ item }">
            <smiles-image :smiles="item.columns.reaction_smarts" input-type="template" highlight
              allow-copy></smiles-image>
            <a :href="`/template/?id=${item.raw._id}`" target="_blank">{{ item.raw._id }} ({{ item.raw.template_set
            }})</a>
          </template>
          <template #item.rank="{ item }">
            {{ item.raw.template_rank }}
          </template>
          <template #item.score="{ item }">
            {{ item.raw.template_score.toFixed(4) }}
          </template>
          <template #item.p_index="{ item }">
            {{ item.raw.index }}
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="info" :loading="loading" @click="predict(selected.smiles)">Re-evaluate</v-btn>
        <v-btn text @click="close()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed } from "vue";
import CopyTooltip from "@/components/CopyTooltip";
import SmilesImage from "@/components/SmilesImage";
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
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const resultsStore = useResultsStore();
    const rtmFields = ref([
      { key: "rank", title: "Original Rank", align: 'center' },
      { key: "score", title: "Score", align: 'center' },
      { key: "p_index", title: "Prioritizer", align: 'center' },
      { key: "reaction_smarts", title: "Template", align: 'center', },
    ]);
    const rtmItemsPerPage = ref(20);
    const rtmCurrentPage = ref(1);
    const loading = ref(false);

    const rtmItems = computed(() => {
      if (resultsStore.recommendedTemplates[props.selected.smiles]) {
        return Object.values(resultsStore.recommendedTemplates[props.selected.smiles]);
      } else {
        return [];
      }
    });

    const openRecTemplatesModal = computed(() => {
      if (!resultsStore.recommendedTemplates[props.selected.smiles]) {
        predict(props.selected.smiles);
      }
    })

    const predict = (smiles) => {
      loading.value = true;
      resultsStore.templateRelevance(smiles)
        .finally(() => {
          loading.value = false;
        });
    };
    
    const propShow = computed({
      get() {
        return props.visible
      },
      set(newVal) {
        context.emit("close-dialog", newVal)
      }
    })

    const close = () => {
      context.emit("close-dialog", false)
    }

    return {
      rtmFields,
      rtmItemsPerPage,
      rtmCurrentPage,
      rtmItems,
      loading,
      openRecTemplatesModal,
      predict,
      close,
      propShow,
    };
  },
};
</script>
