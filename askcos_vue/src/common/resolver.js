/*
 * External chemical name resolver utility
 */

function resolveChemName(name) {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/IsomericSMILES/txt`;
  return fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.text();
      }
      throw new Error(`Unable to resolve "${name}" to SMILES.`);
    });
}

export { resolveChemName };
