import { createRouter, createWebHistory, type RouteLocationNormalized } from "vue-router";
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
        path: ROUTE_PATHS.DASHBOARD,
        name: ROUTE_NAMES.DASHBOARD,
        component: () => import("../views/dashboard/DashboardView.vue"),
        meta: {
          title: UI_STRINGS.ADMIN.OVERVIEW,
        },
      },
      {
        path: ROUTE_PATHS.ATTRIBUTE_SETS,
        name: ROUTE_NAMES.ATTRIBUTE_SETS,
        component: () => import("../views/attribute-set/AttributeSetView.vue"),
        meta: {
          title: UI_STRINGS.ATTRIBUTE_SET.TITLE,
        },
      },
      {
        path: ROUTE_PATHS.PRODUCTS,
        name: ROUTE_NAMES.PRODUCTS,
        component: () => import("../views/product/ProductView.vue"),
        meta: {
          title: UI_STRINGS.PRODUCTS.TITLE,
        },
      },
      {
        path: "products/:id",
        name: ROUTE_NAMES.PRODUCT_DETAIL,
        component: () => import("../views/product/ProductDetailView.vue"),
        meta: {
          title: UI_STRINGS.PRODUCTS.DETAIL_TITLE,
        },
      },
      {
        path: "/products/create",
        name: ROUTE_NAMES.PRODUCT_CREATE,
        component: () => import("../views/product/ProductFormView.vue"),
      },
      {
        path: "/products/:id/edit",
        name: ROUTE_NAMES.PRODUCT_EDIT,
        component: () => import("../views/product/ProductFormView.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to: RouteLocationNormalized) => {
  const authStore = useAuthStore();

  await authStore.initializeAuth();

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
