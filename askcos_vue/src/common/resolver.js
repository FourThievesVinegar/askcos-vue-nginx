/*
 * External chemical name resolver utility
 */

async function resolveChemName(name) {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/IsomericSMILES/txt`;
  const response = await fetch(url);
  if (response.ok) {
    return response.text();
  }
  throw new Error(`Unable to resolve "${name}" to SMILES.`);
}

export { resolveChemName };
