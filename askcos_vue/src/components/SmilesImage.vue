<template>
  <component :is="allowCopy ? 'copy-tooltip' : 'div'" v-bind="copyProps">
    <component
      :is="lazy ? 'v-img-lazy' : 'v-img'"
      v-bind="imageProps"
      class="hide-invalid"
    ></component>
  </component>
</template>

<script>
import CopyTooltip from "@/components/CopyTooltip";
import VImgLazy from "@/components/LazyImage.vue";
import { getImageUrl } from "@/common/drawing";
import { defineComponent } from "vue";
import { VImg } from "vuetify/components/VImg";

export default defineComponent({
  name: "SmilesImage",
  components: {
    CopyTooltip,
    VImgLazy,
    VImg,
  },
  props: {
    id: {
      type: String,
      default: "",
    },
    smiles: {
      type: String,
      default: "",
    },
    highlight: {
      type: Boolean,
      default: false,
    },
    drawMap: {
      type: Boolean,
      default: false,
    },
    reactingAtoms: {
      type: Array,
      default: () => [],
    },
    reference: {
      type: String,
      default: "",
    },
    align: {
      type: Boolean,
      default: false,
    },
    svg: {
      type: Boolean,
      default: true,
    },
    transparent: {
      type: Boolean,
      default: false,
    },
    allowCopy: {
      type: Boolean,
      default: false,
    },
    inputType: {
      type: String,
      default: "",
    },
    lazy: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    copyProps() {
      if (this.allowCopy) {
        return {
          data: this.smiles,
          title: "Copy SMILES",
          noHighlight: true,
        };
      } else {
        return {};
      }
    },
    imageProps() {
      const props = {
        src: this.url,
        alt: this.smiles,
      };
      if (this.id) {
        props.id = this.id;
      }
      // Include any other bound attributes
      Object.assign(props, this.$attrs);
      return props;
    },
    url() {
      return getImageUrl({
        smiles: this.smiles,
        inputType: this.inputType,
        svg: this.svg,
        transparent: this.transparent,
        highlight: this.highlight,
        drawMap: this.drawMap,
        reactingAtoms: this.reactingAtoms,
        reference: this.reference,
        align: this.align,
      });
    },
  },
});
</script>
