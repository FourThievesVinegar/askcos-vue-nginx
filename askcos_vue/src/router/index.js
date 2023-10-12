// Composables
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    name: "Login",
    path: "/login",
    component: () => import(/* webpackChunkName: "login" */ "@/views/login/Login.vue")
  },
  {
    path: "/commands",
    component: () => import("@/views/parse/Parse.vue")
  },
  {
    path: "/",
    component: () => import("@/layouts/default/Default.vue"),
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
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) {
        next({ name: 'Login' })
      }
      else {
        next()
      }
    },
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
          import(/* webpackChunkName: "network" */ "@/views/network/Network.vue"),
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
          import(/* webpackChunkName: "network" */ "@/views/network/Network.vue"),
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
          import(/* webpackChunkName: "network" */ "@/views/network/Network.vue"),
      },
    ],
  },
  {
    path: "/status",
    component: () => import("@/layouts/default/Default.vue"),
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
    path: '/buyables',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Buyables',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "buyables" */ '@/views/buyables/Buyables.vue'),
      },
    ],
  },
  {
    path: '/results',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'My Results',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "buyables" */ '@/views/results/Results.vue'),
      },
    ],
  },
  {
    path: '/banlist',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Banlist',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "buyables" */ '@/views/banlist/Banlist.vue'),
      },
    ],
  },
  {
    path: '/profile',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Profile',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "buyables" */ '@/views/profile/Profile.vue'),
      },
    ],
  },
  {
    path: "/forward",
    component: () => import("@/layouts/default/Default.vue"),
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
          import(/* webpackChunkName: "forward" */ "@/views/forward/Forward.vue"),
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
          import(/* webpackChunkName: "forward" */ "@/views/forward/Forward.vue"),
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
          import(/* webpackChunkName: "forward" */ "@/views/forward/Forward.vue"),
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
          import(/* webpackChunkName: "forward" */ "@/views/forward/Forward.vue"),
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
          import(/* webpackChunkName: "forward" */ "@/views/forward/Forward.vue"),
      },
    ],
  },
  {
    path: "/solprop",
    component: () => import("@/layouts/default/Default.vue"),
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
          import(/* webpackChunkName: "home" */ "@/views/solprop/SolProp.vue"),
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
          import(/* webpackChunkName: "home" */ "@/views/solprop/SolProp.vue"),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "buyables" */ '@/views/notfound/NotFound.vue'),
      },
    ],
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

const isAuthenticated = () => {
  const accessToken = localStorage.getItem('accessToken');
  return accessToken ? true : false
};

export default router;
