<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useForm } from "vee-validate";
import {
  VCard,
  VCardText,
  VChip,
  VCol,
  VContainer,
  VProgressLinear,
  VRow,
  VSnackbar,
  VSpacer,
} from "vuetify/components";

import { useAuthStore } from "../../store/auth.store";
import { useProductStore } from "../../store/product.store";
import { useAttributeSetStore } from "../../store/attribute-set.store";

import type {
  Attribute,
  AttributeSet,
  Product,
  ProductPayload,
  VariantPayload,
} from "../../store/common.types";

import {
  productInformationSchema,
  productFormSchema,
} from "../../utils/validations/product.validation";
import ProductInformationStep from "../../components/product/ProductInformationStep.vue";
import ProductVariantsStep from "../../components/product/ProductVariantsStep.vue";
import { UI_STRINGS } from "../../utils/constants";
import BaseButton from "../../components/common/BaseButton.vue";

interface ProductFormValues {
  title: string;
  description: string;
  status: "active" | "inactive";
  product_image: string;
  meta_title: string;
  meta_key: string;
  meta_description: string;
  attribute_set: AttributeSet | null;
  variants: VariantPayload[];
  variantAttributes: Attribute[];
}

const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();
const productStore = useProductStore();
const attributeSetStore = useAttributeSetStore();

const productId = computed(() => {
  const id = Number(route.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
});

const isEditMode = computed(() => productId.value !== null);

const pageTitle = computed(() =>
  isEditMode.value ? UI_STRINGS.PRODUCTS.EDIT_FORM_TITLE : UI_STRINGS.PRODUCTS.ADD_FORM_TITLE,
);

const vendorName = computed(() => authStore.user?.name ?? "");

const initialValues: ProductFormValues = {
  title: "",
  description: "",
  status: "active",
  product_image: "",
  meta_title: "",
  meta_key: "",
  meta_description: "",
  attribute_set: null,
  variants: [],
  variantAttributes: [],
};
const currentStep = ref(1);

const { values, errors, setFieldValue, resetForm, validate, handleSubmit } =
  useForm<ProductFormValues>({
    initialValues,
    keepValuesOnUnmount: true,
    validationSchema: computed(() =>
      currentStep.value === 1 ? productInformationSchema : productFormSchema,
    ),
  });
const snackbar = ref({
  show: false,
  message: "",
  color: "error" as "success" | "error",
});

const isPageLoading = ref(false);

const attributeSets = computed(() =>
  attributeSetStore.attributeSets.filter((attributeSet) => attributeSet.status === "active"),
);

const productImage = computed(() => values.product_image);
const imageUploadingIndex = ref<number | null>(null);

function notify(message: string, color: "success" | "error" = "error") {
  snackbar.value = {
    show: true,
    message,
    color,
  };
}

function mapProductToForm(product: Product): ProductFormValues {
  const selectedAttributeSet =
    attributeSetStore.attributeSets.find((item) => item.id === product.attribute_set?.id) ?? null;

  return {
    title: product.title ?? "",
    description: product.description ?? "",
    status: product.status ?? "active",
    product_image: product.product_image ?? "",
    meta_title: product.meta_title ?? "",
    meta_key: product.meta_key ?? "",
    meta_description: product.meta_description ?? "",
    attribute_set: selectedAttributeSet,
    variants: product.variants ?? [],
    variantAttributes: product.variantAttributes ?? [],
  };
}

async function loadFormData() {
  isPageLoading.value = true;

  try {
    await attributeSetStore.fetchAttributeSets();

    if (isEditMode.value && productId.value !== null) {
      await productStore.fetchSingleProduct(productId.value);

      if (!productStore.product) {
        throw new Error(UI_STRINGS.PRODUCTS.FORM.PRODUCT_DETAILS_MISSING);
      }

      resetForm({
        values: mapProductToForm(productStore.product),
      });
    } else {
      resetForm({
        values: { ...initialValues },
      });
    }
  } catch (error: unknown) {
    notify(error instanceof Error ? error.message : UI_STRINGS.PRODUCTS.FORM.PRODUCT_LOAD_ERROR);
  } finally {
    isPageLoading.value = false;
  }
}

async function handleImageUpload(file: File) {
  try {
    const uploadedFiles = await productStore.uploadFile(file);
    const uploadedImage = uploadedFiles[0];

    if (!uploadedImage?.url) {
      throw new Error(UI_STRINGS.PRODUCTS.FORM.PRODUCT_IMAGE_URL_ERROR);
    }

    setFieldValue("product_image", uploadedImage.url);
    notify(UI_STRINGS.PRODUCTS.FORM.PRODUCT_IMAGE_UPLOAD_SUCCESS, "success");
  } catch (error: unknown) {
    notify(
      error instanceof Error ? error.message : UI_STRINGS.PRODUCTS.FORM.PRODUCT_IMAGE_UPLOAD_ERROR,
    );
  }
}

async function handleVariantImageUpload(index: number, file: File) {
  imageUploadingIndex.value = index;

  try {
    const uploadedFiles = await productStore.uploadFile(file);
    const uploadedImage = uploadedFiles[0];

    if (!uploadedImage?.url) {
      throw new Error(UI_STRINGS.PRODUCTS.FORM.VARIANT_IMAGE_URL_ERROR);
    }

    const currentVariant = values.variants[index];
    if (!currentVariant) {
      throw new Error(UI_STRINGS.PRODUCTS.VARIANT_NOT_FOUND);
    }

    setFieldValue(
      "variants",
      values.variants.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              product_variant_image: [...currentVariant.product_variant_image, uploadedImage.url],
            }
          : variant,
      ),
    );

    notify(UI_STRINGS.PRODUCTS.FORM.VARIANT_IMAGE_UPLOAD_SUCCESS, "success");
  } catch (error: unknown) {
    notify(
      error instanceof Error ? error.message : UI_STRINGS.PRODUCTS.FORM.VARIANT_IMAGE_UPLOAD_ERROR,
    );
  } finally {
    imageUploadingIndex.value = null;
  }
}

function handleAttributeSetChange(attributeSet: AttributeSet | null) {
  setFieldValue("variantAttributes", attributeSet?.attributes ?? []);

  // Variant rows will be handled in Step 2.
  if (!attributeSet) {
    setFieldValue("variants", []);
  }
}

async function goToNextStep() {
  const result = await validate();

  if (!result.valid) return;

  if (!authStore.user) {
    notify(UI_STRINGS.PRODUCTS.FORM.VENDOR_REQUIRED);
    return;
  }

  const vendorId = Number(authStore.user.id);

  if (!Number.isSafeInteger(vendorId) || vendorId <= 0) {
    notify(UI_STRINGS.PRODUCTS.FORM.INVALID_VENDOR_ID);
    return;
  }

  informationCompleted.value = true;
  currentStep.value = 2;
}

const informationCompleted = ref(false);

async function navigateToStep(step: 1 | 2) {
  if (step === 1) {
    currentStep.value = 1;
    return;
  }

  if (isEditMode.value) {
    currentStep.value = 2;
    return;
  }

  if (!informationCompleted.value) {
    await goToNextStep();
    return;
  }

  await goToNextStep();
}

function goToPreviousStep() {
  currentStep.value = 1;
}

const submitProduct = handleSubmit(async (formValues) => {
  if (!authStore.user || !formValues.attribute_set) {
    notify(UI_STRINGS.PRODUCTS.FORM.PRODUCT_INFO_REQUIRED);
    currentStep.value = 1;
    return;
  }

  const vendorId = Number(authStore.user.id);

  if (!Number.isSafeInteger(vendorId) || vendorId <= 0) {
    notify(UI_STRINGS.PRODUCTS.FORM.INVALID_VENDOR_ID);
    return;
  }

  const payload: ProductPayload = {
    title: formValues.title,
    status: formValues.status,
    description: formValues.description,
    product_image: formValues.product_image,
    meta_title: formValues.meta_title,
    meta_key: formValues.meta_key,
    meta_description: formValues.meta_description,

    auth_vendor_id: Number(authStore.user?.id),
    attribute_set_id: Number(formValues.attribute_set.id),

    variants: formValues.variants.map((variant) => ({
      ...variant,
      product_variant_image: variant.product_variant_image,
    })),

    variantAttributes: formValues.variantAttributes,
  };

  try {
    if (isEditMode.value && productId.value !== null) {
      await productStore.updateProduct(productId.value, payload);
      notify(UI_STRINGS.PRODUCTS.FORM.PRODUCT_UPDATE_SUCCESS, "success");
    } else {
      await productStore.createProduct(payload);
      notify(UI_STRINGS.PRODUCTS.FORM.PRODUCT_CREATE_SUCCESS, "success");
    }

    await router.push("/products");
  } catch {
    notify(productStore.error || UI_STRINGS.PRODUCTS.FORM.PRODUCT_SAVE_ERROR, "error");
  }
});

watch(
  () => values.attribute_set,
  (attributeSet) => {
    setFieldValue("variantAttributes", attributeSet?.attributes ?? []);
  },
);

onMounted(() => {
  void loadFormData();
});

onBeforeUnmount(() => {
  productStore.clearError();

  if (isEditMode.value) {
    productStore.clearProduct();
  }
});
</script>

<template>
  <VContainer fluid class="pa-4 pa-md-6">
    <VRow align="center" class="mb-5">
      <VCol cols="12" sm="7">
        <h1 class="text-h5 font-weight-bold">
          {{ pageTitle }}
        </h1>

        <p class="text-body-2 text-medium-emphasis">
          {{ UI_STRINGS.PRODUCTS.FORM.DESCRIPTION }}
        </p>
      </VCol>

      <VCol cols="12" sm="5" class="d-flex justify-sm-end">
        <BaseButton
          :block="false"
          variant="outlined"
          color="secondary"
          @click="router.push('/products')"
        >
          {{ UI_STRINGS.PRODUCTS.FORM.CANCEL }}
        </BaseButton>
      </VCol>
    </VRow>

    <VProgressLinear v-if="isPageLoading" indeterminate color="primary" class="mb-4" />

    <template v-else>
      <VCard rounded="lg" class="mb-5">
        <VCardText class="pa-4">
          <div class="d-flex align-center ga-3 flex-wrap">
            <BaseButton
              variant="text"
              :block="false"
              class="text-none"
              height="auto"
              :aria-current="currentStep === 1 ? 'step' : undefined"
              @click="navigateToStep(1)"
            >
              <VChip :color="currentStep === 1 ? 'primary' : 'success'" variant="flat" class="mr-3">
                1
              </VChip>
              <span class="text-left">
                <span class="d-block text-body-1 font-weight-medium">
                  {{ UI_STRINGS.PRODUCTS.FORM.STEP_INFORMATION }}
                </span>
                <span class="d-block text-caption text-medium-emphasis">
                  {{ UI_STRINGS.PRODUCTS.FORM.STEP_INFORMATION_DESCRIPTION }}
                </span>
              </span>
            </BaseButton>

            <VSpacer />

            <BaseButton
              variant="text"
              class="text-none"
              height="auto"
              :block="false"
              :disabled="!isEditMode && !informationCompleted && currentStep !== 2"
              :aria-current="currentStep === 2 ? 'step' : undefined"
              @click="navigateToStep(2)"
            >
              <VChip
                :color="currentStep === 2 ? 'primary' : 'default'"
                variant="tonal"
                class="mr-3"
              >
                2
              </VChip>
              <span class="text-left">
                <span class="d-block text-body-1 font-weight-medium">
                  {{ UI_STRINGS.PRODUCTS.FORM.STEP_VARIANTS }}
                </span>
                <span class="d-block text-caption text-medium-emphasis">
                  {{ UI_STRINGS.PRODUCTS.FORM.STEP_VARIANTS_DESCRIPTION }}
                </span>
              </span>
            </BaseButton>
          </div>
        </VCardText>
      </VCard>

      <ProductInformationStep
        v-if="currentStep === 1"
        :attribute-sets="attributeSets"
        :image-uploading="productStore.loading.uploadFile"
        :vendor-name="vendorName"
        :product-image="productImage"
        :product-image-error="errors.product_image"
        @upload="handleImageUpload"
        @attribute-set-change="handleAttributeSetChange"
      />
      <ProductVariantsStep
        v-if="currentStep === 2"
        :image-uploading-index="imageUploadingIndex"
        @upload-image="handleVariantImageUpload"
      />

      <div class="d-flex justify-space-between mt-5">
        <BaseButton
          :block="false"
          variant="outlined"
          :disabled="currentStep === 1"
          @click="goToPreviousStep"
        >
          {{ UI_STRINGS.PRODUCTS.FORM.BACK }}
        </BaseButton>

        <BaseButton
          v-if="currentStep === 1"
          :block="false"
          color="primary"
          variant="flat"
          :disabled="productStore.loading.uploadFile"
          @click="goToNextStep"
        >
          {{ UI_STRINGS.PRODUCTS.FORM.CONTINUE }}
        </BaseButton>
        <BaseButton
          v-else
          :block="false"
          color="primary"
          variant="flat"
          :loading="productStore.loading.createProduct || productStore.loading.updateProduct"
          @click="submitProduct"
        >
          {{ isEditMode ? UI_STRINGS.PRODUCTS.FORM.UPDATE : UI_STRINGS.PRODUCTS.FORM.CREATE }}
        </BaseButton>
      </div>
    </template>

    <VSnackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </VSnackbar>
  </VContainer>
</template>
