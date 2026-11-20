import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth.store.ts";
import { ROUTE_NAMES, ROUTE_PATHS, UI_STRINGS } from "../utils/constants";
import AdminLayout from "../layouts/AdminLayout.vue";

const routes = [
  {
    path: ROUTE_PATHS.LOGIN,
    name: ROUTE_NAMES.LOGIN,
    component: () => import("../views/auth/LoginView.vue"),
    meta: {
      guestOnly: true,
    },
  },
  {
    path: ROUTE_PATHS.DEFAULT,
    component: AdminLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "",
        redirect: { name: ROUTE_NAMES.DASHBOARD },
      },
      {
        path: "dashboard",
        name: ROUTE_NAMES.DASHBOARD,
        component: () => import("../views/dashboard/DashboardView.vue"),
        meta: {
          title: UI_STRINGS.ADMIN.OVERVIEW,
        },
      },
      {
        path: "attribute-sets",
        name: ROUTE_NAMES.ATTRIBUTE_SETS,
        component: () => import("../views/attribute-set/AttributeSetView.vue"),
        meta: {
          title: UI_STRINGS.ATTRIBUTE_SET.TITLE,
        },
      },
      /*
      {
        path: "products",
        name: ROUTE_NAMES.PRODUCTS,
        component: () => import("../views/common/ComingSoonView.vue"),
        meta: {
          title: "Products",
        },
      },
      */
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  authStore.validateSession();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: ROUTE_NAMES.LOGIN,
      query: {
        redirect: to.fullPath,
      },
    };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return {
      name: ROUTE_NAMES.DASHBOARD,
    };
  }

  if (to.meta.roles && (!authStore.user || !to.meta.roles.includes(authStore.user.role))) {
    return {
      name: ROUTE_NAMES.DASHBOARD,
    };
  }

  return true;
});

export default router;
