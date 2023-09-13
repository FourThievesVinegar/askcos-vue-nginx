<template>
    <v-form>
      <template #label>
        <i v-if="helpText" class="fas fa-info-circle mr-1" :title="helpText"></i>
        {{ label }}
      </template>
      <slot></slot>
    </v-form>
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
    setup() {
  
    },
  }
  </script>
  