<template>
  <v-footer class="text-white" absolute app height="50px" style="background: #1665c0;">
    <v-row class="justify-center align-center" no-gutters>
      <v-col class="text-center my-2 d-flex justify-center" cols="12">
        <div class="d-flex flex-row align-center">
          <v-img src="@/assets/MIT.png" :width="35" inline class="rounded-pill"></v-img>
          <v-icon icon="mdi-circle-small"></v-icon>
          <v-btn variant="text" class="pa-0 text-body-1" prepend-icon="mdi-tag"
            :href="'https://gitlab.com/mlpds_mit/askcosv2/askcos-vue-nginx/-/tags/' + version" target="_blank">{{
            version }}</v-btn>
          <v-icon icon="mdi-circle-small"></v-icon>
          <v-btn variant="text" class="pa-0 text-body-1" prepend-icon="mdi-source-commit"
            :href="'https://gitlab.com/mlpds_mit/askcosv2/askcos-vue-nginx/-/commit/' + lastCommitHash"
            target="_blank">{{ lastCommitHash }}</v-btn>
          <v-icon icon="mdi-circle-small"></v-icon>
          <h6 class="text-body-1">Copyright <span class="mdi mdi-copyright"></span> {{ new
            Date().getFullYear() }}</h6>
          <v-icon icon="mdi-circle-small"></v-icon>
          <h6 class="text-body-1">Created using FastAPI and Vue</h6>
          <v-icon icon="mdi-circle-small"></v-icon>
          <a class="text-decoration-none font-weight-medium d-inline-flex align-center text-body-1"
            href="https://askcos-docs.mit.edu/guide/9-Privacy-&-Terms-of-Service/9.2-ASKCOS-Privacy-Statement.html"
            target="_blank" style="text-decoration: underline; color: white;">Privacy Statement
            <v-icon size="x-small">mdi mdi-open-in-new</v-icon>
          </a>
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