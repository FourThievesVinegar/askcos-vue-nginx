<template>
  <v-dialog v-model="propShow" @open="openRecTemplatesModal" scrollable>
    <v-card>
      <v-card-title>
        Recommended Templates
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-0">
        <v-col cols="12" class="text-center pa-0">
          <h3>Current Target</h3>
        </v-col>
        <v-col cols="12" align="center" justify="center" class="pa-0">
          <smiles-image class="align-center justify-center" :smiles="selected.smiles" max-width="300px"></smiles-image>
        </v-col>
        <v-data-table :headers="rtmFields" :items="rtmItems" density="compact">
          <template #item.reaction_smarts="{ item }">
            <smiles-image :smiles="item.columns.reaction_smarts" input-type="template" highlight
              allow-copy></smiles-image>
            <a :href="`/template?id=${item.raw._id}`" target="_blank">{{ item.raw._id }} ({{ item.raw.template_set
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
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" :loading="loading" @click="predict(selected.smiles)" variant="tonal">Re-evaluate</v-btn>
        <v-btn @click="close()" variant="tonal" color="red">Close</v-btn>
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
      { key: "rank", title: "Original Rank", align: 'center', width: '10%' },
      { key: "score", title: "Score", align: 'center', width: '10%' },
      { key: "p_index", title: "Prioritizer", align: 'center', width: '10%' },
      { key: "reaction_smarts", title: "Template", align: 'center', width: '70%' },
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
