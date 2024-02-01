<template>
  <v-alert 
  :text=errorObj.string_error
  type="error"
  ></v-alert>
      <v-expansion-panels variant="popout" class="my-4">
        <v-expansion-panel title="Details" >
            <v-expansion-panel-text>
                <pre>{{ errorObj}}</pre>
            </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
  </template>
    
<script>
export default {
    name: "SolubilityError",
    props: {
        errorObj: {
            type: Object,
            default: {},
        },
    }
}
</script>
  