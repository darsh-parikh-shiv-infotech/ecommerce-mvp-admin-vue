<script setup lang="ts">
import { Field, useFieldArray, useFormContext } from "vee-validate";
import { VBtn, VCard, VCardText, VChip, VFileInput, VImg, VTable } from "vuetify/components";
import type { VariantPayload } from "../../store/common.types";
import BaseTextField from "../common/BaseTextField.vue";
import BaseSelect from "../common/BaseSelect.vue";
import { ref } from "vue";
import { UI_STRINGS } from "../../utils/constants";

defineProps<{
  imageUploadingIndex: number | null;
}>();

const emit = defineEmits<{
  uploadImage: [index: number, file: File];
}>();

const { fields, push, remove } = useFieldArray<VariantPayload>("variants");
const { validateField, setFieldTouched } = useFormContext<{
  variants: VariantPayload[];
}>();
const imageErrors = ref<Record<number, string>>({});

const statusOptions = [
  { title: UI_STRINGS.PRODUCTS.ACTIVE, value: "active" },
  { title: UI_STRINGS.PRODUCTS.INACTIVE, value: "inactive" },
];
const fieldsToValidate = [
  "title",
  "code",
  "price",
  "fake_price",
  "available_quantity",
  "on_hand_quantity",
  "status",
] as const;

function createVariant(): VariantPayload {
  return {
    title: "",
    code: "",
    price: 0,
    fake_price: 0,
    available_quantity: 0,
    on_hand_quantity: 0,
    product_variant_image: [],
    status: "active",
  };
}

async function addVariant() {
  let hasInvalidField = false;

  for (let index = 0; index < fields.value.length; index += 1) {
    for (const field of fieldsToValidate) {
      const fieldPath = `variants[${index}].${field}` as const;
      setFieldTouched(fieldPath, true);

      const result = await validateField(fieldPath);
      hasInvalidField ||= !result.valid;
    }
  }

  if (hasInvalidField) return;

  push(createVariant());
}

function handleImageChange(index: number, file: File | File[] | null) {
  const selected = Array.isArray(file) ? file[0] : file;

  if (!selected) {
    delete imageErrors.value[index];
    return;
  }

  if (!selected.type.startsWith("image/")) {
    imageErrors.value[index] = UI_STRINGS.PRODUCTS.FORM.INVALID_IMAGE_TYPE;
    return;
  }

  delete imageErrors.value[index];
  emit("uploadImage", index, selected);
}

function removeVariant(index: number) {
  remove(index);
}
</script>

<template>
  <VCard rounded="lg">
    <VCardText class="pa-5">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-5">
        <div>
          <h3 class="text-h6 font-weight-bold">
            {{ UI_STRINGS.PRODUCTS.VARIANT_TITLE }}
          </h3>

          <p class="text-body-2 text-medium-emphasis">
            {{ UI_STRINGS.PRODUCTS.FORM.VARIANTS_DESCRIPTION }}
          </p>
        </div>

        <VBtn color="primary" variant="flat" prepend-icon="mdi-plus" @click="addVariant">
          {{ UI_STRINGS.PRODUCTS.FORM.ADD_VARIANT }}
        </VBtn>
      </div>

      <div v-if="fields.length === 0" class="text-center pa-8">
        <VChip color="warning" variant="tonal" class="mb-3">
          {{ UI_STRINGS.PRODUCTS.FORM.NO_VARIANTS }}
        </VChip>

        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ UI_STRINGS.PRODUCTS.FORM.ADD_VARIANT_HELP }}
        </p>

        <VBtn color="primary" variant="outlined" @click="addVariant">
          {{ UI_STRINGS.PRODUCTS.FORM.ADD_FIRST_VARIANT }}
        </VBtn>
      </div>

      <div v-else class="variant-table-wrapper">
        <VTable class="variant-table">
          <thead>
            <tr>
              <th>{{ UI_STRINGS.PRODUCTS.FORM.VARIANT_COLUMNS.TITLE }}</th>
              <th>{{ UI_STRINGS.PRODUCTS.FORM.VARIANT_COLUMNS.CODE }}</th>
              <th>{{ UI_STRINGS.PRODUCTS.FORM.VARIANT_COLUMNS.PRICE }}</th>
              <th>{{ UI_STRINGS.PRODUCTS.FORM.VARIANT_COLUMNS.FAKE_PRICE }}</th>
              <th>{{ UI_STRINGS.PRODUCTS.FORM.VARIANT_COLUMNS.AVAILABLE }}</th>
              <th>{{ UI_STRINGS.PRODUCTS.FORM.VARIANT_COLUMNS.ON_HAND }}</th>
              <th>{{ UI_STRINGS.PRODUCTS.FORM.VARIANT_COLUMNS.STATUS }}</th>
              <th>{{ UI_STRINGS.PRODUCTS.FORM.VARIANT_COLUMNS.IMAGES }}</th>
              <th>{{ UI_STRINGS.PRODUCTS.FORM.VARIANT_COLUMNS.ACTION }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(entry, index) in fields" :key="entry.key">
              <td>
                <Field
                  v-slot="{ value, handleChange, handleBlur, errorMessage }"
                  :name="`variants[${index}].title`"
                >
                  <BaseTextField
                    :model-value="value"
                    :placeholder="UI_STRINGS.PRODUCTS.FORM.VARIANT_TITLE_PLACEHOLDER"
                    density="compact"
                    :error-messages="errorMessage"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </td>

              <td>
                <Field
                  v-slot="{ value, handleChange, handleBlur, errorMessage }"
                  :name="`variants[${index}].code`"
                >
                  <BaseTextField
                    :model-value="value"
                    :placeholder="UI_STRINGS.PRODUCTS.FORM.VARIANT_CODE_PLACEHOLDER"
                    density="compact"
                    :error-messages="errorMessage"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </td>

              <td>
                <Field
                  v-slot="{ value, handleChange, handleBlur, errorMessage }"
                  :name="`variants[${index}].price`"
                >
                  <BaseTextField
                    :model-value="value"
                    :placeholder="UI_STRINGS.PRODUCTS.FORM.VARIANT_PRICE_PLACEHOLDER"
                    density="compact"
                    type="number"
                    :error-messages="errorMessage"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </td>

              <td>
                <Field
                  v-slot="{ value, handleChange, handleBlur, errorMessage }"
                  :name="`variants[${index}].fake_price`"
                >
                  <BaseTextField
                    :model-value="value"
                    :placeholder="UI_STRINGS.PRODUCTS.FORM.VARIANT_FAKE_PRICE_PLACEHOLDER"
                    density="compact"
                    type="number"
                    :error-messages="errorMessage"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </td>

              <td>
                <Field
                  v-slot="{ value, handleChange, handleBlur, errorMessage }"
                  :name="`variants[${index}].available_quantity`"
                >
                  <BaseTextField
                    :model-value="value"
                    :placeholder="UI_STRINGS.PRODUCTS.FORM.VARIANT_AVAILABLE_PLACEHOLDER"
                    density="compact"
                    type="number"
                    :error-messages="errorMessage"
                    @update:model-value="handleChange($event === '' ? undefined : Number($event))"
                    @blur="handleBlur"
                  />
                </Field>
              </td>

              <td>
                <Field
                  v-slot="{ value, handleChange, handleBlur, errorMessage }"
                  :name="`variants[${index}].on_hand_quantity`"
                >
                  <BaseTextField
                    :model-value="value"
                    :placeholder="UI_STRINGS.PRODUCTS.FORM.VARIANT_ON_HAND_PLACEHOLDER"
                    density="compact"
                    type="number"
                    :error-messages="errorMessage"
                    @update:model-value="handleChange($event === '' ? undefined : Number($event))"
                    @blur="handleBlur"
                  />
                </Field>
              </td>

              <td>
                <Field
                  v-slot="{ value, handleChange, errorMessage }"
                  :name="`variants[${index}].status`"
                >
                  <BaseSelect
                    :model-value="value"
                    :items="statusOptions"
                    density="compact"
                    :error-messages="errorMessage"
                    @update:model-value="handleChange"
                  />
                </Field>
              </td>

              <td class="variant-images-cell">
                <div class="d-flex flex-wrap ga-1 mb-2">
                  <VImg
                    v-for="(image, imageIndex) in entry.value.product_variant_image"
                    :key="`${entry.key}-${imageIndex}`"
                    :src="image"
                    width="38"
                    height="38"
                    cover
                    rounded
                  />
                </div>

                <VFileInput
                  accept="image/*"
                  prepend-icon="mdi-image-plus-outline"
                  hide-input
                  :model-value="null"
                  :aria-label="`${UI_STRINGS.PRODUCTS.FORM.UPLOAD_VARIANT_IMAGE} ${index + 1}`"
                  :error-messages="imageErrors[index]"
                  hide-details="auto"
                  :loading="imageUploadingIndex === index"
                  :disabled="imageUploadingIndex !== null"
                  @update:model-value="handleImageChange(index, $event)"
                />
              </td>

              <td>
                <VBtn
                  icon="mdi-delete-outline"
                  color="error"
                  variant="text"
                  size="small"
                  :disabled="fields.length === 1"
                  :aria-label="`${UI_STRINGS.PRODUCTS.FORM.REMOVE_VARIANT} ${index + 1}`"
                  @click="removeVariant(index)"
                />
              </td>
            </tr>
          </tbody>
        </VTable>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.variant-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.variant-table {
  min-width: 1250px;
}

.variant-table th {
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  color: #777281;
}

.variant-table td {
  min-width: 130px;
  padding: 12px 8px;
  vertical-align: top;
}

.variant-images-cell {
  min-width: 190px !important;
}
</style>
