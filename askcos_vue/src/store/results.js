import { defineStore } from "pinia";
import { RetroGraph, isChemical, isReaction } from "@/common/graph";
import { lookupBuyables } from "@/common/buyables";
import { v4 as uuidv4, NIL as NIL_UUID } from "uuid";
import { API } from "@/common/api";
// import { tbSettingsPyToJs } from "@/common/tb-settings";
// import { checkTemplatePrioritizers } from "@/views/network/utils";
import {
  makeChemicalDisplayNode,
  makeReactionDisplayNode,
  makeDisplayEdge,
} from "@/views/network/visualization";
import dayjs from "dayjs";
import { useSettingsStore } from "./settings";

export const useResultsStore = defineStore("results", {
  state: () => ({
    dataGraph: new RetroGraph(),
    dispGraph: new RetroGraph(),
    recommendedTemplates: {},
    target: "",
    templateNumExamples: {}, // Map from template ID to training reaction count
    templateSetSource: {}, // Map from template ID to template set which it came from
    trees: [],
    treeNodeMap: {}, // Tracks nodes in trees, similar to inVis attribute, {smiles: {parentid: nodeid}}
    treeEdgeMap: {}, // Tracks edges in trees, similar to dispGraph._succ, {parentid: {nodeid: edgeid}}
    recomputeData: 0, // Dummy variable for triggering computed properties which depend on dataGraph
    recomputeDisp: 0, // Dummy variable for triggering computed properties which depend on dispGraph
    savedResultInfo: {
      id: "",
      description: "",
      tags: [],
      type: "ipp",
      created: "",
      modified: "",
      createdDisp: "",
      modifiedDisp: "",
      tbSettings: null,
      tbStats: null,
      overwrite: true,
      target: "",
    },
    removedReactions: {},
  }),
  getters: {
    clusteredResults: (state) => {
      // Mapping of target smiles to list of cluster representatives
      // {'targetSmiles0':[{cluster0_rep}, {cluster1_rep},...], ...}
      let recomputeData = this.recomputeData;
      console.debug(recomputeData);
      let res = {};
      let options = {
        filter: (item) => item.clusterRep,
        order: (a, b) => a.clusterId - b.clusterId,
      };
      for (let target of state.dataGraph.nodes.getIds({ filter: isChemical })) {
        res[target] = state.dataGraph.nodes.get(
          state.dataGraph.getSuccessors(target),
          options
        );
      }
      return res;
    },
    clusteredResultsIndex: (state) => {
      // Mapping of target smiles to list of cluster IDs in ascending order
      // {'targetSmiles0':[unique cluster Ids in ascending order], ...}
      let recomputeData = state.recomputeData;
      console.debug(recomputeData);
      let res = {};
      for (let target of state.dataGraph.nodes.getIds({ filter: isChemical })) {
        let precursors = state.dataGraph.nodes.get(
          state.dataGraph.getSuccessors(target)
        );
        res[target] = [...new Set(precursors.map((rxn) => rxn.clusterId))];
        res[target].sort((a, b) => a - b);
      }
      return res;
    },
  },
  actions: {
    apiTemplateCount(templateIds) {
      const lookup = templateIds.filter(
        (id) => this.templateNumExamples[id] === undefined
      );
      if (lookup.length > 0) {
        API.post("/api/template/lookup/", {
          ids: lookup,
          field: "count",
        }).then((json) => {
          Object.assign(this.templateNumExamples, json.result);
        });
      }
    },
    apiTemplateSet(templateIds) {
      const lookup = templateIds.filter(
        (id) => this.templateSetSource[id] === undefined
      );
      if (lookup.length > 0) {
        API.post("/api/template/lookup/", {
          ids: lookup,
          field: "template_set",
        }).then((json) => {
          Object.assign(this.templateSetSource, json.result);
        });
      }
    },
    updateImageUrls(smiles) {
      const settings = useSettingsStore();
      // If no smiles were passed, update all nodes
      smiles = smiles || this.dataGraph.getChemicalNodeIds();
      this.updateDispNodes(
        smiles
          .map((smi) => {
            let dataObj = this.dataGraph.nodes.get(smi);
            let nodeIds = this.dispGraph.nodes.getIds({
              filter: (item) => item.smiles === smi,
            });
            return nodeIds.map((nodeId) =>
              makeChemicalDisplayNode({
                id: nodeId,
                data: dataObj,
                target: this.target,
                align: settings.alignNodeImagesToTarget,
              })
            );
          })
          .flat()
      );
    },
    async updateChemicalMetadata(smiles) {
      const settings = useSettingsStore();
      let sources = settings.tbSettings.buyablesSourceAll
        ? null
        : settings.tree_builder_settings.build_tree_options.buyables_source;
      let templateSets =
        settings.interactive_path_planner_settings.retro_backend_options.map(
          (tp) => tp["retro_model_name"]
        );
      let promises = [];
      promises.push(getHistory(smiles, templateSets));
      promises.push(getPrice(smiles, sources));
      promises.push(getScscore(smiles));
      const [history, price, scscore] = await Promise.all(promises);
      this.updateDataNodes(
        smiles.map((smi) => {
          return Object.assign(
            { id: smi },
            history[smi],
            price[smi],
            scscore[smi]
          );
        })
      );
      this.updateImageUrls(smiles);
    },
    async updatePrice(smiles) {
      const settings = useSettingsStore();
      let sources = settings.tbSettings.buyablesSourceAll
        ? null
        : settings.tbSettings.buyablesSource;
      const price = await getPrice(smiles, sources);
      this.updateDataNodes(
        smiles.map((smi) => {
          return Object.assign({ id: smi }, price[smi]);
        })
      );
      this.updateImageUrls(smiles);
    },
    async updateScscore(smiles) {
      const scscore = await getScscore(smiles);
      this.updateDataNodes(
        smiles.map((smi) => {
          return Object.assign({ id: smi }, scscore[smi]);
        })
      );
    },
    async loadResult({ resultId, numTrees }) {
      let url = "/api/results/retrieve";
      const json = await API.get(url, { result_id: resultId });
      if (json.error) {
        alert(json.error);
      }
      if (json["result_type"] === "ipp") {
        return this.importIppResult({ data: json });
      } else if (json["result_type"] === "tree_builder") {
        return this.importTreeBuilderResult({
          data: json,
          numTrees: numTrees,
        });
      } else if (json["result_type"] === "graph_optimization") {
        return this.importGraphOptimizationResult({ data: json });
      }
    },
    importIppResult({ data }) {
      const settings = useSettingsStore();
      let resultObj = data;
      // Update saved result info
      let savedResultInfo = {
        id: resultObj["result_id"],
        description: resultObj["description"],
        tags: resultObj["tags"],
        type: data["result_type"],
        created: resultObj["created"],
        modified: resultObj["modified"],
        createdDisp: dayjs(resultObj["created"]).format("MMMM D, YYYY h:mm A"),
        modifiedDisp: dayjs(resultObj["modified"]).format(
          "MMMM D, YYYY h:mm A"
        ),
        target: resultObj["target_smiles"],
      };
      this.updateSavedResultInfo(savedResultInfo);
      // Restore result graphs
      this.importDataJSON(resultObj["result"]["dataGraph"]);
      this.importDispJSON(resultObj["result"]["dispGraph"]);
      // Restore settings
      settings.setVisjsOptions(resultObj["settings"]["network"], {
        root: true,
      });
      settings.setTbSettings(resultObj["settings"]["tb"], {
        root: true,
      });
      settings.setIppSettings(resultObj["settings"]["ipp"], {
        root: true,
      });
      this.setTarget(this.dispGraph.nodes.get(NIL_UUID)["smiles"]);
      // Retrieve template example count and template set metadata
      let templates = [];
      this.dataGraph.nodes.get({ filter: isReaction }).forEach((n) => {
        if (n["templateIds"]) {
          templates.push(...n["templateIds"]);
        }
      });
      let promises = [];
      promises.push(this.apiTemplateCount(templates));
      promises.push(this.apiTemplateSet(templates));
      return Promise.all(promises);
    },
    importTreeBuilderResult({ data, numTrees }) {
      const settings = useSettingsStore();
      let resultObj = data;
      let target = resultObj["target_smiles"];
      this.setTarget(target);
      // Disable precusrsor clustering by default for tree builder results
      settings.setOption({ key: "allowCluster", value: false }, { root: true });
      // Use hierarchical layout by default for tree builder results
      settings.setVisHierachicalEnabled(true, { root: true });
      // Update saved result info
      let savedResultInfo = {
        id: resultObj["result_id"],
        description: resultObj["description"],
        type: data["result_type"],
        created: resultObj["created"],
        modified: resultObj["modified"],
        createdDisp: dayjs(resultObj["created"]).format("MMMM D, YYYY h:mm A"),
        modifiedDisp: dayjs(resultObj["modified"]).format(
          "MMMM D, YYYY h:mm A"
        ),
        tbSettings: resultObj["settings"],
        target: resultObj["target_smiles"],
      };
      let status = null;
      // let status = resultObj["result"]["stats"];
      let stats = resultObj["result"]["stats"];
      if (status) {
        savedResultInfo["tbStats"] = {
          total_chemicals: status[0],
          total_reactions: status[1],
        };
      } else if (stats) {
        savedResultInfo["tbStats"] = stats;
      }
      this.updateSavedResultInfo(savedResultInfo);
      // Import settings
      // let tbSettings = tbSettingsPyToJs(resultObj["settings"]);
      // settings.setTbSettings(tbSettings, { root: true });
      // Import result graphs
      let dataGraph = resultObj["result"]["graph"];
      let paths = resultObj["result"]["paths"];
      let nodeMap = generateTreeNodeMap(paths);
      let edgeMap = assignEdgeIds(paths);
      this.setTreeNodeMap(nodeMap);
      this.setTreeEdgeMap(edgeMap);
      let promises = [];
      if (dataGraph) {
        promises.push(this.addTreeBuilderResultToDataGraph(dataGraph));
      }
      this.addDispNodes(
        makeChemicalDisplayNode({
          id: NIL_UUID,
          data: { id: target },
          target: target,
        })
      );
      if (numTrees) {
        paths.slice(0, numTrees).forEach((path) => {
          this.addTreeToDispGraph(path);
        });
      }
      if (paths) {
        this.setTrees(paths);
      }
      return Promise.all(promises);
    },
    importGraphOptimizationResult({ data }) {
      const settings = useSettingsStore();
      let resultObj = data["result"];
      let target = resultObj["settings"]["targets"][0];
      this.setTarget(target);
      // Disable precusrsor clustering by default for tree builder results
      settings.setOption({ key: "allowCluster", value: false }, { root: true });
      // Use hierarchical layout by default for tree builder results
      settings.setVisHierachicalEnabled(true, { root: true });
      // Update saved result info
      let savedResultInfo = {
        id: resultObj["_id"],
        description: resultObj["description"],
        type: data["result_type"],
        created: resultObj["created"],
        modified: resultObj["modified"],
        createdDisp: dayjs(resultObj["created"]).format("MMMM D, YYYY h:mm A"),
        modifiedDisp: dayjs(resultObj["modified"]).format(
          "MMMM D, YYYY h:mm A"
        ),
        tbSettings: resultObj["settings"],
      };
      this.updateSavedResultInfo(savedResultInfo);
      // Import result
      let dataGraph = resultObj["result"]["dataGraph"];
      let paths = resultObj["result"]["paths"];
      assignEdgeIds(paths);
      let promises = [];
      if (dataGraph) {
        promises.push(this.addTreeBuilderResultToDataGraph(dataGraph));
      }
      this.addDispNodes(
        makeChemicalDisplayNode({
          id: NIL_UUID,
          data: { id: target },
          target: target,
        })
      );
      if (paths) {
        paths.forEach((path) => {
          this.addTreeToDispGraph(path);
        });
        this.setTrees(paths);
      }
      return Promise.all(promises);
    },
    async addRetroResultToDataGraph({ data, parentSmiles, update = true }) {
      // Add results as reaction and chemical nodes under the specified parent chemical
      // Arguments should be list of outcome objects and the SMILES of the parent node
      if (!this.dataGraph.nodes.get(parentSmiles)) {
        // The parent node does not exist in the graph for some reason
        // Create it instead to avoid issues later
        console.debug(
          `Adding retro results for missing parent node ${parentSmiles}. This might result in a disconnected graph!`
        );
        this.addDataNodes({
          id: parentSmiles,
          type: "chemical",
        });
        if (update) {
          this.updateChemicalMetadata([parentSmiles]);
        }
      }
      let existingReactions =
        this.dataGraph.getSuccessors(parentSmiles).length > 0;
      let clusterTracker = new Set(this.clusteredResultsIndex[parentSmiles]);
      let addedReactions = [];
      let templateIds = [];
      let newPrecursors = new Set();
      let newNodes = [];
      let newEdges = [];
      for (let reaction of data) {
        let reactionSmiles = reaction["outcome"] + ">>" + parentSmiles;
        let existingNode = this.dataGraph.nodes.get(reactionSmiles);
        if (existingNode) {
          // Reaction already exists, update metadata
          existingNode["retroScore"] = Math.max(
            existingNode["model_score"],
            reaction["score"]
          );
          if (
            existingNode["templateScore"] <=
            reaction["template"]["template_score"]
          ) {
            existingNode["templateRank"] =
              reaction["template"]["template_rank"];
            existingNode["templateScore"] =
              reaction["template"]["template_score"];
          }
          let isNew = false;
          if (reaction["templates"]) {
            reaction["templates"].forEach((tid) => {
              if (
                existingNode["templateIds"] !== undefined &&
                !existingNode["templateIds"].includes(tid)
              ) {
                isNew = true;
                existingNode["templateIds"].push(tid);
                templateIds.push(tid);
              }
            });
          }
          if (isNew && reaction["num_examples"]) {
            existingNode["numExamples"] += reaction["num_examples"];
          }
          let fieldsToCheck = {
            necessaryReagent: "necessary_reagent",
            mappedSmiles: "mapped_smiles",
            reactingAtoms: "reacting_atoms",
          };
          Object.entries(fieldsToCheck).forEach(([newkey, oldkey]) => {
            if (!existingNode[newkey] && reaction[oldkey]) {
              existingNode[newkey] = reaction[oldkey];
            }
          });
          this.updateReactionSmiles({
            newNode: existingNode,
          });
        } else {
          // Create new reaction and precursor nodes
          addedReactions.push(reactionSmiles);
          if (reaction["smiles_split"] === undefined) {
            reaction["smiles_split"] = reaction["outcome"].split(".");
          }
          let node = {
            id: reactionSmiles,
            model: reaction["retro_backend"],
            trainingSet: reaction["retro_model_name"],
            rank: reaction["rank"],
            ffScore: reaction["plausibility"],
            retroScore: reaction["score"],
            templateScore: reaction["template"]?.template_score ?? undefined,
            templateRank: reaction["template"]?.template_rank ?? undefined,
            templateIds: reaction["template"]?.tforms ?? undefined,
            clusterId: reaction["group_id"],
            clusterName: reaction["group_name"],
            clusterRep: !clusterTracker.has(reaction["group_id"]), // Tag first result in each cluster as the representative
            precursors: reaction["smiles_split"],
            precursorSmiles: reaction["outcome"],
            numExamples: reaction["template"]?.num_examples ?? undefined,
            necessaryReagent:
              reaction["template"]?.necessary_reagent ?? undefined,
            mappedSmiles: reaction["mapped_smiles"],
            reactingAtoms: reaction["reacting_atoms"],
            numRings: reaction["num_rings"],
            rmsMolwt: reaction["rms_molwt"],
            scscore: reaction["scscore"],
            type: "reaction",
            inVis: {}, // Tracks associated nodes in display graph (key: parent ID, value: node ID)
          };
          if (reaction["group_id"] !== undefined) {
            clusterTracker.add(reaction["group_id"]);
          }
          if (node.templateIds) {
            templateIds.push(...node.templateIds);
          }

          if ("outcome" in reaction) {
            node["outcome"] = reaction["outcome"].split(".");
            node["selectivity"] = new Array(node.outcome.length);
            node["mappedPrecursors"] = reaction["mapped_precursors"];
            node["mappedOutcomes"] = reaction["mapped_outcomes"];
          } else if ("selec_error" in reaction) {
            node["selecError"] = reaction["selec_error"];
          }

          newNodes.push(node);
          newEdges.push({
            id: uuidv4(),
            from: parentSmiles,
            to: reactionSmiles,
          });

          if (node.precursors) {
            for (let precursorSmiles of node.precursors) {
              if (
                !this.dataGraph.nodes.get(precursorSmiles) &&
                !newPrecursors.has(precursorSmiles)
              ) {
                newNodes.push({
                  id: precursorSmiles,
                  type: "chemical",
                });
                newPrecursors.add(precursorSmiles);
              }
              newEdges.push({
                id: uuidv4(),
                from: reactionSmiles,
                to: precursorSmiles,
              });
            }
          }
        }
      }

      if (newNodes.length > 0) {
        this.addDataNodes(newNodes);
      }
      if (newEdges.length > 0) {
        this.addDataEdges(newEdges);
      }
      let promises = [];
      if (existingReactions && addedReactions.length > 0) {
        promises.push(this.rerankPrecursors(parentSmiles));
        // promises.push(this.recluster(parentSmiles)); as requested in #175
      }
      if (update && newPrecursors.size > 0) {
        promises.push(this.updateChemicalMetadata([...newPrecursors]));
      }
      if (templateIds.length > 0) {
        this.apiTemplateCount(templateIds);
        this.apiTemplateSet(templateIds);
      }
      await Promise.all(promises);
      return addedReactions;
    },
    addRetroResultToDispGraph({ data, parentId }) {
      // Add reaction and chemical nodes with display properties under the specified parent chemical
      // Arguments should be list of reaction smiles to add and the ID of the parent node
      const settings = useSettingsStore();
      let newNodes = [];
      let newEdges = [];
      for (let reactionSmiles of data) {
        let reactionObj = this.dataGraph.nodes.get(reactionSmiles);

        let reactionId = uuidv4();
        let edgeId = uuidv4();
        // Check if this reaction already has an ID assigned from tree results
        if (
          this.treeNodeMap &&
          reactionSmiles in this.treeNodeMap &&
          parentId in this.treeNodeMap[reactionSmiles]
        ) {
          reactionId = this.treeNodeMap[reactionSmiles][parentId];
          edgeId = this.treeEdgeMap[parentId][reactionId];
        }
        reactionObj["inVis"][parentId] = reactionId;

        this.updateReactionSmiles({
          newNode: reactionObj,
        });

        newNodes.push(
          makeReactionDisplayNode({
            id: reactionId,
            data: reactionObj,
          })
        );
        newEdges.push(
          makeDisplayEdge({
            id: edgeId,
            from: parentId,
            to: reactionId,
            value: reactionObj["templateScore"],
          })
        );

        if (reactionObj.precursors) {
          for (let precursorSmiles of reactionObj.precursors) {
            let precursorObj = this.dataGraph.nodes.get(precursorSmiles);
            let precursorId = uuidv4();
            let precursorEdgeId = uuidv4();
            // Check if this precursor already has an ID assigned from tree results
            if (
              this.treeNodeMap &&
              precursorSmiles in this.treeNodeMap &&
              reactionId in this.treeNodeMap[precursorSmiles]
            ) {
              precursorId = this.treeNodeMap[precursorSmiles][reactionId];
              precursorEdgeId = this.treeEdgeMap[reactionId][precursorId];
            }
            newNodes.push(
              makeChemicalDisplayNode({
                id: precursorId,
                data: precursorObj,
                target: this.target,
                align: settings.alignNodeImagesToTarget,
              })
            );
            newEdges.push(
              makeDisplayEdge({
                id: precursorEdgeId,
                from: reactionId,
                to: precursorId,
                value: reactionObj["templateScore"],
              })
            );
          }
        }
      }

      let edgeParents = [];
      let predecessors = this.dispGraph.getAllPredecessors(parentId);
      for (let pn of predecessors) {
        edgeParents.push(this.dispGraph.nodes.get(pn));
      }

      // Store the reaction parent nodes which cause cycle
      let removeReactionNodes = [];
      for (let p of edgeParents) {
        for (let node of newNodes) {
          if (node.type === "reaction" && !removeReactionNodes.includes(node)) {
            let chemicals = node.smiles.split(">>");
            let reactants = chemicals[0].split(".");
            for (let reactant of reactants) {
              if (p.smiles === reactant) {
                removeReactionNodes.push(node);
                break;
              }
            }
          }
        }
      }

      // Now, we will find the precursor nodes of those reactions
      let removeChemicalNodes = [];
      if (removeReactionNodes.length !== 0) {
        this.addRemovedReactions({
          dispID: parentId,
          removedReactions: removeReactionNodes,
        });
        for (let reactionNode of removeReactionNodes) {
          let parentToChildEdges = newEdges.filter(
            (edge) => edge.from === reactionNode.id
          );
          for (let parentToChildEdge of parentToChildEdges) {
            let childNode = newNodes.find(
              (node) => node.id === parentToChildEdge.to
            );
            removeChemicalNodes.push(childNode);
          }
        }

        for (let node of removeChemicalNodes) {
          newNodes = newNodes.filter((el) => el.id !== node.id);
        }

        for (let node of removeReactionNodes) {
          newNodes = newNodes.filter((el) => el.id !== node.id);
          newEdges = newEdges.filter((el) => {
            if (el.from === node.id || el.to === node.id) {
              return false;
            }
            return true;
          });
        }
      }

      if (newNodes.length > 0) {
        this.addDispNodes(newNodes);
      }
      if (newEdges.length > 0) {
        this.addDispEdges(newEdges);
      }
    },
    addResultsToDispGraph({ maxDepth, maxNum }) {
      // Add existing nodes from dataGraph to dispGraph
      // maxDepth indicates number of levels to add
      // maxNum indicates how many results to add per level
      let _helper = (root, depth) => {
        if (depth > maxDepth) {
          return;
        }
        let smiles = this.dispGraph.nodes.get(root)["smiles"];
        let reactionIds = this.dataGraph.getSuccessors(smiles);
        let reactions = this.dataGraph.nodes.get(reactionIds);
        if (maxNum) {
          // Sort by rank and top N results
          reactions = reactions
            .sort((a, b) => a["rank"] - b["rank"])
            .slice(0, maxNum);
        }
        // Remove reactions which are already in dispGraph and extract reaction SMILES
        reactions = reactions
          .filter((rxn) => !(root in rxn["inVis"]))
          .map((rxn) => rxn.id);

        this.addRetroResultToDispGraph({
          data: reactions,
          parentId: root,
        });
        this.dispGraph.getSuccessors(root).forEach((rxn) => {
          this.dispGraph.getSuccessors(rxn).forEach((chem) => {
            _helper(chem, depth + 1);
          });
        });
      };

      return _helper(NIL_UUID, 1);
    },
    addTreeToDispGraph(data) {
      const settings = useSettingsStore();
      // This adds the provided pathway to the IPP display tree
      // Input pathway should be in nodelink json format
      let newNodes = data.nodes.filter((node) => {
        // Only add node if it is not already in the graph
        return this.dispGraph.nodes.get(node["id"]) === null;
      });
      let newEdges = data.edges.filter((edge) => {
        // Only add an edge if the target node is not already in the graph
        return this.dispGraph.edges.get(edge["id"]) === null;
      });

      this.updateDispNodes(
        newNodes.map((node) => {
          let dataObj = this.dataGraph.nodes.get(node["smiles"]);
          if (node.type === "chemical") {
            return makeChemicalDisplayNode({
              id: node["id"],
              data: dataObj,
              target: this.target,
              align: settings.alignNodeImagesToTarget,
            });
          } else {
            return makeReactionDisplayNode({
              id: node["id"],
              data: dataObj,
            });
          }
        })
      );

      this.updateDispEdges(
        newEdges.map((edge) => {
          let from = this.dispGraph.nodes.get(edge["from"]);
          let to = this.dispGraph.nodes.get(edge["to"]);
          let reactionObj;
          if (from["type"] === "reaction") {
            reactionObj = this.dataGraph.nodes.get(from["smiles"]);
          } else {
            reactionObj = this.dataGraph.nodes.get(to["smiles"]);
            reactionObj.inVis[from["id"]] = to["id"];

            this.updateReactionSmiles({
              newNode: reactionObj,
            });
          }

          return makeDisplayEdge({
            id: edge["id"],
            from: edge["from"],
            to: edge["to"],
            value: reactionObj["templateScore"],
          });
        })
      );
    },
    addTreeBuilderResultToDataGraph(data) {
      let templateIds = [];
      let chemicals = [];
      this.addDataNodes(
        data.nodes.map((node) => {
          if (node.type === "chemical") {
            chemicals.push(node["id"]);
            return {
              id: node["id"],
              asReactant: node["as_reactant"],
              asProduct: node["as_product"],
              molwt: node["molwt"],
              ppg:
                node["purchase_price"] > 0
                  ? node["purchase_price"]
                  : "not buyable",
              terminal: node["terminal"],
              type: node["type"],
            };
          } else {
            if (node["tforms"]) {
              templateIds.push(...node["tforms"]);
            }
            return {
              id: node["id"],
              rank: node["rank"],
              model: node["retro_backend"],
              trainingSet: node["retro_model_name"],
              ffScore: node["plausibility"],
              forwardScore: node["forward_score"],
              retroScore: node["template_score"],
              templateScore: node["template_score"],
              templateIds: node["tforms"],
              templateSets: node["tsources"],
              precursors: node["precursor_smiles"].split("."),
              precursorSmiles: node["precursor_smiles"],
              numExamples: node["num_examples"],
              necessaryReagent: node["necessary_reagent"],
              numRings: node["num_rings"],
              rmsMolwt: node["rms_molwt"],
              scscore: node["scscore"],
              className: node["class_name"],
              classNum: node["class_num"],
              type: node["type"],
              inVis: {},
            };
          }
        })
      );
      this.updateScscore(chemicals);
      this.apiTemplateCount(templateIds);
      this.apiTemplateSet(templateIds);
      this.addDataEdges(
        data.links.map((edge) => {
          return {
            id: edge["id"],
            from: edge["source"],
            to: edge["target"],
          };
        })
      );
    },
    rerankPrecursors(parentSmiles) {
      // Update rank for nodes in dataGraph
      let successorIds = this.dataGraph.getSuccessors(parentSmiles);
      let successorNodes = this.dataGraph.nodes.get(successorIds);
      let updatedNodes = successorNodes
        .sort(retroScoreDescending)
        .map((node, index) => ({
          id: node.id,
          rank: index + 1,
          inVis: node.inVis, // Not modified, but included for updating dispGraph
        }));
      this.updateDataNodes(updatedNodes);
      // Update rank label for corresponding nodes in dispGraph
      let parentDispIds = this.dispGraph.nodes.getIds({
        filter: (item) => item.smiles === parentSmiles,
      });
      let updatedDispNodes = [];
      parentDispIds.forEach((dispId) => {
        updatedDispNodes.push(
          ...updatedNodes
            .filter((node) => {
              if (this.removedReactions[dispId] === undefined) {
                return !!node.inVis[dispId];
              } else {
                // Filter for nodes which are included in dispGraph
                return (
                  !!node.inVis[dispId] &&
                  !this.removedReactions[dispId].includes(node.inVis[dispId])
                );
              }
            })
            .map((node) => ({
              id: node.inVis[dispId], // This is the id of the display node
              label: "#" + node["rank"],
            }))
        );
      });
      this.updateDispNodes(updatedDispNodes);
    },
    async requestRetro({ smiles }) {
      const settings = useSettingsStore();
      const url = "/api/tree-search/expand-one/call-async";
      const body = {
        smiles: smiles,
      };
      Object.assign(body, settings.interactive_path_planner_settings);
      // if (strategy.model === "template_relevance") {
      //   checkTemplatePrioritizers(body["template_prioritizers"]);
      // }
      try {
        const response = await API.runCeleryTask(url, body);
        return response;
      } catch (error) {
        return [];
      }
    },
    async expand(nodeId) {
      if (typeof nodeId == "string" && nodeId.startsWith("cluster")) {
        alert(
          "Cannot expand collapsed node! To toggle collapsed state, click collapse toggle button again with collapsed cluster selected."
        );
        return;
      }
      const node = this.dispGraph.nodes.get(nodeId);
      if (node.type !== "chemical") {
        alert(
          "Cannot expand reaction; try expanding with a chemical node selected"
        );
        return;
      }
      const smiles = node.smiles;
      const settings = useSettingsStore();

      if (
        settings.interactive_path_planner_settings.retro_backend_options
          .length === 0
      ) {
        alert("Please add atleast one strategy");
        return;
      }

      const strategyPromise = new Promise((resolve, reject) => {
        this.requestRetro({ smiles: smiles }).then((response) => {
          if (response.length === 0) {
            reject(new Error("No precursors found!"));
          } else {
            resolve(response);
          }
        });
      });

      await strategyPromise.then(
        async (response) => {
          for (const [idx, precursor] of Object.entries(response.result)) {
            const addedReactions = await this.addRetroResultToDataGraph({
              data: precursor,
              parentSmiles: smiles,
            });

            let reactionsToAdd = [];
            if (
              settings.interactive_path_planner_settings.retro_backend_options[
                idx
              ].retro_backend === "template_relevance"
            ) {
              reactionsToAdd = addedReactions
                .filter((reactionSmiles) => {
                  return (
                    !settings.allowCluster ||
                    this.dataGraph.nodes.get(reactionSmiles).clusterRep
                  );
                })
                .slice(0, settings.reactionLimit);
            } else {
              reactionsToAdd = addedReactions.slice(0, settings.reactionLimit);
            }
            this.addRetroResultToDispGraph({
              data: reactionsToAdd,
              parentId: nodeId,
            });
          }
        },
        (error) => {
          console.error(error);
          alert("Error occurred while expanding: ", error);
        }
      );
    },
    async templateRelevance(smiles) {
      const settings = useSettingsStore();
      const url = "/api/retro/template-relevance/call-async";
      const body = {
        model_name: "reaxys",
        smiles: [smiles],
        // template_prioritizers: settings.tbSettings.templatePrioritizers,
        num_templates: settings.tbSettings.numTemplates,
        max_cum_prob: settings.tbSettings.maxCumProb,
        // return_templates: true,
        attribute_filter: [],
      };
      // checkTemplatePrioritizers(body["template_prioritizers"]);
      try {
        const output = await API.runCeleryTask(url, body);
        this.setRecTemplates({
          smiles: smiles,
          data: Object.fromEntries(
            output["result"][0].templates.map((item) => [item._id, item])
          ),
        });
        // Update templates with existing results
        let precursorSmiles = this.dataGraph.getSuccessors(smiles);
        let precursors = this.dataGraph.nodes.get(precursorSmiles);
        let results = {};
        for (let p of precursors) {
          for (let t of p["templateIds"]) {
            // If template settings were changed, results may include IDs which are not in recommended templates
            if (
              Object.prototype.hasOwnProperty.call(
                this.recommendedTemplates[smiles],
                t
              )
            ) {
              if (results[t] === undefined) {
                results[t] = [p["precursorSmiles"]];
              } else {
                results[t].push(p["precursorSmiles"]);
              }
            }
          }
        }
        this.setRecTemplatesResults({ smiles: smiles, results: results });
      } catch (error) {
        console.error(
          "Could not retrieve template relevance prediction:",
          error
        );
      }
    },
    async applyTemplate({ smiles, template }) {
      const url = "/api/v2/apply-one-template/";
      const body = {
        smiles: smiles,
        template_idx: template.index,
        template_set: template.template_set,
      };
      try {
        const output = await API.runCeleryTask(url, body);
        this.setRecTemplatesResults({
          smiles: smiles,
          results: {
            [template._id]: output.map((item) => item.precursors.join(".")),
          },
        });
      } catch (error) {
        console.error("Could not apply template:", error);
      }
    },
    async recluster(smiles) {
      const settings = useSettingsStore();
      let rxns = this.dataGraph.nodes
        .get(this.dataGraph.getSuccessors(smiles))
        .sort(retroScoreDescending);
      let outcomes = rxns.map((rxn) => rxn["precursorSmiles"]);
      let scores = rxns.map((rxn) => rxn["retroScore"] || 0);
      let url = "/api/cluster/call-async";
      let body = {
        original: smiles,
        outcomes: outcomes,
        feature:
          settings.interactive_path_planner_settings.cluster_setting.feature,
        cluster_method:
          settings.interactive_path_planner_settings.cluster_setting
            .cluster_method,
        fp_type:
          settings.interactive_path_planner_settings.cluster_setting.fp_type,
        fp_length:
          settings.interactive_path_planner_settings.cluster_setting.fp_length,
        fp_radius:
          settings.interactive_path_planner_settings.cluster_setting.fp_radius,
        scores: scores,
      };
      try {
        const json = await API.runCeleryTask(url, body);
        let clusterTracker = new Set();
        let updateData = [];
        rxns.forEach((rxn_2, i) => {
          let cid = json.result[0][i];
          updateData.push({
            id: rxn_2.id,
            clusterId: cid,
            clusterName: json.result[1][cid],
            clusterRep: !clusterTracker.has(cid),
          });
          clusterTracker.add(cid);
        });
        this.updateDataNodes(updateData);
      } catch (error) {
        alert(
          "There was an error fetching cluster results for this target with the supplied settings: " +
            error
        );
      }
    },
    updateTreeConnectivity() {
      this.setTreeNodeMap(generateTreeNodeMap(this.trees));
      this.setTreeEdgeMap(generateTreeEdgeMap(this.trees));
    },

    // mutations

    updateReactionSmiles({ newNode }) {
      this.dataGraph.nodes.updateOnly(newNode);
    },
    setTarget(target) {
      this.target = target;
    },
    addDataNodes(data) {
      this.$patch((state) => {
        state.dataGraph.nodes.add(data);
        state.recomputeData += 1;
      });
    },
    addDataEdges(data) {
      this.dataGraph.edges.add(data);
    },
    addDispNodes(data) {
      this.$patch((state) => {
        state.dispGraph.nodes.add(data);
        state.recomputeDisp += 1;
      });
    },
    addDispEdges(data) {
      this.$patch((state) => {
        state.dispGraph.edges.add(data);
        state.recomputeData += 1; // For changes to inVis
      });
    },
    clearDataGraph() {
      this.dataGraph.clear();
    },
    clearDispGraph() {
      this.dispGraph.clear();
    },
    clearRemovedReactions() {
      this.removedReactions = {};
    },
    deleteDataNode(node) {
      // For chemical nodes, delete direct successors (reactions)
      // For reaction nodes, delete the reaction node only
      // Also deletes the nodes and all successors from the dispGraph if applicable
      // May leave subgraphs which are disconnected from the main network
      // 1. Delete instances of this node and its successors from dispGraph
      let dispNodes = this.dispGraph.nodes.get({
        filter: (dn) => dn.smiles === node.id,
      });
      for (const dispNode of dispNodes) {
        this.deleteDispNode(dispNode);
      }
      // 2. If this is a chemical node, get its successors; otherwise, just get the node id
      let toDelete = isChemical(node)
        ? this.dataGraph.getSuccessors(node.id)
        : node.id;
      // 3. Delete nodes from dataGraph
      this.dataGraph.nodes.remove(toDelete);
      // 4. Delete any leftover edges
      this.dataGraph.trimDanglingEdges();
      this.recomputeData += 1;
    },
    deleteDispNode(node) {
      // For chemical nodes, delete all successors
      // For reaction nodes, delete the node and its successors
      // Also updates the inVis property for the corresponding nodes in dataGraph
      this.deleteDispNodefn(node);
      this.recomputeData += 1; // For changes to inVis
      this.recomputeDisp += 1;
    },
    deleteDispNodefn(node) {
      // 1. Get all successors to this node
      let toDelete = this.dispGraph.getAllSuccessors(node.id);
      // 2. If this is a reaction node, include it in the list
      if (isReaction(node)) {
        toDelete.push(node.id);
      }
      // 3. Get reaction nodes and update their inVis properties
      let reactionNodes = this.dispGraph.nodes.get(toDelete, {
        filter: isReaction,
      });
      for (const node of reactionNodes) {
        let dataObj = this.dataGraph.nodes.get(node.smiles);
        let predecessorId = this.dispGraph.getPredecessors(node.id)[0];
        delete dataObj.inVis[predecessorId];
      }
      // 4. Delete successors
      this.dispGraph.nodes.remove(toDelete);
      // 5. Delete any leftover edges
      this.dispGraph.trimDanglingEdges();
    },
    importDataJSON(data) {
      this.dataGraph.fromJSON(data);
      this.recomputeData += 1;
    },
    importDispJSON(data) {
      this.dispGraph.fromJSON(data);
      this.recomputeDisp += 1;
    },
    updateDataNodes(data) {
      this.$patch((state) => {
        state.dataGraph.nodes.update(data);
        state.recomputeData += 1;
      });
    },
    updateDataEdges(data) {
      this.dataGraph.edges.update(data);
    },
    updateDispNodes(data) {
      this.$patch((state) => {
        state.dispGraph.nodes.update(data);
        state.recomputeDisp += 1;
      });
    },
    updateDispEdges(data) {
      this.$patch((state) => {
        state.dispGraph.edges.update(data);
        state.recomputeData += 1; // For changes to inVis
      });
    },
    setRecTemplates({ smiles, data }) {
      this.recommendedTemplates[smiles] = data;
    },
    setRecTemplatesResults({ smiles, results }) {
      Object.entries(results).forEach(([template, data]) => {
        this.recommendedTemplates[smiles][template]["results"] = data;
      });
    },
    setSavedResultInfo(data) {
      this.savedResultInfo = data;
    },
    updateSavedResultInfo(data) {
      Object.assign(this.savedResultInfo, data);
    },
    setTrees(data) {
      this.trees = data;
    },
    setTreeNodeMap(data) {
      this.treeNodeMap = data;
    },
    setTreeEdgeMap(data) {
      this.treeEdgeMap = data;
    },
    addRemovedReactions({ dispID, removedReactions }) {
      this.removedReactions[dispID] = [];
      removedReactions.forEach((node) => {
        this.removedReactions[dispID].push(node.id);
      });
    },
  },
});

function generateTreeNodeMap(trees) {
  // Generates object to track node IDs which exist in a tree
  // Similar to inVis attribute of dataGraph reactions which tracks node IDs which exist in dispGraph
  // Returns an object like {smiles: {parentid: nodeid}}
  let nodeMap = {};
  for (let tree of trees) {
    let nodes = Object.fromEntries(
      tree.nodes.map((node) => [node["id"], node])
    );
    let succ = generateTreeEdgeMap([tree]);
    for (let node of tree.nodes) {
      let successors = succ[node["id"]];
      if (successors) {
        Object.keys(successors).forEach((s) => {
          let child = nodes[s];
          if (child["smiles"] in nodeMap) {
            nodeMap[child["smiles"]][node["id"]] = child["id"];
          } else {
            nodeMap[child["smiles"]] = { [node["id"]]: child["id"] };
          }
        });
      }
    }
  }
  return Object.freeze(nodeMap); // Prevent this from being reactive
}

function generateTreeEdgeMap(trees) {
  // Generates object to track edge IDs which exist in a tree
  // Similar to _succ attribute of dispGraph
  // Returns an object like {parentid: {nodeid: edgeid}}
  let connectivity = {};
  for (let tree of trees) {
    for (let edge of tree.edges) {
      if (edge.from in connectivity) {
        connectivity[edge.from][edge.to] = edge.id;
      } else {
        connectivity[edge.from] = { [edge.to]: edge.id };
      }
    }
  }
  return Object.freeze(connectivity); // Prevent this from being reactive
}

function assignEdgeIds(trees) {
  // Generates random IDs for all edges in the input tree
  // Edges between the same nodes will receive the same ID across different trees
  let connectivity = {};
  for (let tree of trees) {
    for (let edge of tree.edges) {
      if (edge.from in connectivity) {
        if (edge.to in connectivity[edge.from]) {
          edge.id = connectivity[edge.from][edge.to];
        } else {
          edge.id = uuidv4();
          connectivity[edge.from][edge.to] = edge.id;
        }
      } else {
        edge.id = uuidv4();
        connectivity[edge.from] = { [edge.to]: edge.id };
      }
    }
  }
  return Object.freeze(connectivity); // Prevent this from being reactive
}

function retroScoreDescending(a, b) {
  // Takes two data node objects as input and compares their retro scores
  // Use for sorting nodes by retroScore
  return b["retroScore"] - a["retroScore"];
}

async function getHistory(smiles, templateSets) {
  // Lookup chemhistorian data for a list of SMILES
  const url = "/api/historian/lookup-smiles-list/";
  const body = {
    smiles_list: smiles,
    template_sets: templateSets,
  };
  const json = await API.post(url, body);
  let result = json;
  Object.keys(result).forEach((smi) => {
    result[smi] = {
      asReactant: result[smi]["as_reactant"],
      asProduct: result[smi]["as_product"],
    };
  });
  return result;
}

async function getPrice(smiles, sources) {
  // Lookup prices for a list of SMILES
  const json = await lookupBuyables(smiles, sources);
  let result = {};
  smiles.forEach((smi) => {
    result[smi] = json["result"][smi] || { ppg: "not buyable", source: "" };
  });
  return result;
}

async function getScscore(smiles) {
  // Lookup scscores for a list of SMILES
  const url = "/api/scscore/batch/call-sync";
  const body = {
    smiles: smiles,
  };
  const json = await API.post(url, body);
  let result = {};
  smiles.forEach((smi) => {
    result[smi] = { scscore: json["result"][smi] };
  });
  return result;
}
