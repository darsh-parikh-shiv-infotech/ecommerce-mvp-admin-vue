<script setup lang="ts">
import { VBtn } from "vuetify/components";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <v-btn
    v-bind="{ color: '#282735', variant: 'flat', size: 'large', block: true, ...$attrs }"
    class="base-button"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </v-btn>
</template>

<style scoped>
.base-button {
  min-height: 52px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

.base-button.v-btn--size-small:not(.v-btn--icon) {
  min-height: 37px;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 650;
}

.base-button.v-btn--variant-outlined {
  border-color: #e9e7ed;
  background: #fff;
  color: #777281;
}

.base-button.v-btn--variant-outlined:hover {
  border-color: #d9d1e8;
  background: #f6f3fa;
  color: #6e5c9e;
}

.base-button.v-btn--icon {
  width: 40px;
  min-width: 40px;
  min-height: 40px;
  height: 40px;
  border-radius: 10px;
}

.base-button.v-btn--size-small.v-btn--icon {
  width: 38px;
  min-width: 38px;
  min-height: 38px;
  height: 38px;
}

.base-button.v-btn--variant-text.v-btn--icon {
  color: #99939e;
}

.base-button.v-btn--variant-text.v-btn--icon:hover {
  color: #7765a8;
}
</style>
