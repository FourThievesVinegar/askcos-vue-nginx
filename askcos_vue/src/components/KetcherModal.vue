<template>
  <v-dialog v-model="propShow" :id="id" width="auto">
    <v-card>
      <v-card-text>
        <iframe ref="ketcherIframe" src="/ketcher-standalone/index.html" width="800" height="432"></iframe>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="propShow = false">Ok</v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>
  
<script>
import { ref, watch, computed } from 'vue';
import { API } from "@/common/api";

export default {
  name: 'KetcherModal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
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
    // const ketcherSpinner = ref(null);

    const propShow = computed({
      get() {
        return props.value
      },
      set(newValue) {
        context.emit('input', newValue)
      },
    })

    watch(propShow, () => {
        smilesToKetcher();
    });

    const smilesToKetcher = () => {
      // console.log(props.smiles)
      const km = ketcherIframe.value;
      // const spinner = ketcherSpinner.value;
      if (!(km && km.contentWindow.ketcher)) {
        // spinner.style.display = 'block';
        setTimeout(smilesToKetcher, 100);
        return;
      }
      const ketcher = km.contentWindow.ketcher;
      let molfileOld = ketcher.getMolfile();
      ketcher.editor.struct(null);
      // // spinner.style.display = 'block';

      if (!props.smiles) {
        // spinner.style.display = 'none';
        return;
      }
      API.post('/api/v2/rdkit/smiles/to_molfile/', { 'smiles': props.smiles })
        .then(json => {
          ketcher.setMolecule(json.molfile);
          // spinner.style.display = 'none';
        })
        .catch(error => {
          console.log('Could not convert SMILES to molfile for Ketcher use: ' + error);
          ketcher.setMolecule(molfileOld);
          // spinner.style.display = 'none';
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

    function dialogChange(dialogState) {
      console.log(dialogState)
    }

    return {
      propShow,
      ketcherIframe,
      smilesToKetcher,
      smilesFromKetcher,
      dialogChange,
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
  
  