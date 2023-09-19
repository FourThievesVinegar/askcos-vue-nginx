// Composables
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
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
        component: () => import(/* webpackChunkName: "buyables" */ '@/views/Banlist/Banlist.vue'),
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
            import(/* webpackChunkName: "forward" */ "@/views/forward/Forward.vue"),
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
            import(/* webpackChunkName: "forward" */ "@/views/forward/Forward.vue"),
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
            import(/* webpackChunkName: "forward" */ "@/views/forward/Forward.vue"),
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
            import(/* webpackChunkName: "forward" */ "@/views/forward/Forward.vue"),
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
    path: "/bug",
    component: () => import(/* webpackChunkName: "TheSupportModal" */ "@/components/TheSupportModal.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
