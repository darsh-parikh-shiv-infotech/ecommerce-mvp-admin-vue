<script setup lang="ts">
import { ref, toRef } from "vue";
import remyModelUrl from "../../assets/avatar/avatar.glb?url";
import { useAnimatedAvatar } from "../../utils/avatar/useAnimatedAvatar";
import type { AvatarVariant } from "../../utils/avatar/three-avatar";

const props = withDefaults(
  defineProps<{
    variant?: AvatarVariant;
    trackingTarget?: HTMLElement | null;
  }>(),
  {
    variant: "login",
    trackingTarget: null,
  },
);

const container = ref<HTMLDivElement | null>(null);
const { hasError, isLoading } = useAnimatedAvatar(container, {
  variant: toRef(props, "variant"),
  trackingTarget: toRef(props, "trackingTarget"),
  modelUrl: remyModelUrl,
});
</script>

<template>
  <div
    ref="container"
    class="animated-avatar"
    :class="[`animated-avatar--${variant}`, { 'animated-avatar--loading': isLoading }]"
    :aria-busy="isLoading"
    aria-label="Animated character. Click to make it wave."
    role="img"
  >
    <div v-if="isLoading && !hasError" class="animated-avatar__loader" role="status">
      <span class="animated-avatar__spinner" />
      <span class="animated-avatar__sr">Loading character</span>
    </div>
    <div v-if="hasError" class="animated-avatar__fallback">Avatar unavailable</div>
  </div>
</template>

<style scoped>
.animated-avatar {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  /* Override from the parent with --avatar-bg, e.g. `transparent`. */
  background: var(--avatar-bg, #252535);
}

.animated-avatar :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 1;
  transition: opacity 0.35s ease;
}

.animated-avatar--loading :deep(canvas) {
  opacity: 0;
}

.animated-avatar__loader {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.animated-avatar__spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.18);
  border-top-color: #b79df0;
  border-radius: 50%;
  animation: avatar-spin 0.8s linear infinite;
}

.animated-avatar__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@keyframes avatar-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated-avatar__spinner {
    animation-duration: 2.4s;
  }
}

.animated-avatar__fallback {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: inherit;
  place-items: center;
  color: #888;
  font-size: 12px;
}
</style>
