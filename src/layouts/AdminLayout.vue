<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import AdminSidebar from "../components/layout/AdminSidebar.vue";
import AdminTopbar from "../components/layout/AdminTopbar.vue";
import { useAuthStore } from "../store/auth.store";
import { ROUTE_NAMES } from "../utils/constants";

const router = useRouter();
const authStore = useAuthStore();

const isSidebarOpen = ref(false);

function toggleSidebar(): void {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function closeSidebar(): void {
  isSidebarOpen.value = false;
}

async function handleLogout(): Promise<void> {
  authStore.logout();
  closeSidebar();
  await router.replace({ name: ROUTE_NAMES.LOGIN });
}
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar :mobile-open="isSidebarOpen" @close="closeSidebar" />

    <div class="admin-main">
      <AdminTopbar @toggle-sidebar="toggleSidebar" @logout="handleLogout" />

      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  min-height: 100svh;
  background: #f6f7fb;
}

.admin-main {
  min-width: 0;
  min-height: 100vh;
  margin-left: 264px;
}

.admin-content {
  min-height: calc(100vh - 76px);
  padding: 32px clamp(22px, 3vw, 42px) 48px;
}

@media (max-width: 900px) {
  .admin-main {
    margin-left: 0;
  }

  .admin-content {
    padding: 24px 20px 40px;
  }
}

@media (max-width: 480px) {
  .admin-content {
    padding: 20px 15px 32px;
  }
}
</style>
