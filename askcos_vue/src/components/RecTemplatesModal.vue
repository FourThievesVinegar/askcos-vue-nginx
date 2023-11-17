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
        <v-data-table  ref="rtmTable" :headers="rtmFields" :items="rtmItems" density="compact">
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
            1
          </template>
          <template #item.results="{ item }">
            <template v-if="item.raw.results !== undefined">
              <template v-if="item.raw.results[0]">
                <smiles-image :smiles="item.raw.results[0]" transparent></smiles-image>
              </template>
              <template v-else> No Precursors </template>
            </template>
              <template v-else>
                <v-btn variant="tonal" color="primary" :loading="applyingTemplate === item.raw._id"
                  @click="apply(selected.smiles, item.raw)"> Apply Template </v-btn>
              </template>
            </template>
        </v-data-table>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
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
      { key: "results", title: "Results", align: 'center'},
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

    const openRecTemplatesModal = computed(() => {
      if (!props.selected) {
        return;
      }
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

    const apply = (smiles, template) => {
      applyingTemplate.value = template._id;
      resultsStore.applyTemplate({ smiles: smiles, template: template }).finally(() => {
        if (rtmTable.value) {
          rtmTable.value.refresh();
        }
        applyingTemplate.value = null;
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
      apply,
      applyingTemplate,
      propShow,
    };
  },
  mounted() {
    // The mounted lifecycle hook will signal the "ready" event when this component is rendered, allowing the parent to know that this component has finished rendering.
    this.$emit("ready");
  },
};
</script>

