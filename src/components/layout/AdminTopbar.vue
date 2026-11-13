<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../../store/auth.store";

defineEmits<{
  toggleSidebar: [];
  logout: [];
}>();

const route = useRoute();
const authStore = useAuthStore();

const pageTitle = computed(() => {
  return typeof route.meta.title === "string" ? route.meta.title : "Overview";
});

const userName = computed(() => {
  return authStore.user?.name?.trim() || authStore.user?.email?.split("@")[0] || "Store Admin";
});
</script>

<template>
  <header class="admin-topbar">
    <div class="topbar-left">
      <button
        class="mobile-menu-button"
        type="button"
        aria-label="Open navigation"
        @click="$emit('toggleSidebar')"
      >
        <v-icon icon="mdi-menu" size="22" />
      </button>

      <div class="page-context">
        <div class="breadcrumbs">
          <span>Workspace</span>
          <v-icon icon="mdi-chevron-right" size="13" />
          <strong>{{ pageTitle }}</strong>
        </div>
        <h1>{{ pageTitle }}</h1>
      </div>
    </div>

    <div class="topbar-actions">
      <div class="topbar-user">
        <span class="user-greeting">SIGNED IN AS</span>
        <strong>{{ userName }}</strong>
      </div>

      <span class="topbar-divider"></span>

      <button class="logout-button" type="button" @click="$emit('logout')">
        <v-icon icon="mdi-logout-variant" size="18" />
        <span>Sign out</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.admin-topbar {
  position: sticky;
  z-index: 10;
  top: 0;
  display: flex;
  min-height: 76px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid #ececf1;
  padding: 0 clamp(20px, 3vw, 40px);
  background: #ffffffed;
  backdrop-filter: blur(14px);
}

.topbar-left,
.topbar-actions {
  display: flex;
  align-items: center;
}

.topbar-left {
  gap: 14px;
}

.page-context {
  display: grid;
  gap: 5px;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #aaa6b1;
  font-size: 9px;
}

.breadcrumbs strong {
  color: #837d90;
  font-weight: 650;
}

.page-context h1 {
  margin: 0;
  color: #302e3b;
  font-size: 17px;
  font-weight: 750;
  letter-spacing: -0.04em;
}

.topbar-actions {
  gap: 20px;
}

.topbar-user {
  display: grid;
  gap: 4px;
  text-align: right;
}

.user-greeting {
  color: #aaa6b1;
  font-size: 7px;
  font-weight: 750;
  letter-spacing: 0.13em;
}

.topbar-user strong {
  color: #514d5b;
  font-size: 11px;
  font-weight: 700;
}

.topbar-divider {
  width: 1px;
  height: 30px;
  background: #eceaf0;
}

.logout-button,
.mobile-menu-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #e9e7ed;
  border-radius: 9px;
  background: #fff;
  color: #777281;
  cursor: pointer;
  transition: 160ms ease;
}

.logout-button {
  min-height: 37px;
  padding: 0 12px;
  font-size: 10px;
  font-weight: 650;
}

.logout-button:hover,
.mobile-menu-button:hover {
  border-color: #d9d1e8;
  background: #f6f3fa;
  color: #6e5c9e;
}

.mobile-menu-button {
  display: none;
  width: 38px;
  height: 38px;
}

@media (max-width: 900px) {
  .mobile-menu-button {
    display: inline-flex;
  }
}

@media (max-width: 520px) {
  .admin-topbar {
    min-height: 68px;
    padding: 0 15px;
  }

  .topbar-user,
  .topbar-divider {
    display: none;
  }

  .logout-button {
    width: 38px;
    height: 38px;
    padding: 0;
  }

  .logout-button span {
    display: none;
  }

  .page-context h1 {
    font-size: 15px;
  }
}
</style>
