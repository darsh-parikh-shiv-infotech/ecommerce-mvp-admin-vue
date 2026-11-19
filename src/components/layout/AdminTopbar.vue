<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { VIcon } from "vuetify/components";
import { useAuthStore } from "../../store/auth.store";
import BaseButton from "../common/BaseButton.vue";
import { UI_STRINGS } from "../../utils/constants.ts";

defineEmits<{
  toggleSidebar: [];
  logout: [];
}>();

const route = useRoute();
const authStore = useAuthStore();

const pageTitle = computed(() => {
  return typeof route.meta.title === "string" ? route.meta.title : UI_STRINGS.ADMIN.OVERVIEW;
});

const userName = computed(() => {
  return (
    authStore.user?.name?.trim() ||
    authStore.user?.email?.split("@")[0] ||
    UI_STRINGS.ADMIN.FALLBACK_USER
  );
});
</script>

<template>
  <header class="admin-topbar d-flex align-center justify-space-between ga-5 px-5 px-sm-6 px-md-10">
    <div class="topbar-left d-flex align-center ga-3">
      <BaseButton
        class="d-flex d-md-none"
        variant="text"
        icon
        size="small"
        density="compact"
        :block="false"
        type="button"
        aria-label="Open navigation"
        @click="$emit('toggleSidebar')"
      >
        <v-icon icon="mdi-menu" size="22" />
      </BaseButton>

      <div class="page-context">
        <h1>{{ pageTitle }}</h1>
      </div>
    </div>

    <div class="topbar-actions d-flex align-center ga-5">
      <div class="topbar-user d-none d-sm-flex flex-column ga-1 text-right">
        <span class="user-greeting">{{ UI_STRINGS.ADMIN.SIGNED_IN_AS }}</span>
        <strong>{{ userName }}</strong>
      </div>

      <span class="topbar-divider d-none d-sm-block"></span>

      <BaseButton
        class="logout-button"
        variant="outlined"
        color="#777281"
        size="small"
        :block="false"
        type="button"
        @click="$emit('logout')"
      >
        <v-icon icon="mdi-logout-variant" size="18" />
        <span class="d-none d-sm-inline">{{ UI_STRINGS.ADMIN.SIGN_OUT }}</span>
      </BaseButton>
    </div>
  </header>
</template>

<style scoped>
.admin-topbar {
  position: sticky;
  z-index: 10;
  top: 0;
  min-height: 76px;
  border-bottom: 1px solid #ececf1;
  background: #ffffffed;
  backdrop-filter: blur(14px);
}

.page-context h1 {
  margin: 0;
  color: #302e3b;
  font-size: 17px;
  font-weight: 750;
  letter-spacing: -0.04em;
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

@media (max-width: 520px) {
  .admin-topbar {
    min-height: 68px;
  }

  .page-context h1 {
    font-size: 15px;
  }
}
</style>
