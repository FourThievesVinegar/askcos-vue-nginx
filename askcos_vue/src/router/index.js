// Composables
import { createRouter, createWebHistory } from "vue-router";

const routes = [
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
          import(/* webpackChunkName: "home" */ "@/views/network/Network.vue"),
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
          import(/* webpackChunkName: "home" */ "@/views/network/Network.vue"),
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
          import(/* webpackChunkName: "home" */ "@/views/status/Status.vue"),
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
        component: () => import(/* webpackChunkName: "home" */ '@/views/buyables/Buyables.vue'),
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
        name: "forward",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/forward/Forward.vue"),
      },
      {
        path: "",
        query: {
          tab: "forward",
        },
        name: "forward",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/forward/Forward.vue"),
      },
      {
        path: "",
        query: {
          tab: "impurity",
        },
        name: "forward",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/forward/Forward.vue"),
      },
      {
        path: "",
        query: {
          tab: "selectivity",
        },
        name: "forward",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/forward/Forward.vue"),
      },
      {
        path: "",
        query: {
          tab: "sites",
        },
        name: "forward",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/forward/Forward.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
