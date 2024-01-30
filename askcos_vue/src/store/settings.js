// Pinia Store
import { defineStore } from "pinia";

import { updateObj } from "@/common/utils";
import { interactive_path_planner_settings_default, tree_builder_settings_default,ippSettingsDefault, tbSettingsDefault, visjsOptionsDefault, getVisjsUserOptions } from "@/store/init/settings";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    allowCluster: interactive_path_planner_settings_default.cluster_precursors,
    allowResolve: ippSettingsDefault.allowResolve,
    isHighlightAtom: ippSettingsDefault.isHighlightAtom,
    alignNodeImagesToTarget: ippSettingsDefault.alignNodeImagesToTarget,
    alignPrecursorsToProduct: ippSettingsDefault.alignPrecursorsToProduct,
    reactionLimit: ippSettingsDefault.reactionLimit,
    modelRank: ippSettingsDefault.modelRank,
    interactive_path_planner_settings: JSON.parse(JSON.stringify(interactive_path_planner_settings_default)),
    tree_builder_settings: JSON.parse(JSON.stringify(tree_builder_settings_default)),
    tbSettings: JSON.parse(JSON.stringify(tbSettingsDefault)),
    visjsOptions: JSON.parse(JSON.stringify(visjsOptionsDefault)),
  }),
  getters: {
    ippSettings: (state) => {
      return {
        allowCluster: state.allowCluster,
        allowResolve: state.allowResolve,
        clusterOptions: state.clusterOptions,
        isHighlightAtom: state.isHighlightAtom,
        alignNodeImagesToTarget: state.alignNodeImagesToTarget,
        alignPrecursorsToProduct: state.alignPrecursorsToProduct,
        reactionLimit: state.reactionLimit,
        modelRank: state.modelRank,
        selectivityModel: state.selectivityModel,
        sortingCategory: state.sortingCategory,
        sortOrderAscending: state.sortOrderAscending,
      };
    },
    visjsUserOptions: (state) => {
      return getVisjsUserOptions(state.visjsOptions);
    },
  },
  actions: {
    // Mutations for entire options objects
    resetSettings() {
      this.interactive_path_planner_settings = JSON.parse(JSON.stringify(interactive_path_planner_settings_default))
      this.tree_builder_settings = JSON.parse(JSON.stringify(tree_builder_settings_default));
      this.tbSettings = JSON.parse(JSON.stringify(tbSettingsDefault));
      this.visjsOptions = JSON.parse(JSON.stringify(visjsOptionsDefault));
      updateObj(this, JSON.parse(JSON.stringify(ippSettingsDefault)));
    },
    setInteractivePathPlannerSettings(options) {
      updateObj(this.interactive_path_planner_settings, options)
    },
    setIppSettings(options) {
      if (options.sortingCategory === "score") {
        options.sortingCategory = "retroScore";
      }
      updateObj(this, options);
    },
    setTreeBuilderSettings(options) {
      updateObj(this.tree_builder_settings, options)
    },
    setTbSettings(options) {
      // Check for old template prioritizer settings
      if ("templateSet" in options) {
        let templatePrioritizers = [{ template_set: options.templateSet, version: options.templateSetVersion, attribute_filter: options.attributeFilter }];
        delete options.templateSet;
        delete options.templateSetVersion;
        delete options.attributeFilter;
        options.templatePrioritizers = templatePrioritizers;
      }
      updateObj(this.tbSettings, options);
    },
    setVisjsOptions(options) {
      const userOptions = getVisjsUserOptions(this.visjsOptions);
      updateObj(userOptions, options);
      updateObj(this.visjsOptions, userOptions);
    },
    // Mutations for specific keys
    setClusterOption({ key, value }) {
      this.clusterOptions[key] = value;
    },
    setTbSetting({ key, value }) {
      this.tbSettings[key] = value;
    },
    setOption({ key, value }) {
      this[key] = value;
    },
    // Mutations for individual options
    addAttributeFilter({ strategyIndex, item }) {
      this.interactive_path_planner_settings.retro_backend_options[strategyIndex]["attribute_filter"].push(item);
    },
    deleteAttributeFilter({ strategyIndex, attrFilterIndex }) {
      this.interactive_path_planner_settings.retro_backend_options[strategyIndex]["attribute_filter"].splice(attrFilterIndex, 1);
    },
    updateAttributeFilter({ strategyIndex, attrFilterIndex, key, value }) {
      this.interactive_path_planner_settings.retro_backend_options[strategyIndex]["attribute_filter"][attrFilterIndex][key] = value;
    },
    addTemplatePrioritizer({ strategyIndex, item }) {
      this.interactive_path_planner_settings.retro_backend_options[strategyIndex].templatePrioritizers.push(item);
    },
    addStrategy({ item }) {
      this.interactive_path_planner_settings.retro_backend_options.push(item);
    },
    deleteStrategy({ strategyIndex }) {
      this.interactive_path_planner_settings.retro_backend_options.splice(strategyIndex, 1);
    },
    updateStrategy({ strategyIndex, key, value }) {
      this.interactive_path_planner_settings.retro_backend_options[strategyIndex][key] = value;
    },
    setVisSpringConstant(value) {
      this.visjsOptions.physics.barnesHut.springConstant = value;
    },
    setVisNodeSize(value) {
      this.visjsOptions.nodes.size = value;
    },
    setVisNodeFontSize(value) {
      this.visjsOptions.nodes.font.size = value;
    },
    setVisNodeMass(value) {
      this.visjsOptions.nodes.mass = value;
    },
    setVisHierachicalEnabled(value) {
      this.visjsOptions.layout.hierarchical.enabled = value;
    },
    setVisHierarchicalDirection(value) {
      this.visjsOptions.layout.hierarchical.direction = value;
    },
    setVisHierarchicalLevelSeparation(value) {
      this.visjsOptions.layout.hierarchical.levelSeparation = value;
    },
  },
});
