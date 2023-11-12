<template>
  <v-container id="settings">
    <v-row>
      <v-col cols="12" class="text-center pa-0">
        <div>Target: {{ targetSmiles }}</div>
      </v-col>
      <v-col cols="12" align="center" justify="center" class="pa-0">
        <copy-tooltip :data="targetSmiles">
          <smiles-image v-if="targetSmiles" :smiles="targetSmiles" max-width="300px" />
        </copy-tooltip>
      </v-col>
    </v-row>
    <v-row>
      <v-table col="12" class="p-2">
        <template v-slot:default>
          <tbody>
            <tr v-if="settings.template_set">
              <th>Template set:</th>
              <td>Name: {{ settings.template_set }}</td>
              <td>Version: {{ settings.template_prioritizer_version || 'N/A' }}</td>
            </tr>
            <template v-else-if="settings.template_prioritizers">
              <tr v-for="(tp, index) in settings.template_prioritizers" :key="index">
                <th v-if="index === 0">Template prioritizers:</th>
                <th v-else></th>
                <td>Template set: {{ tp.template_set }}</td>
                <td>Version: {{ tp.version || 'N/A' }}</td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="(option, index) in settings.expand_one_options['retro_backend_options']" :key="index">
                <th v-if="index === 0">Retro options:</th>
                <th v-else></th>
                <td>Backend: {{ option.retro_backend }}</td>
                <td>Model Name: {{ option.retro_model_name }}</td>
              </tr>
            </template>
            <!-- <tr>
            <th>Tree builder version:</th>
            <td>{{ tbVersion > 1000 ? `C++ v${tbVersion % 1000}` : `v${tbVersion}` }}</td>
            <td></td>
          </tr> -->
            <tr>
              <th>Expansion settings:</th>
              <td>Max. depth: {{ settings.build_tree_options.max_depth }}</td>
              <td>Max. branching factor: {{ settings.build_tree_options.max_branching }}</td>
            </tr>
            <tr>
              <th></th>
              <td>Num. templates: {{ settings.expand_one_options.template_max_count }}</td>
              <td>Max cum. prob: {{ settings.expand_one_options.template_max_cum_prob }}</td>
            </tr>
            <tr>
              <th></th>
              <td>Expansion time (s): {{ settings.build_tree_options.expansion_time }}</td>
              <td>Max iterations: {{ settings.max_iterations || "N/A" }}</td>
            </tr>
            <tr>
              <th></th>
              <td>Max chemicals: {{ settings.max_chemicals || "N/A" }}</td>
              <td>Max reactions: {{ settings.max_reactions || "N/A" }}</td>
            </tr>
            <template v-if="!!settings['termination_logic']">
              <!-- New termination settings -->
              <template v-for="(criteria, logic) in settings['termination_logic']">
                <tr v-for="(criterion, index) in criteria" :key="logic + criterion">
                  <th v-if="index === 0">Stop criteria ({{ logic.toUpperCase() }}):</th>
                  <th v-else></th>
                  <td v-if="criterion === 'buyable'" colspan=2>
                    Chemical found in buyables database
                  </td>
                  <td v-if="criterion === 'max_ppg'" colspan=2>
                    Max. chemical price ($/g): {{ settings.max_ppg }}
                  </td>
                  <td v-if="criterion === 'max_scscore'" colspan=2>
                    Max. SCScore: {{ settings.max_scscore }}
                  </td>
                  <td v-if="criterion === 'max_elements'" colspan=2>
                    Max. element counts:
                    <span v-if="'C' in settings['max_elements']">C &leq; {{ settings['max_elements']['C'] }};</span>
                    <span v-if="'N' in settings['max_elements']">N &leq; {{ settings['max_elements']['N'] }};</span>
                    <span v-if="'H' in settings['max_elements']">H &leq; {{ settings['max_elements']['H'] }};</span>
                    <span v-if="'O' in settings['max_elements']">O &leq; {{ settings['max_elements']['O'] }};</span>
                  </td>
                  <td v-if="criterion === 'min_history'" colspan=2>
                    Min. popularity:
                    <span v-if="'as_reactant' in settings['min_history']">
                      occurrences as reactant &geq; {{ settings['min_history']['as_reactant'] }};
                    </span>
                    <span v-if="'as_product' in settings['min_history']">
                      occurrences as product &geq; {{ settings['min_history']['as_product'] }};
                    </span>
                  </td>
                </tr>
              </template>
            </template>
            <template v-else>
              <!-- Old termination settings -->
              <tr>
                <th>Stop criteria:</th>
                <td>Maximum chemical price ($/g): {{ settings.max_ppg }}</td>
                <td></td>
              </tr>
              <tr v-if="!!settings['max_natom_dict'] && settings['max_natom_dict']['logic'] !== 'none'">
                <th></th>
                <td>
                  Chemical property logic:
                  C &leq; {{ settings['max_natom_dict']['C'] }}
                  N &leq; {{ settings['max_natom_dict']['N'] }}
                  H &leq; {{ settings['max_natom_dict']['H'] }}
                  O &leq; {{ settings['max_natom_dict']['O'] }}
                </td>
              </tr>
              <tr
                v-if="!!settings['min_chemical_history_dict'] && settings['min_chemical_history_dict']['logic'] !== 'none'">
                <th></th>
                <td>
                  Chemical popularity logic:
                  Min. freq. as reactant &geq; {{ settings['min_chemical_history_dict']['as_reactant'] }}
                  Min. freq. as product &geq; {{ settings['min_chemical_history_dict']['as_product'] }}
                </td>
              </tr>
            </template>
            <tr>
              <th>Evaluation settings:</th>
              <td>Min. plausibility: {{ settings.expand_one_options['filter_threshold'] }}</td>
              <td></td>
            </tr>
            <tr>
              <th>Buyables source(s):</th>
              <td>{{ buyablesSources }}</td>
              <td></td>
            </tr>
            <tr v-if="!!settings.expand_one_options['banned_chemicals']">
              <th>Banned chemicals(s):</th>
              <td>{{ settings.expand_one_options['banned_chemicals'].length }}</td>
              <td></td>
            </tr>
            <tr v-if="!!settings.expand_one_options['banned_reactions']">
              <th>Banned reactions:</th>
              <td>{{ settings.expand_one_options['banned_reactions'].length }}</td>
              <td></td>
            </tr>
          </tbody>
        </template>
      </v-table>
    </v-row>
  </v-container>
</template>

<script>
import CopyTooltip from "@/components/CopyTooltip";
import SmilesImage from "@/components/SmilesImage";
import { sourceQueryToArgs, sourceArgsToDisplay } from "@/common/buyables";

export default {
  name: 'TbSettingsTable',
  components: {
    CopyTooltip,
    SmilesImage,
  },
  props: {
    id: {
      type: String,
      default: 'settings-table'
    },
    settings: {
      type: Object,
      default: () => ({}),
    },
    targetSmiles: {
      type: String,
      default: ''
    },
  },
  computed: {
    // tbVersion() {
    //   // If version is not present in the result, then it is version 1
    //   return this.settings['version'] || 1
    // },
    buyablesSources() {
      if (this.settings['buyables_source']) {
        return sourceArgsToDisplay(sourceQueryToArgs(this.settings.buyables_source))
      } else {
        return 'All'
      }
    },
  },
}
</script>

