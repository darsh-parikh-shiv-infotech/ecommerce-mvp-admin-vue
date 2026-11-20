<script setup lang="ts">
import { ref } from "vue";
import { useField } from "vee-validate";
import { VCard, VCardText, VCol, VFileInput, VImg, VRow, VTextField } from "vuetify/components";
import type { AttributeSet } from "../../store/common.types";
import BaseTextField from "../common/BaseTextField.vue";
import BaseTextarea from "../common/BaseTextarea.vue";
import BaseSelect from "../common/BaseSelect.vue";
import { UI_STRINGS } from "../../utils/constants";

defineProps<{
  attributeSets: AttributeSet[];
  imageUploading: boolean;
  vendorName: string;
  productImage: string;
  productImageError?: string;
}>();

const emit = defineEmits<{
  upload: [file: File];
}>();

const { value: title, errorMessage: titleError } = useField<string>("title");

const { value: description, errorMessage: descriptionError } = useField<string>("description");

const { value: status } = useField<"active" | "inactive">("status");

const { value: attributeSet, errorMessage: attributeSetError } = useField<AttributeSet | null>(
  "attribute_set",
);

const { value: metaTitle, errorMessage: metaTitleError } = useField<string>("meta_title");

const { value: metaKey, errorMessage: metaKeyError } = useField<string>("meta_key");

const { value: metaDescription, errorMessage: metaDescriptionError } =
  useField<string>("meta_description");

const selectedFile = ref<File | null>(null);
const fileError = ref<string | null>(null);

function handleFileChange(file: File | File[] | null) {
  const selected = Array.isArray(file) ? file[0] : file;
  if (!selected) {
    fileError.value = null;
    return;
  }

  if (!selected.type.startsWith("image/")) {
    selectedFile.value = null;
    fileError.value = UI_STRINGS.PRODUCTS.FORM.INVALID_IMAGE_TYPE;
    return;
  }

  fileError.value = null;
  emit("upload", selected);
  selectedFile.value = null;
}
</script>

<template>
  <VRow>
    <VCol cols="12" lg="8">
      <VCard rounded="lg" class="h-100">
        <VCardText class="pa-5">
          <h3 class="text-h6 font-weight-bold mb-4">
            {{ UI_STRINGS.PRODUCTS.FORM.BASIC_INFORMATION }}
          </h3>

          <VRow>
            <VCol cols="12">
              <BaseTextField
                v-model="title"
                :label="UI_STRINGS.PRODUCTS.FORM.PRODUCT_TITLE"
                :placeholder="UI_STRINGS.PRODUCTS.FORM.PRODUCT_TITLE_PLACEHOLDER"
                :error-messages="titleError"
                required
              />
            </VCol>

            <VCol cols="12">
              <BaseTextarea
                v-model="description"
                :label="UI_STRINGS.PRODUCTS.FORM.DESCRIPTION_LABEL"
                :placeholder="UI_STRINGS.PRODUCTS.FORM.DESCRIPTION_PLACEHOLDER"
                rows="4"
                auto-grow
                :error-messages="descriptionError"
              />
            </VCol>

            <VCol cols="12" sm="6">
              <BaseSelect
                v-model="status"
                :label="UI_STRINGS.PRODUCTS.FORM.PRODUCT_STATUS"
                :items="[
                  { title: UI_STRINGS.COMMON.ACTIVE, value: 'active' },
                  { title: UI_STRINGS.COMMON.INACTIVE, value: 'inactive' },
                ]"
              />
            </VCol>

            <VCol cols="12" sm="6">
              <VTextField
                :model-value="vendorName"
                :label="UI_STRINGS.PRODUCTS.VENDOR"
                variant="outlined"
                density="comfortable"
                readonly
                hide-details
              />
            </VCol>

            <VCol cols="12">
              <BaseSelect
                v-model="attributeSet"
                :items="attributeSets"
                item-title="name"
                return-object
                :label="UI_STRINGS.PRODUCTS.ATTRIBUTE_SET"
                :placeholder="UI_STRINGS.PRODUCTS.FORM.SELECT_ATTRIBUTE_SET"
                :error-messages="attributeSetError"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12" lg="4">
      <VCard rounded="lg" class="mb-5">
        <VCardText class="pa-5">
          <h3 class="text-h6 font-weight-bold mb-4">
            {{ UI_STRINGS.PRODUCTS.FORM.PRODUCT_IMAGE }}
          </h3>

          <VImg
            v-if="productImage"
            :src="productImage"
            aspect-ratio="1"
            max-height="220"
            cover
            rounded="lg"
            class="mb-4"
          />

          <VFileInput
            v-model="selectedFile"
            hide-input
            accept="image/*"
            prepend-icon="mdi-image-plus-outline"
            clearable
            hide-details="auto"
            :loading="imageUploading"
            :disabled="imageUploading"
            :aria-label="UI_STRINGS.PRODUCTS.FORM.UPLOAD_PRODUCT_IMAGE"
            :error-messages="productImageError || fileError"
            @update:model-value="handleFileChange"
          />

          <p class="text-caption text-medium-emphasis mt-2">
            {{ UI_STRINGS.PRODUCTS.FORM.PRODUCT_IMAGE_HELP }}
          </p>
        </VCardText>
      </VCard>

      <VCard rounded="lg">
        <VCardText class="pa-5">
          <h3 class="text-h6 font-weight-bold mb-4">
            {{ UI_STRINGS.PRODUCTS.FORM.SEO_METADATA }}
          </h3>

          <VRow>
            <VCol cols="12">
              <BaseTextField
                v-model="metaTitle"
                :label="UI_STRINGS.PRODUCTS.FORM.META_TITLE"
                :placeholder="UI_STRINGS.PRODUCTS.FORM.META_TITLE_PLACEHOLDER"
                :error-messages="metaTitleError"
              />
            </VCol>

            <VCol cols="12">
              <BaseTextField
                v-model="metaKey"
                :label="UI_STRINGS.PRODUCTS.FORM.META_KEYWORDS"
                :placeholder="UI_STRINGS.PRODUCTS.FORM.META_KEYWORDS_PLACEHOLDER"
                :error-messages="metaKeyError"
              />
            </VCol>

            <VCol cols="12">
              <BaseTextarea
                v-model="metaDescription"
                :label="UI_STRINGS.PRODUCTS.FORM.META_DESCRIPTION"
                :placeholder="UI_STRINGS.PRODUCTS.FORM.META_DESCRIPTION_PLACEHOLDER"
                rows="3"
                auto-grow
                :error-messages="metaDescriptionError"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
