<script setup lang="ts">
import { ref, toRef } from "vue";
import remyModelUrl from "../../assets/avatar/character-greeting.glb?url";
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
const hasError = useAnimatedAvatar(container, {
  variant: toRef(props, "variant"),
  trackingTarget: toRef(props, "trackingTarget"),
  modelUrl: remyModelUrl,
});
</script>

<template>
  <div
    ref="container"
    class="animated-avatar"
    :class="`animated-avatar--${variant}`"
    aria-label="Animated character. Click to make it wave."
    role="img"
  >
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

.animated-avatar canvas {
  display: block;
  width: 100%;
  height: 100%;
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
