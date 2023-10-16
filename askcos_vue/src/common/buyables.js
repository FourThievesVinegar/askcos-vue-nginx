/*
 * Buyables database utilities
 */

import { API } from '@/common/api';

const NO_SOURCE = 'none';
const NO_SOURCE_QUERY = [null, ''];
const NO_SOURCE_TEXT = 'No Source';

function sourceQueryToArgs(sources) {
  // Replaces no source query values with argument values
  // Query values are returned with tree builder results
  // Argument values are suitable for buyables API calls
  const filteredSources = sources.filter((source) => !NO_SOURCE_QUERY.includes(source));
  if (sources.length !== filteredSources.length) {
    filteredSources.push(NO_SOURCE);
    return filteredSources;
  }
  return sources;
}

function sourceArgsToDisplay(sources) {
  // Replaces no source argument values with "No Source" string and converts array to string
  return sources.map((source) => (source === NO_SOURCE ? NO_SOURCE_TEXT : source)).toString();
}

function processSources(sources) {
  // Converts comma separated strings to a list if necessary
  // Replaces query values with argument values if necessary
  // Returns an array of sources
  if (typeof sources === 'string') {
    sources = sources.split(',');
  }
  return sourceQueryToArgs(sources);
}

function getBuyables(smiles, sources, regex, returnLimit, tanSim) {
  // Convenience function for GET requests to buyables endpoint
  // smiles should be array SMILES string
  // sources should be array of sources or comma delimited string (optional)
  const url = '/api/buyables/list-buyables';
  const params = new URLSearchParams();
  if (smiles) {
    params.append('q', smiles);
  }
  if (sources) {
    processSources(sources).forEach((source) => params.append('source', source));
  }
  if (regex) {
    params.append('regex', regex);
  }
  if (returnLimit) {
    params.append('returnLimit', returnLimit);
  }
  if (tanSim) {
    params.append('sim_threshold', tanSim);
  }

  return API.get(url, params);
}

function lookupBuyables(smiles, sources, canonicalize) {
  // Convenience function for POST requests to buyables lookup endpoint
  // smiles should be array of SMILES strings
  // sources should be array of sources or comma delimited string (optional)
  const url = '/api/buyables/lookup';
  const body = { smiles };
  if (sources) {
    body.source = processSources(sources);
  }
  if (canonicalize) {
    body.canonicalize = canonicalize;
  }

  console.log(body)
  return API.post(url, body);
}

export {
  NO_SOURCE,
  NO_SOURCE_QUERY,
  NO_SOURCE_TEXT,
  getBuyables,
  lookupBuyables,
  sourceQueryToArgs,
  sourceArgsToDisplay,
};
