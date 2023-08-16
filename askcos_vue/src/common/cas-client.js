/*
 * Auth service for connecting to SciFinder API
 */
import { UserManager, WebStorageStateStore } from 'oidc-client';

// const apiServer = 'https://scifinder-n-preprod.cas.org'  // Testing
const apiServer = 'https://scifinder-n.cas.org'; // Production
const client_id = 'mwlzgyvify';
const { origin } = window.location;

export class ProxyUserManager extends UserManager {
  constructor(settings = {}, proxyHost) {
    super(settings);
    this.proxyHost = proxyHost;
  }

  _signinStart(args, navigator, navigatorParams = {}) {
    return navigator.prepare(navigatorParams).then((handle) => this.createSigninRequest(args).then((signinRequest) => {
      // Manually include placeholder nonce in url since SciFinder API checks for it
      const url = `${signinRequest.url}&nonce=0`;
      // Navigate to proxied URL for sign in request
      navigatorParams.url = `${this.proxyHost}/api/oauth2/proxy-redirect?redirect_to=${url}`;
      navigatorParams.id = signinRequest.state.id;

      return handle.navigate(navigatorParams);
    }).catch((err) => {
      if (handle.close) {
        handle.close();
      }
      throw err;
    }));
  }
}

class CasClient {
  constructor(args = {}, proxyHost) {
    const settings = {
      client_id,
      popup_redirect_uri: `${origin}/cas/login/`,
      silent_redirect_uri: `${origin}/cas/silent/`,
      automaticSilentRenew: true,
      popupWindowFeatures: 'left=100,top=100,width=900,height=700',
      response_type: 'code',
      scope: 'openid sfn-search',
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      ...args,
    };

    if (proxyHost) {
      this.userManager = new ProxyUserManager(settings, proxyHost);
    } else {
      this.userManager = new UserManager(settings);
    }
    this.apiServer = apiServer;
  }

  getAccessToken() {
    // Returns Promise with user access token
    return this.userManager.getUser().then((user) => user.access_token);
  }

  getUser() {
    // Returns Promise with User instance from storage
    return this.userManager.getUser();
  }

  login() {
    // Returns Promise with User instance after popup authentication
    return this.userManager.signinPopup();
  }

  post(endpoint, data) {
    // Send POST request to CAS API using access token
    return this.getAccessToken()
      .then((token) => {
        const headers = new Headers();
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('Content-Type', 'application/json');
        return fetch(this.apiServer + endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
      })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return response.json().catch(() =>
          // Status not ok, and there is no json body
          Promise.reject(new Error(response.statusText))).then((json) =>
            // Status not ok, but there is a json body
            Promise.reject(new Error(json.error)));
      });
  }
}

function createCasClient(args = {}, proxy = null) {
  // Look up CAS SSO server and return AuthService instance
  // Returns Promise
  return fetch(`${apiServer}/api/oauth2/metadata`)
    .then((resp) => {
      const settings = { authority: resp.headers.get('Location'), ...args };
      return new CasClient(settings, proxy);
    });
}

export { createCasClient };
