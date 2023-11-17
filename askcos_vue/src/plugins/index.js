/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import { loadFonts } from "./webfontloader";
import vuetify from "./vuetify";
import pinia from "../store";
import router from "../router";
import VueConfetti from "vue-confetti";
import VuetifyUseDialog from "vuetify-use-dialog";
import keycloakPlugin from "./keycloak";

export function registerPlugins(app) {
  loadFonts();
  app
    .use(vuetify)
    .use(pinia)
    .use(VueConfetti)
    .use(VuetifyUseDialog)
    .use(keycloakPlugin, {
      // Keycloak configuration options (e.g., realm, clientId, url)
      realm: "askcos",
      clientId: "askcos-vue",
      url: "http://3.16.7.29:8080",
      idpHint: "github",
    })
    .use(router);
}
