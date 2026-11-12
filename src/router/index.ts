import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth.store.ts";
import { ROUTE_NAMES, ROUTE_PATHS } from "../utils/constants";

const routes = [
  {
    path: ROUTE_PATHS.DEFAULT,
    redirect: ROUTE_PATHS.LOGIN,
  },
  {
    path: ROUTE_PATHS.LOGIN,
    name: ROUTE_NAMES.LOGIN,
    component: () => import("../views/auth/LoginView.vue"),
    meta: {
      guestOnly: true,
    },
  },
  {
    path: ROUTE_PATHS.DASHBOARD,
    name: ROUTE_NAMES.DASHBOARD,
    component: () => import("../views/dashboard/DashboardView.vue"),
    meta: {
      requiresAuth: true,
    },
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
