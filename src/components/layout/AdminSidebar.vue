<script setup lang="ts">
import { ROUTE_NAMES, UI_STRINGS } from "../../utils/constants";
import { useAuthStore } from "../../store/auth.store";
import { computed } from "vue";
import { VIcon } from "vuetify/components";

defineProps<{
  mobileOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const authStore = useAuthStore();

const navigationItems = [
  {
    label: "Overview",
    icon: "mdi-view-dashboard-outline",
    routeName: ROUTE_NAMES.DASHBOARD,
  },
];

const userName = computed(() => {
  return (
    authStore.user?.name?.trim() ||
    authStore.user?.email?.split("@")[0] ||
    UI_STRINGS.ADMIN.FALLBACK_USER
  );
});

const userRole = computed(() => authStore.user?.role ?? "admin");
</script>

<template>
  <button
    v-if="mobileOpen"
    class="sidebar-backdrop d-block d-md-none"
    type="button"
    aria-label="Close navigation"
    @click="emit('close')"
  />

  <aside
    class="admin-sidebar d-flex flex-column pt-6 px-4 pb-4"
    :class="{ 'admin-sidebar--open': mobileOpen }"
  >
    <div class="sidebar-brand d-flex align-center ga-3 px-2 pb-8">
      <div class="brand-mark d-flex align-center justify-center flex-shrink-0">e</div>

      <div class="brand-copy d-flex flex-column ga-1">
        <strong>{{ UI_STRINGS.APP_NAME }}</strong>
        <small>{{ UI_STRINGS.APP_DESCRIPTION }}</small>
      </div>

      <button
        class="sidebar-close d-flex d-md-none align-center justify-center ml-auto"
        type="button"
        aria-label="Close navigation"
        @click="$emit('close')"
      >
        <v-icon icon="mdi-close" />
      </button>
    </div>
    <nav class="sidebar-navigation d-flex flex-column ga-1" aria-label="Main navigation">
      <RouterLink
        v-for="item in navigationItems"
        :key="item.routeName"
        :to="{ name: item.routeName }"
        class="sidebar-link d-flex align-center ga-3 px-3"
        active-class="sidebar-link--active"
        @click="$emit('close')"
      >
        <v-icon :icon="item.icon" size="20" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-bottom d-flex flex-column mt-auto pt-6">
      <!-- <div class="sidebar-avatar-stage">
        <AnimatedAvatar class="sidebar-avatar" variant="sidebar" />
      </div> -->
      <div class="sidebar-user d-flex align-center ga-2 mt-4 px-1 pt-4 pb-3">
        <div class="user-initials d-flex align-center justify-center flex-shrink-0">
          {{ userName.slice(0, 1).toUpperCase() }}
        </div>

        <div class="user-details d-flex flex-column ga-1">
          <strong>{{ userName }}</strong>
          <span>{{ userRole }}</span>
        </div>

        <v-icon class="user-menu-indicator ml-auto" icon="mdi-account-circle-outline" size="19" />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  position: fixed;
  z-index: 20;
  top: 0;
  bottom: 0;
  left: 0;
  width: 264px;
  overflow-y: auto;
  border-right: 1px solid #ececf1;
  background: #fff;
  transition: transform 220ms ease;
}

.brand-mark {
  width: 37px;
  height: 37px;
  border-radius: 11px;
  background: #302e3c;
  color: white;
  font-family: Georgia, serif;
  font-size: 25px;
  font-style: italic;
}

.brand-copy strong {
  color: #302e3c;
  font-size: 15px;
  font-weight: 750;
  letter-spacing: -0.6px;
}

.brand-copy strong span {
  color: #9280c4;
}

.brand-copy small {
  color: #aaa7b1;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.13em;
}

.sidebar-close {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: #f4f3f7;
  color: #686474;
}

.sidebar-link {
  position: relative;
  min-height: 46px;
  border-radius: 10px;
  color: #777482;
  font-size: 12px;
  font-weight: 550;
  text-decoration: none;
  transition:
    background 160ms ease,
    color 160ms ease;
}

.sidebar-link:hover {
  background: #f7f6fa;
  color: #4f496a;
}

.sidebar-link--active {
  background: #f0edf8;
  color: #7060a6;
  font-weight: 700;
}

.sidebar-link--active::before {
  position: absolute;
  top: 11px;
  bottom: 11px;
  left: 0;
  width: 3px;
  border-radius: 0 5px 5px 0;
  background: #8977bd;
  content: "";
}

.sidebar-user {
  border-top: 1px solid #efedf2;
}

.user-initials {
  width: 35px;
  height: 35px;
  border: 1px solid #e9e4f2;
  border-radius: 10px;
  background: #f3eff8;
  color: #76669f;
  font-size: 13px;
  font-weight: 750;
}

.user-details {
  min-width: 0;
}

.user-details strong {
  overflow: hidden;
  color: #373440;
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-details span {
  color: #a09ba7;
  font-size: 9px;
  text-transform: uppercase;
}

.user-menu-indicator {
  color: #a5a0ad;
}

@media (max-width: 959.98px) {
  .admin-sidebar {
    z-index: 31;
    width: min(290px, 85vw);
    transform: translateX(-105%);
  }

  .admin-sidebar--open {
    transform: translateX(0);
  }

  .sidebar-backdrop {
    position: fixed;
    z-index: 30;
    inset: 0;
    border: 0;
    background: #17152275;
    backdrop-filter: blur(2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .admin-sidebar,
  .sidebar-link {
    transition: none;
  }
}
</style>
