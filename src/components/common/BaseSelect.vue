<script setup lang="ts">
import { VSelect } from "vuetify/components";

defineOptions({ inheritAttrs: false });

const model = defineModel<unknown>();
</script>

<template>
  <v-select
    v-model="model"
    v-bind="{
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
      ...$attrs,
    }"
    class="base-select"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </v-select>
</template>

<style scoped>
.base-select :deep(.v-field) {
  border-radius: 12px;
  background: #fffffff2;
}

.base-select :deep(.v-field__input) {
  min-height: 56px;
  font-size: 13px;
}

.base-select :deep(.v-field__outline) {
  color: #e9e6e2;
}

.base-select :deep(.v-field--focused .v-field__outline) {
  color: #a495cf;
}

.base-select :deep(.v-label) {
  font-size: 13px;
}

.base-select :deep(.v-messages__message) {
  font-size: 11px;
}
</style>
