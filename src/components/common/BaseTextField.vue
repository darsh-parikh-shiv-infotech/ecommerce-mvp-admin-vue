<script setup lang="ts">
import { VTextField } from "vuetify/components";

defineOptions({ inheritAttrs: false });

const model = defineModel<string | number | null>();
</script>

<template>
  <v-text-field
    v-model="model"
    v-bind="{ variant: 'outlined', density: 'comfortable', hideDetails: 'auto', ...$attrs }"
    class="base-text-field"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </v-text-field>
</template>

<style scoped>
.base-text-field :deep(.v-field) {
  border-radius: 12px;
  background: #fffefa;
}

.base-text-field :deep(.v-field__input) {
  min-height: 56px;
  font-size: 13px;
}

.base-text-field :deep(.v-field__outline) {
  color: #e9e6e2;
}

.base-text-field :deep(.v-field--focused .v-field__outline) {
  color: #a495cf;
}

.base-text-field :deep(.v-label) {
  font-size: 13px;
}

.base-text-field :deep(.v-messages__message) {
  font-size: 11px;
}
</style>
