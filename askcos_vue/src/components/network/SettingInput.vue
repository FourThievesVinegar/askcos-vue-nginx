<template>
  <v-row class="align-center">
    <v-col :cols="labelCols" class="pa-0">
      <v-icon v-if="helpText" icon="mdi-information" size="x-small"></v-icon>
      {{ label }}
    </v-col>
    <v-col class="pa-0">
      <slot></slot>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'SettingInput',
  props: {
    helpText: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: ''
    },
    labelCols: {
      type: Number,
      default: 6
    },
  },
}
</script>
