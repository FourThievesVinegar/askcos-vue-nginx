<template>
  <b-modal :id="id" size='fit' centered hide-header @ok="smilesFromKetcher" @shown="smilesToKetcher">
    <iframe ref="ketcherIframe" src="/ketcher/iframe/" width="800" height="432"></iframe>
    <b-spinner ref="ketcherSpinner" label="Loading"></b-spinner>
  </b-modal>
</template>
  
<script>
import { ref, watch } from 'vue';
import { API } from "@/common/api";

export default {
  name: 'KetcherModal',
  props: {
    id: {
      type: String,
      default: 'ketcher-modal',
    },
    smiles: {
      type: String,
      default: ''
    },
  },
  setup(props, context) {
    const ketcherIframe = ref(null);
    const ketcherSpinner = ref(null);

    watch(props.smiles, () => {
      smilesToKetcher();
    });

    const smilesToKetcher = () => {
      const km = ketcherIframe.value;
      const spinner = ketcherSpinner.value;
      if (!(km && km.contentWindow.ketcher && km.contentWindow.ketcher.ready)) {
        spinner.style.display = 'block';
        setTimeout(smilesToKetcher, 100);
        return;
      }
      const ketcher = km.contentWindow.ketcher;
      let molfileOld = ketcher.getMolfile();
      ketcher.editor.struct(null);
      spinner.style.display = 'block';

      if (!props.smiles) {
        spinner.style.display = 'none';
        return;
      }
      API.post('/api/v2/rdkit/smiles/to_molfile/', { 'smiles': props.smiles })
        .then(json => {
          ketcher.setMolecule(json.molfile);
          spinner.style.display = 'none';
        })
        .catch(error => {
          console.log('Could not convert SMILES to molfile for Ketcher use: ' + error);
          ketcher.setMolecule(molfileOld);
          spinner.style.display = 'none';
        });
    };

    const smilesFromKetcher = () => {
      const km = ketcherIframe.value;
      const ketcher = km.contentWindow.ketcher;

      let smiles = ketcher.getSmiles();
      return API.post('/api/v2/rdkit/smiles/canonicalize/', { smiles: smiles })
        .then(json => {
          if (json.smiles) {
            context.emit('update:smiles', json.smiles);
          }
        });
    };

    return {
      ketcherIframe,
      ketcherSpinner,
      smilesToKetcher,
      smilesFromKetcher
    };
  }
};
</script>
  
  
<style>
div.modal .modal-dialog.modal-fit {
  width: fit-content !important;
  max-width: 1000px !important;
}

#ketcher-iframe {
  border-width: 0;
}

#ketcher-spinner {
  position: absolute;
  z-index: 1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: auto;
  margin: auto;
  width: 50px;
  height: 50px;
}
</style>
  
  