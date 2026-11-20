<script setup lang="ts">
import { VTextarea } from "vuetify/components";

defineOptions({ inheritAttrs: false });

const model = defineModel<string | null>();
</script>

<template>
  <v-textarea
    v-model="model"
    v-bind="{
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
      ...$attrs,
    }"
    class="base-textarea"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </v-textarea>
</template>

<style scoped>
.base-textarea :deep(.v-field) {
  border-radius: 12px;
  background: #fffffff2;
}

.base-textarea :deep(.v-field__input) {
  font-size: 13px;
}

.base-textarea :deep(.v-field__outline) {
  color: #e9e6e2;
}

.base-textarea :deep(.v-field--focused .v-field__outline) {
  color: #a495cf;
}

.base-textarea :deep(.v-label) {
  font-size: 13px;
}

.base-textarea :deep(.v-messages__message) {
  font-size: 11px;
}
</style>
