<script setup lang="ts">
import { computed, watch } from "vue";
import {
  VDialog,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VSelect,
  VRadioGroup,
  VRadio,
  VIcon,
  VSpacer,
} from "vuetify/components";

import BaseButton from "../common/BaseButton.vue";
import BaseTextField from "../common/BaseTextField.vue";

import { UI_STRINGS } from "../../utils/constants";
import { getPlaceholder } from "../../utils/placeholder.utils";

import type { AttributeSetPayload } from "../../store/attribute-set.store";
import { useAttributeSetForm } from "../../utils/composables/useAttributeSetForm.ts";
import type { Attribute, AttributeSet } from "../../store/common.types.ts";

const props = defineProps<{
  modelValue: boolean;
  attributes: Attribute[];
  initialData: AttributeSet | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [payload: AttributeSetPayload];
}>();

const isEdit = computed(() => Boolean(props.initialData));

const defaultValues = (): AttributeSetPayload => ({
  name: "",
  attribute_id: [],
  status: "active",
});

const {
  name,
  nameAttrs,
  attributeId,
  attributeIdAttrs,
  status,
  statusAttrs,
  errors,
  handleSubmit,
  resetForm,
} = useAttributeSetForm(defaultValues());

watch(
  () => [props.modelValue, props.initialData] as const,
  ([isOpen, data]) => {
    if (!isOpen) return;

    resetForm({
      values: data
        ? {
            name: data.name,
            attribute_id: data.attributes.map((item) => item.id),
            status: data.status,
          }
        : defaultValues(),
    });
  },
  { immediate: true },
);

function closeDialog() {
  if (!props.loading) {
    emit("update:modelValue", false);
  }
}

const submitForm = handleSubmit((values) => {
  emit("submit", {
    name: values.name.trim(),
    attribute_id: values.attribute_id,
    status: values.status,
  });
});
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="xl" class="pa-2">
      <v-card-title class="d-flex align-center justify-space-between px-5 pt-5">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? UI_STRINGS.ATTRIBUTE_SET.EDIT : UI_STRINGS.ATTRIBUTE_SET.ADD }}
        </span>

        <BaseButton
          icon
          variant="text"
          size="small"
          :aria-label="UI_STRINGS.ATTRIBUTE_SET.CLOSE"
          :disabled="loading"
          @click="closeDialog"
        >
          <v-icon icon="mdi-close" />
        </BaseButton>
      </v-card-title>

      <v-card-text class="px-5 pt-4">
        <form class="d-flex flex-column ga-4" @submit.prevent="submitForm">
          <BaseTextField
            v-model="name"
            v-bind="nameAttrs"
            :label="UI_STRINGS.ATTRIBUTE_SET.NAME_LABEL"
            :placeholder="getPlaceholder(UI_STRINGS.ATTRIBUTE_SET.NAME_LABEL)"
            :error-messages="errors.name"
          />

          <v-select
            v-model="attributeId"
            v-bind="attributeIdAttrs"
            :items="attributes"
            item-title="name"
            item-value="id"
            :label="UI_STRINGS.ATTRIBUTE_SET.ATTRIBUTES_LABEL"
            :placeholder="UI_STRINGS.ATTRIBUTE_SET.SELECT_ATTRIBUTES"
            variant="outlined"
            density="comfortable"
            multiple
            chips
            closable-chips
            hide-details="auto"
            :error-messages="errors.attribute_id"
          />

          <div>
            <div class="text-body-2 font-weight-medium mb-2">
              {{ UI_STRINGS.ATTRIBUTE_SET.STATUS_LABEL }}
            </div>

            <v-radio-group v-model="status" v-bind="statusAttrs" inline hide-details>
              <v-radio :label="UI_STRINGS.ATTRIBUTE_SET.ACTIVE" value="active" color="success" />
              <v-radio
                :label="UI_STRINGS.ATTRIBUTE_SET.INACTIVE"
                value="inactive"
                color="warning"
              />
            </v-radio-group>
          </div>
        </form>
      </v-card-text>

      <v-card-actions class="px-5 pb-5">
        <v-spacer />

        <BaseButton
          variant="outlined"
          size="small"
          :block="false"
          :disabled="loading"
          @click="closeDialog"
        >
          {{ UI_STRINGS.ATTRIBUTE_SET.CANCEL }}
        </BaseButton>

        <BaseButton size="small" :block="false" :loading="loading" @click="submitForm">
          {{ UI_STRINGS.ATTRIBUTE_SET.SAVE }}
        </BaseButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
