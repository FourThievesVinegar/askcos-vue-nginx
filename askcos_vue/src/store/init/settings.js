/*
 * Default settings for interactive path planner
 */

const tbSettingsDefault = {
  strategies: [
    {
      retro_backend: "template_relevance",
      retro_model_name: 'reaxys',
      max_num_templates: 1000,
      max_cum_prob: 0.999,
      attribute_filter: [],
    },
  ],
  quick: "normal",
  version: 1,
  maxDepth: 5,
  maxBranching: 20,
  expansionTime: 60,
  maxChemicals: null,
  maxReactions: null,
  maxIterations: null,
  maxTemplates: null,
  buyableLogic: "and",
  maxPPGLogic: "none",
  maxPPG: 100,
  maxScscoreLogic: "none",
  maxScscore: 0,
  chemicalPropertyLogic: "none",
  chemicalPropertyC: 0,
  chemicalPropertyN: 0,
  chemicalPropertyO: 0,
  chemicalPropertyH: 0,
  chemicalPopularityLogic: "none",
  chemicalPopularityReactants: 0,
  chemicalPopularityProducts: 0,
  buyablesSource: [],
  buyablesSourceAll: true,
  returnFirst: false,
  maxTrees: 500,
  templatePrioritizers: [{ template_set: "reaxys", version: 1, attribute_filter: [] }],
  precursorScoring: "relevance_heuristic",
  numTemplates: 1000,
  maxCumProb: 0.999,
  minPlausibility: 0.1,
  allowSelec: true,
  clusterTrees: true,
  clusterMethod: "hdbscan",
  clusterMinSamples: 5,
  clusterMinSize: 5,
  classifyReactions: false,
  redirectToGraph: false,
};

const ippSettingsDefault = {
  allowCluster: false,
  filterReactingAtoms: false,
  allowResolve: false,
  isHighlightAtom: true,
  alignNodeImagesToTarget: false,
  alignPrecursorsToProduct: true,
  reactionLimit: 5,
  sortingCategory: "retroScore",
  sortOrderAscending: false,
  selectivityModel: "qm_GNN",
  clusterOptions: {
    feature: "original",
    fingerprint: "morgan",
    fpRadius: 1,
    fpBits: 512,
    cluster_method: "kmeans",
    isAlternatingColor: false,
  },
};

const visjsOptionsDefault = {
  edges: {
    length: 1,
  },
  nodes: {
    mass: 1,
    size: 32,
    font: {
      size: 14,
    },
    color: {
      border: "#000000",
      background: "#FFFFFF",
    },
    shapeProperties: {
      useBorderWithImage: true,
    },
  },
  layout: {
    hierarchical: {
      enabled: false,
      levelSeparation: 150,
      nodeSpacing: 120,
      treeSpacing: 200,
      blockShifting: true,
      edgeMinimization: true,
      parentCentralization: true,
      direction: "UD",
      sortMethod: "directed",
      shakeTowards: "roots",
    },
  },
  interaction: {
    dragNodes: true,
    dragView: true,
    hideEdgesOnDrag: false,
    hideNodesOnDrag: false,
    hover: false,
    hoverConnectedEdges: true,
    keyboard: {
      enabled: false,
      speed: { x: 10, y: 10, zoom: 0.02 },
      bindToWindow: true,
    },
    multiselect: true,
    navigationButtons: false,
    selectable: true,
    selectConnectedEdges: true,
    tooltipDelay: 300,
    zoomView: true,
  },
  physics: {
    enabled: true,
    hierarchicalRepulsion: {
      nodeDistance: 120,
      avoidOverlap: 1,
    },
    barnesHut: {
      gravitationalConstant: -2000,
      centralGravity: 0.3,
      springLength: 95,
      springConstant: 0.04,
      damping: 0.09,
      avoidOverlap: 0,
    },
    maxVelocity: 50,
    minVelocity: 0.1,
    solver: "barnesHut",
    stabilization: {
      enabled: true,
      iterations: 1000,
      updateInterval: 100,
      onlyDynamicEdges: false,
      fit: true,
    },
    timestep: 0.5,
    adaptiveTimestep: true,
  },
};

const visjsOptionsTreeDefault = {
  nodes: {
    color: {
      background: "#FFFFFF",
      border: "#000000",
    },
    shapeProperties: {
      useBorderWithImage: true,
      useImageSize: true,
    },
  },
  edges: {
    length: 1,
  },
  interaction: {
    dragNodes: false,
    dragView: true,
    hover: true,
    multiselect: false,
    selectConnectedEdges: false,
    tooltipDelay: 0,
    zoomView: true,
  },
  layout: {
    hierarchical: {
      direction: "LR",
      levelSeparation: 250,
      nodeSpacing: 175,
      sortMethod: "directed",
      shakeTowards: "roots",
    },
  },
  physics: false,
};

const visjsOptionsTreeCondensed = {
  nodes: {
    color: {
      background: "#FFFFFF",
      border: "#000000",
    },
    shapeProperties: {
      useImageSize: true,
    },
  },
  edges: {
    length: 1,
  },
  interaction: {
    dragNodes: false,
    dragView: true,
    hover: false,
    multiselect: false,
    selectable: false,
    selectConnectedEdges: false,
    tooltipDelay: 0,
    zoomView: true,
  },
  layout: {
    hierarchical: {
      direction: "LR",
      levelSeparation: 200,
      nodeSpacing: 175,
      sortMethod: "directed",
      shakeTowards: "roots",
    },
  },
  clickToUse: true,
  physics: false,
};

function getVisjsUserOptions(obj) {
  // extract user adjustable options from the full visjs options object
  return {
    nodes: {
      mass: obj.nodes.mass,
      size: obj.nodes.size,
      font: {
        size: obj.nodes.font.size,
      },
    },
    layout: {
      hierarchical: {
        enabled: obj.layout.hierarchical.enabled,
        levelSeparation: obj.layout.hierarchical.levelSeparation,
        direction: obj.layout.hierarchical.direction,
      },
    },
    physics: {
      barnesHut: {
        springConstant: obj.physics.barnesHut.springConstant,
      },
    },
  };
}

export { tbSettingsDefault, ippSettingsDefault, visjsOptionsDefault, visjsOptionsTreeDefault, visjsOptionsTreeCondensed, getVisjsUserOptions };


