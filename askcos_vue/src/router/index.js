// Composables
import { createRouter, createWebHistory } from "vue-router";
import { nextTick } from "vue";

const DEFAULT_TITLE = "ASKCOS";

const routes = [
  {
    path: "/commands",
    meta: { title: "Command" },
    component: () => import("@/views/parse/Parse.vue"),
  },
  {
    path: "/",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Home" },
    children: [
      {
        path: "",
        name: "Home",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/Home.vue"),
      },
    ],
  },
  {
    path: "/network",
    component: () => import("@/layouts/default/Default.vue"),
    beforeEnter: (to, _from, next) => {
      if (!isAuthenticated()) {
        next({
          name: "Login",
          query: { redirect: encodeURIComponent(to.fullPath) },
        });
      } else {
        next();
      }
    },
    meta: { title: "Retrosynthesis" },
    children: [
      {
        path: "",
        query: {
          tab: "IPP",
        },
        name: "Network",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "network-ipp" */ "@/views/network/Network.vue"
          ),
      },
      {
        path: "",
        query: {
          tab: "RP",
        },
        name: "Network",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "network-rp" */ "@/views/network/Network.vue"
          ),
      },
      {
        path: "",
        query: {
          tab: "TE",
        },
        name: "Network",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "network-te" */ "@/views/network/Network.vue"
          ),
      },
    ],
  },
  {
    path: "/status",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Status" },
    children: [
      {
        path: "",
        name: "Status",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "status" */ "@/views/status/Status.vue"),
      },
    ],
  },
  {
    path: "/buyables",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Buyables" },
    children: [
      {
        path: "",
        name: "Buyables",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "buyables" */ "@/views/buyables/Buyables.vue"
          ),
      },
    ],
  },
  {
    path: "/results",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Results" },
    beforeEnter: (_to, _from, next) => {
      if (!isAuthenticated()) {
        next({ name: "Login" });
      } else {
        next();
      }
    },
    children: [
      {
        path: "",
        name: "My Results",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "results" */ "@/views/results/Results.vue"
          ),
      },
    ],
  },
  {
    path: "/banlist",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Banlist" },
    beforeEnter: (_to, _from, next) => {
      if (!isAuthenticated()) {
        next({ name: "Login" });
      } else {
        next();
      }
    },
    children: [
      {
        path: "",
        name: "Banlist",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "banlist" */ "@/views/banlist/Banlist.vue"
          ),
      },
    ],
  },
  {
    path: "/forward",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Forward Synthesis" },
    children: [
      {
        path: "",
        query: {
          tab: "context",
        },
        name: "Forward",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "forward-context" */ "@/views/forward/Forward.vue"
          ),
      },
      {
        path: "",
        query: {
          tab: "forward",
        },
        name: "Forward",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "forward-forward" */ "@/views/forward/Forward.vue"
          ),
      },
      {
        path: "",
        query: {
          tab: "impurity",
        },
        name: "Forward",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "forward-impurity" */ "@/views/forward/Forward.vue"
          ),
      },
      {
        path: "",
        query: {
          tab: "selectivity",
        },
        name: "Forward",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "forward-selectivity" */ "@/views/forward/Forward.vue"
          ),
      },
      {
        path: "",
        query: {
          tab: "sites",
        },
        name: "Forward",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "forward-sites" */ "@/views/forward/Forward.vue"
          ),
      },
    ],
  },
  {
    path: "/solprop",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Solubility Properties" },
    children: [
      {
        path: "",
        query: {
          tab: "solpred",
        },
        name: "SolProp",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "solprop-solpred" */ "@/views/solprop/SolProp.vue"
          ),
      },
      {
        path: "",
        query: {
          tab: "solscreen",
        },
        name: "SolProp",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "solprop-solscreen" */ "@/views/solprop/SolProp.vue"
          ),
      },
    ],
  },
  {
    path: "/qm",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "QM Descriptor" },
    children: [
      {
        path: "",
        name: "QM",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "qm" */ "@/views/qm/QM.vue"),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    meta: { title: "404" },
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "NotFound",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "notfound" */ "@/views/notfound/NotFound.vue"
          ),
      },
    ],
  },
  {
    path: "/logs",
    name: "Logs",
    meta: { title: "Logs" },
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "Logs",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "logs" */ "@/views/logs/Logs.vue"),
      },
    ],
  },
  {
    path: "/drawing",
    name: "Drawing",
    meta: { title: "Drawing" },
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "Drawing",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "drawing" */ "@/views/drawing/Drawing.vue"
          ),
      },
    ],
  },
  {
    path: "/template",
    name: "Template",
    meta: { title: "Template Info" },
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "Template",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "template" */ "@/views/template/Template.vue"
          ),
      },
    ],
  },
  {
    name: "Admin Login",
    path: "/admin-login",
    meta: { title: "Admin Login" },
    component: () =>
      import(
        /* webpackChunkName: "admin-login" */ "@/views/login/AdminLogin.vue"
      ),
  },
  {
    name: "SSO Login",
    path: "/sso-login",
    meta: { title: "SSO Login" },
    component: () =>
      import(/* webpackChunkName: "sso-login" */ "@/views/login/SSOLogin.vue"),
  },
  {
    name: "Login",
    path: "/login",
    meta: { title: "Login" },
    component: () =>
      import(/* webpackChunkName: "login" */ "@/views/login/Login.vue"),
  },
  {
    name: "Admin",
    path: "/admin",
    meta: { title: "Admin" },
    beforeEnter: (_to, _from, next) => {
      if (!isAuthenticated()) {
        next({ name: "Admin Login" });
      } else {
        next();
      }
    },
    component: () =>
      import(/* webpackChunkName: "admin" */ "@/views/admin/Admin.vue"),
  },
];

const isAuthenticated = () => {
  const accessToken = localStorage.getItem("accessToken");
  return accessToken ? true : false;
};

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeResolve((to, _from, next) => {
  // If this isn't an initial page load.
  if (to.name) {
    // Start the route progress bar.
    // eslint-disable-next-line no-undef
    NProgress.start();
  }
  next();
});

router.afterEach(async (to) => {
  // Complete the animation of the route progress bar.
  // eslint-disable-next-line no-undef
  NProgress.done();
  await nextTick();
  document.title = `${to.meta.title} - ASKCOS` || DEFAULT_TITLE;
});

router.beforeEach((_to, from, next) => {
  if (from.fullPath) {
    localStorage.setItem("lastRoute", from.fullPath);
  }
  next();
});

export default router;
