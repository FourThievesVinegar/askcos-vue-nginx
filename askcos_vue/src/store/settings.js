// Pinia Store
import { defineStore } from "pinia";

import { updateObj } from "@/common/utils";
import { ippSettingsDefault, tbSettingsDefault, visjsOptionsDefault, getVisjsUserOptions } from "@/store/init/settings";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    allowCluster: ippSettingsDefault.allowCluster,
    allowResolve: ippSettingsDefault.allowResolve,
    clusterOptions: JSON.parse(JSON.stringify(ippSettingsDefault.clusterOptions)),
    isHighlightAtom: ippSettingsDefault.isHighlightAtom,
    alignNodeImagesToTarget: ippSettingsDefault.alignNodeImagesToTarget,
    alignPrecursorsToProduct: ippSettingsDefault.alignPrecursorsToProduct,
    reactionLimit: ippSettingsDefault.reactionLimit,
    selectivityModel: ippSettingsDefault.selectivityModel,
    sortingCategory: ippSettingsDefault.sortingCategory,
    sortOrderAscending: ippSettingsDefault.sortOrderAscending,
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
    resetSettings() {
      this.tbSettings = JSON.parse(JSON.stringify(tbSettingsDefault));
      this.visjsOptions = JSON.parse(JSON.stringify(visjsOptionsDefault));
      updateObj(this, JSON.parse(JSON.stringify(ippSettingsDefault)));
    },
    // Mutations for entire options objects
    setIppSettings(options) {
      if (options.sortingCategory === "score") {
        options.sortingCategory = "retroScore";
      }
      updateObj(this, options);
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
    addAttributeFilter({ strategyIndex, prioritizerIndex, item }) {
      this.tbSettings.strategies[strategyIndex].templatePrioritizers[prioritizerIndex]["attribute_filter"].push(item);
    },
    deleteAttributeFilter({ strategyIndex, prioritizerIndex, attrFilterIndex }) {
      this.tbSettings.strategies[strategyIndex].templatePrioritizers[prioritizerIndex]["attribute_filter"].splice(attrFilterIndex, 1);
    },
    updateAttributeFilter({ strategyIndex, prioritizerIndex, attrFilterIndex, key, value }) {
      this.tbSettings.strategies[strategyIndex].templatePrioritizers[prioritizerIndex]["attribute_filter"][attrFilterIndex][key] = value;
    },
    addTemplatePrioritizer({ strategyIndex, item }) {
      this.tbSettings.strategies[strategyIndex].templatePrioritizers.push(item);
    },
    deleteTemplatePrioritizer({ strategyIndex, prioritizerIndex }) {
      this.tbSettings.strategies[strategyIndex].templatePrioritizers.splice(prioritizerIndex, 1);
    },
    updateTemplatePrioritizer({ strategyIndex, prioritizerIndex, key, value }) {
      this.tbSettings.strategies[strategyIndex].templatePrioritizers[prioritizerIndex][key] = value;
    },
    addStrategy({ item }) {
      this.tbSettings.strategies.push(item);
    },
    deleteStrategy({ strategyIndex }) {
      this.tbSettings.strategies.splice(strategyIndex, 1);
    },
    updateStrategy({ strategyIndex, key, value }) {
      this.tbSettings.strategies[strategyIndex][key] = value;
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
