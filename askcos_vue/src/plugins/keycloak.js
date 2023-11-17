import Keycloak from "keycloak-js";
import router from "../router";

const keycloakPlugin = {
  install: async (app, options) => {
    const keycloak = new Keycloak(options);

    await keycloak
      .init({ checkLoginIframe: false })
      .then(async (authenticated) => {
        app.config.globalProperties.$keycloak = keycloak;
        app.provide("$keycloak", keycloak);
        if (authenticated) {
          console.log("User is authenticated");
          const userProfile = await keycloak.loadUserProfile();
          localStorage.setItem("username", userProfile.username);
          localStorage.setItem("accessToken", keycloak.token);
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get("redirect");
          if (redirect) {
            router.push(decodeURIComponent(redirect));
          } else {
            router.push("/");
          }
        }
      })
      .catch((error) => {
        console.error("Keycloak initialization failed", error);
      });
  },
};

export default keycloakPlugin;
