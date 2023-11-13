<template>
  <v-footer class="text-white" absolute app height="50px" style="background: #1665c0;">
    <v-row class="justify-center align-center" no-gutters>
      <v-col class="text-center my-2 d-flex justify-center" cols="12">
        <div class="d-flex flex-row align-center">
          <v-img src="@/assets/MIT.png" :width="35" inline class="rounded-pill mr-1"></v-img>
          <h6 class="text-body-1">ASKCOS version: {{ version }} Copyright <span class="mdi mdi-copyright"></span> {{ new Date().getFullYear() }}.&nbsp; Last
            updated {{ lastUpdated }}. Created using FastAPI and Vue.</h6>
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
      lastUpdated: import.meta.env.VITE_LAST_UPDATE,
    };
  },
};
</script>