<script setup lang="ts">
import { UI_STRINGS } from "../../utils/constants.ts";
import AnimatedAvatar from "./AnimatedAvatar.vue";

withDefaults(defineProps<{ title?: string }>(), { title: UI_STRINGS.DASHBOARD.GREETING });
</script>

<template>
  <section class="greeting-card">
    <h2 class="greeting-card__title">{{ title }}</h2>

    <div class="greeting-card__box">
      <AnimatedAvatar variant="dashboard" />
    </div>
  </section>
</template>

<style scoped>
.greeting-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(12px, 3vw, 20px);
  width: 100%;
}

.greeting-card__title {
  margin: 0;
  color: #252535;
  font-size: clamp(1.6rem, 1.1rem + 2.4vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-align: center;
}

.greeting-card__box {
  /* Roughly square, never wider than the screen, capped on desktop. */
  width: min(100%, 360px);
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 24px;
  background: #252535;
  box-shadow: 0 12px 32px rgba(37, 37, 53, 0.18);
}
</style>
