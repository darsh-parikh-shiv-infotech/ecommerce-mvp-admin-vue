<script setup lang="ts">
import { ROUTE_NAMES, UI_STRINGS } from "../../utils/constants";
import { useAuthStore } from "../../store/auth.store";
import { computed } from "vue";

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
  return authStore.user?.name?.trim() || authStore.user?.email?.split("@")[0] || "Store Admin";
});

const userRole = computed(() => authStore.user?.role ?? "admin");
</script>

<template>
  <button
    v-if="mobileOpen"
    class="sidebar-backdrop"
    type="button"
    aria-label="Close navigation"
    @click="emit('close')"
  />

  <aside class="admin-sidebar" :class="{ 'admin-sidebar--open': mobileOpen }">
    <div class="sidebar-brand">
      <div class="brand-mark">e</div>
      <div class="brand-copy">
        <strong>{{ UI_STRINGS.APP_NAME }}</strong>
        <small>{{ UI_STRINGS.APP_DESCRIPTION }}</small>
      </div>
      <button
        class="sidebar-close"
        type="button"
        aria-label="Close navigation"
        @click="$emit('close')"
      >
        <v-icon icon="mdi-close" />
      </button>
    </div>
    <nav class="sidebar-navigation" aria-label="Main navigation">
      <RouterLink
        v-for="item in navigationItems"
        :key="item.routeName"
        :to="{ name: item.routeName }"
        class="sidebar-link"
        active-class="sidebar-link--active"
        @click="$emit('close')"
      >
        <v-icon :icon="item.icon" size="20" />
        <span>{{ item.label }}</span>
        <v-icon
          v-if="item.routeName === ROUTE_NAMES.DASHBOARD"
          class="sidebar-link-indicator"
          icon="mdi-chevron-right"
          size="16"
        />
      </RouterLink>
    </nav>

    <div class="sidebar-bottom">
      <!-- <div class="sidebar-avatar-stage">
        <AnimatedAvatar class="sidebar-avatar" variant="sidebar" />
      </div> -->
      <div class="sidebar-user">
        <div class="user-initials">
          {{ userName.slice(0, 1).toUpperCase() }}
        </div>

        <div class="user-details">
          <strong>{{ userName }}</strong>
          <span>{{ userRole }}</span>
        </div>

        <v-icon class="user-menu-indicator" icon="mdi-account-circle-outline" size="19" />
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
  display: flex;
  width: 264px;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid #ececf1;
  padding: 26px 17px 16px;
  background: #fff;
  transition: transform 220ms ease;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 7px 32px;
}

.brand-mark {
  display: grid;
  width: 37px;
  height: 37px;
  flex: 0 0 37px;
  place-items: center;
  border-radius: 11px;
  background: #302e3c;
  color: white;
  font-family: Georgia, serif;
  font-size: 25px;
  font-style: italic;
}

.brand-copy {
  display: grid;
  gap: 4px;
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
  display: none;
  width: 32px;
  height: 32px;
  margin-left: auto;
  border: 0;
  border-radius: 8px;
  background: #f4f3f7;
  color: #686474;
}

.sidebar-section-label {
  margin: 0 10px 12px;
  color: #aaa7b1;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.14em;
}

.sidebar-navigation {
  display: grid;
  gap: 5px;
}

.sidebar-link {
  position: relative;
  display: flex;
  min-height: 46px;
  align-items: center;
  gap: 13px;
  border-radius: 10px;
  padding: 0 12px;
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

.sidebar-link-indicator {
  margin-left: auto;
  opacity: 0.65;
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  margin-top: auto;
  padding-top: 26px;
}

.sidebar-avatar-stage {
  position: relative;
  height: 185px;
  overflow: hidden;
  border-bottom: 1px solid #454153;
  isolation: isolate;
}

.avatar-stage-glow {
  position: absolute;
  top: 35%;
  left: 50%;
  width: 135px;
  height: 135px;
  border-radius: 50%;
  background: #a48cc6;
  filter: blur(65px);
  opacity: 0.23;
  transform: translate(-50%, -50%);
}

.avatar-stage-label {
  position: absolute;
  z-index: 2;
  top: 13px;
  left: 14px;
  color: #b6adbf;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.13em;
  pointer-events: none;
}

.sidebar-avatar-stage :deep(.sidebar-avatar) {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: transparent;
}

.avatar-stage-bottom {
  position: absolute;
  z-index: 2;
  right: 13px;
  bottom: 11px;
  left: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #b9b2c4;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.12em;
  pointer-events: none;
}

.avatar-online {
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar-online i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #83c5a0;
  box-shadow: 0 0 8px #83c5a080;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  border-top: 1px solid #efedf2;
  padding: 16px 3px 13px;
}

.user-initials {
  display: grid;
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  place-items: center;
  border: 1px solid #e9e4f2;
  border-radius: 10px;
  background: #f3eff8;
  color: #76669f;
  font-size: 13px;
  font-weight: 750;
}

.user-details {
  display: grid;
  min-width: 0;
  gap: 4px;
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
  margin-left: auto;
  color: #a5a0ad;
}

.sidebar-version {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #f0eef3;
  padding: 13px 3px 0;
  color: #b1adb7;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.sidebar-backdrop {
  display: none;
}

@media (max-width: 900px) {
  .admin-sidebar {
    z-index: 31;
    width: min(290px, 85vw);
    transform: translateX(-105%);
  }

  .admin-sidebar--open {
    transform: translateX(0);
  }

  .sidebar-close {
    display: grid;
    place-items: center;
  }

  .sidebar-backdrop {
    position: fixed;
    z-index: 30;
    inset: 0;
    display: block;
    border: 0;
    background: #17152275;
    backdrop-filter: blur(2px);
  }

  .sidebar-avatar-stage {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .admin-sidebar,
  .sidebar-link {
    transition: none;
  }
}
</style>
