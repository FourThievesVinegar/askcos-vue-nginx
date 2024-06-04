<template>
  <v-footer class="text-white" absolute app height="50px" style="background: #491d88;">
    <v-row class="justify-center align-center" no-gutters>
      <v-col class="text-center my-2 d-flex justify-center" cols="12">
        <div class="d-flex flex-row align-center">
          <v-img src="@/assets/MIT.png" :width="40" inline class="rounded-pill"></v-img>
          <v-icon icon="mdi-circle-small"></v-icon>
          <v-btn variant="text" class="pa-0 text-body-1" prepend-icon="mdi-tag"
            :href="'https://gitlab.com/mlpds_mit/askcosv2/askcos-vue-nginx/-/tags/' + version" target="_blank">{{
            version }}</v-btn>
          <v-icon icon="mdi-circle-small"></v-icon>
          <v-btn variant="text" class="pa-0 text-body-1" prepend-icon="mdi-source-commit"
            :href="'https://gitlab.com/mlpds_mit/askcosv2/askcos-vue-nginx/-/commit/' + lastCommitHash"
            target="_blank">{{ lastCommitHash }}</v-btn>
          <v-icon icon="mdi-circle-small"></v-icon>
        </div>
      </v-col>
    </v-row>
  </v-footer>
</template>
<script>
export default {
  data() {
    return {
      version: import.meta.env.VITE_VERSION,
      lastCommitHash: import.meta.env.VITE_APP_VERSION
    };
  },
};
</script>