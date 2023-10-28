<template>
  <v-footer class="bg-blue-darken-2" absolute app height="50px">
    <v-row justify="center" no-gutters>
      <v-col class="text-center my-2" cols="12">
        <h6 class="text-body-1">ASKCOS version: {{ version }} Copyright © {{ new Date().getFullYear() }}.&nbsp; Last
          updated {{ lastUpdated }}. Created using FastAPI and Vue.</h6>
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