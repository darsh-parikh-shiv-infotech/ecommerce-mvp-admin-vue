<script setup lang="ts">
import AvatarGreetingCard from "../../components/common/AvatarGreetingCard.vue";
import { UI_STRINGS } from "../../utils/constants.ts";
</script>

<template>
  <AvatarGreetingCard :title="UI_STRINGS.DASHBOARD.GREETING" class="dashboard-greeting" />
</template>

<style scoped>
.dashboard-greeting {
  margin-top: 3%;
}
</style>
