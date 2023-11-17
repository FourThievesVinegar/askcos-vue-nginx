import { getMolImageUrl } from '@/common/drawing';
import { num2str } from '@/common/utils';

function edgeScaling(min, max, total, value) {
  if (value >= 0.25) {
    return 1.0;
  }
  return 16 * value * value;
}

function getNodeColor(data, target) {
  if (data.id === target) {
    return '#1965B0'; // blue
  } if (data.ppg > 0) {
    if (data.asReactant || data.asProduct) {
      return '#4EB265'; // green
    }
    return '#F6C141'; // yellow
  }
  if (data.asReactant || data.asProduct) {
    return '#E8601C'; // orange
  }
  return '#DC050C'; // red
}

function makeNodeTitleEl(node) {
  const el = document.createElement('div');
  el.innerHTML = node.id;
  if ('asReactant' in node) {
    el.innerHTML += `<br>${node.asReactant} precedents as reactant`;
  }
  if ('asProduct' in node) {
    el.innerHTML += `<br>${node.asProduct} precedents as product`;
  }
  if ('ppg' in node) {
    const buyableString = node.ppg > 0 ? `$${node.ppg}/g` : 'not buyable';
    el.innerHTML += `<br>${buyableString}`;
  }
  return el;
}

function makeChemicalDisplayNode({
  id, data, target, align = false, scale = true,
}) {
  return {
    id,
    smiles: data.id,
    borderWidth: data.id === target ? 3 : 2,
    color: {
      border: getNodeColor(data, target),
    },
    shape: 'image',
    image: getMolImageUrl(data, false, true, align ? target : undefined, true, scale ? 80 : undefined),
    title: makeNodeTitleEl(data),
    type: 'chemical',
  };
}

function makeReactionDisplayNode({ id, data, detail = false }) {
    const node = {
    id,
    smiles: data.id,
    label: `#${data.rank}`,
    font: {
      align: 'center',
    },
    type: 'reaction',
  };

  if (detail) {
    if (data.forwardScore !== undefined && data.forwardScore !== null) {
      node.label = `${data.numExamples} examples
Forward score: ${num2str(data.forwardScore)}
Template score: ${num2str(data.templateScore)}`;
    } else {
      node.label = `${data.numExamples} examples
FF score: ${num2str(data.ffScore)}
Template score: ${num2str(data.templateScore)}`;
    }
  } else {
    node.label = `#${data.rank}`;
  }

  if ('outcome' in data) {
    node.borderWidth = 2;
    node.color = { border: '#DC050C' };
    node.title = 'Selectivity warning! Select this node to see more details';
  } else if ('selecError' in data) {
    node.borderWidth = 2;
    node.color = { border: '#F6C141' };
  }

  return node;
}

function makeDisplayEdge({
  id, from, to, value,
}) {
  const node = {
    id,
    from,
    to,
    color: {
      color: '#000000',
      inherit: false,
    },
  };

  if (value !== undefined) {
    node.value = value;
    node.scaling = {
      min: 1,
      max: 5,
      customScalingFunction: edgeScaling,
    };
  }

  return node;
}

export { makeChemicalDisplayNode, makeReactionDisplayNode, makeDisplayEdge };
