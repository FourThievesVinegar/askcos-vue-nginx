/*
 * Graph utility functions
 */
import {DataSet} from "vis-data";
import {v4 as uuidv4} from "uuid";

class RetroGraph {
    constructor(nodes, edges, source, target, visOptions) {
        this.nodes = new DataSet(visOptions);
        this.edges = new DataSet(visOptions);
        this._source = source || 'from'
        this._target = target || 'to'
        this._succ = {};  // Precomputed successors for fast retrieval

        let graph = this
        this.edges.on('*', function(event, properties, senderId) {
            // Update the successors object when a new edge is added
            if (senderId === 'clear') {
                return  // _succ property will be manually reset
            }
            switch (event) {
                case 'add':
                    for (let id of properties.items) {
                        let edge = graph.edges.get(id)
                        graph._succ[edge[graph._source]] = graph._succ[edge[graph._source]] || {}
                        graph._succ[edge[graph._source]][edge[graph._target]] = edge.id
                    }
                    break;
                case 'remove':
                    for (let obj of properties.oldData) {
                        delete graph._succ[obj[graph._source]][obj[graph._target]]
                    }
                    break;
                case 'update':
                    console.debug('Not updating graph successors on update event.')
                    break;
                default:
                    throw `Cannot handle ${event} event!`;
            }
        });

        if (nodes !== undefined) this.nodes.add(nodes);
        if (edges !== undefined) this.edges.add(edges);
    }
    clear() {
        this.nodes.clear('clear')
        this.edges.clear('clear')
        this._succ = {};
    }
    toJSON() {
        return {
            nodes: this.nodes.get(),
            edges: this.edges.get(),
        }
    }
    fromJSON(data) {
        this.nodes.add(data.nodes)
        this.edges.add(data.edges)
    }
    getChemicalNodes() {
        return this.nodes.get({filter: isChemical})
    }
    getChemicalNodeCount() {
        return this.getChemicalNodes().length
    }
    getChemicalNodeIds() {
        return this.nodes.getIds({filter: isChemical})
    }
    getReactionNodes() {
        return this.nodes.get({filter: isReaction})
    }
    getReactionNodeCount() {
        return this.getReactionNodes().length
    }
    getReactionNodeIds() {
        return this.nodes.getIds({filter: isReaction})
    }
    getPredecessors(node) {
        // Retrieve immediate predecessors of the specified node
        let predecessors = [];
        this.edges.forEach(edge => {
            if (edge != null && edge[this._target] === node) {
                predecessors.push(edge[this._source])
            }
        })
        return predecessors
    }
    getAllPredecessors(node_id){
        let predecessors = [];
        while(node_id != "00000000-0000-0000-0000-000000000"){
            if(node_id === undefined || node_id === null){
                break;
            }
            predecessors.push(node_id);
            let predecessor = this.getPredecessors(node_id)[0];
            node_id = predecessor;
        }

        return predecessors;
    }
    hasCycle(id,smiles){
        let predecessors = this.getAllPredecessors(id);
        for(let preNode_id in predecessors){
            this.nodes.forEach(node => { 
                if(node.id === preNode_id){
                    if(smiles === node.smiles){
                        return true
                    }

                }
            });
        }
        return false;
    }
    getSuccessors(node) {
        // Retrieve immediate successors of the specified node
        let successors = this._succ[node]
        if (successors) {
            return Object.keys(successors)
        } else {
            return []
        }
    }
    getAllSuccessors(node) {
        // Retrieve all successors of the specified node
        let successors = this.getSuccessors(node);
        for (let succ of this.getSuccessors(node)) {
            successors.push(...this.getAllSuccessors(succ))
        }
        return successors
    }
    removeAllSuccessors(node) {
        // Remove all successors of the specified node
        this.nodes.remove(this.getAllSuccessors(node));
        this.trimDanglingEdges()
    }
    trimDanglingEdges() {
        // Remove any edges which are only connected on one end
        let nodeIds = this.nodes.getIds();
        let dangling = this.edges.getIds({
            filter: edge => !nodeIds.includes(edge[this._source]) || !nodeIds.includes(edge[this._target])
        });
        this.edges.remove(dangling)
    }
}

/**
 * Enumerates individual pathways from dataGraph or dispGraph.
 * @param {Object} args
 * @param {RetroGraph} args.dataGraph - The data graph containing all results and metadata.
 * @param {RetroGraph} args.dispGraph - The disp graph containing currently viewed tree.
 * @param {String} args.root - The starting node in dataGraph, which should be a chemical SMILES.
 * @param {String} args.rootId - The starting node in dispGraph, which should be a UUID.
 * @param {Number} args.maxDepth - The maximum depth of returned pathways.
 * @param {Number} args.maxTrees - The maximum number of pathways to return.
 * @param {Function} args.validationFunction - A function for determining if a chemical is a terminal precursor.
 * @param {Boolean} args.dispOnly - Whether to enumerate pathways using only nodes present in dispGraph.
 */
function getPaths({ dataGraph, dispGraph, root, rootId, maxDepth, maxTrees, validationFunction, dispOnly = false }) {

    if (validationFunction === undefined) {
        validationFunction = (n) => n['terminal']
    }

    let getChemPaths = (node, nodeId, chemPath) => {
        let paths = []
        let dataNode = dataGraph.nodes.get(node)
        let successors = dataGraph.getSuccessors(node)
        if (successors.length === 0 || maxDepth !== undefined && chemPath.length >= maxDepth) {
            if (validationFunction(dataNode)) {
                let newNode = {
                    id: nodeId,
                    smiles: node,
                    type: 'chemical',
                }
                paths.push({nodes: [newNode], edges: [], graph: {depth: chemPath.length}})
            }
        } else {
            for (let rxn of successors) {
                let rxnNode = dataGraph.nodes.get(rxn)
                let rxnId
                let edgeId
                if (nodeId in rxnNode['inVis']) {
                    rxnId = rxnNode['inVis'][nodeId]
                    edgeId = dispGraph._succ[nodeId][rxnId]
                } else if (dispOnly) {
                    // Skip this reaction because it is not in dispGraph
                    continue
                } else {
                    rxnId = uuidv4()
                    edgeId = uuidv4()
                }
                for (let subPath of getRxnPaths(rxn, rxnId, [...chemPath, node])) {
                    let newNode = {
                        id: nodeId,
                        smiles: node,
                        type: 'chemical',
                    }
                    subPath.nodes.push(newNode)
                    let newEdge = {
                        id: edgeId,
                        from: nodeId,
                        to: rxnId,
                    }
                    subPath.edges.push(newEdge)
                    paths.push(subPath)
                    if (maxTrees !== undefined && paths.length >= maxTrees) {
                        return paths
                    }
                }
            }
        }
        return paths
    }

    let getRxnPaths = (node, nodeId, chemPath) => {
        let paths = []
        let dispNode = dispGraph.nodes.get(nodeId)
        let successors = dataGraph.getSuccessors(node)
        if (chemPath.some(item => successors.includes(item))) {
            return paths
        }
        let childIds = {}
        let edgeIds = {}
        if (dispNode) {
            // Get corresponding node IDs from dispGraph
            let dispSuccessors = dispGraph.nodes.get(dispGraph.getSuccessors(nodeId))
            dispSuccessors.forEach((n) => {
                childIds[n['smiles']] = n['id']
                edgeIds[n['smiles']] = dispGraph._succ[nodeId][n['id']]
            })
        } else {
            successors.forEach((c) => {
                childIds[c] = uuidv4()
                edgeIds[c] = uuidv4()
            })
        }
        let subPaths = successors.map(c => getChemPaths(c, childIds[c], chemPath))
        for (let pathCombo of product(subPaths)) {
            let subPath = mergePaths(pathCombo)
            let newNode = {
                id: nodeId,
                smiles: node,
                type: 'reaction',
            }
            subPath.nodes.push(newNode)
            successors.forEach((c) => {
                let newEdge = {
                    id: edgeIds[c],
                    from: nodeId,
                    to: childIds[c],
                }
                subPath.edges.push(newEdge)
            })
            paths.push(subPath)
        }
        return paths
    }

    return getChemPaths(root, rootId, [])
}

function isChemical(node) {
    return node.type === 'chemical'
}

function isReaction(node) {
    return node.type === 'reaction'
}

function product(sets) {
    // Cartesian product generator, similar to itertools.product in Python
    // Performance tested to be faster than most alternatives
    let max = sets.length - 1;
    let lens = sets.map(set => set.length);
    let results = [];
    let combo = [];
    function build(n) {
        let set = sets[n];
        let len = lens[n];
        if (n === max) {
            for (let i = 0; i < len; ++i) {
                combo[n] = set[i];
                results.push([...combo]);
            }
        } else {
            for (let i = 0; i < len; ++i) {
                combo[n] = set[i];
                build(n + 1);
            }
        }
        combo.pop()
    }
    build(0)
    return results
}

function mergePaths(paths) {
    // Combine multiple path objects
    let result = {'nodes': [], 'edges': [], 'graph': {'depth': 0}}
    for (let path of paths) {
        result.nodes.push(...path.nodes)
        result.edges.push(...path.edges)
        result.graph.depth = Math.max(result.graph.depth, path.graph.depth)
    }
    return result
}

export {RetroGraph, getPaths, isChemical, isReaction};
