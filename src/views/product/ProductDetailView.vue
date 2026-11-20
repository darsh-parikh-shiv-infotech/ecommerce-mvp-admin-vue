<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  VAlert,
  VCard,
  VCardText,
  VChip,
  VCol,
  VContainer,
  VDataTable,
  VDialog,
  VIcon,
  VImg,
  VProgressLinear,
  VRow,
  VSnackbar,
} from "vuetify/components";
import BaseButton from "../../components/common/BaseButton.vue";
import { useProductStore } from "../../store/product.store";
import type { Variant } from "../../store/common.types";
import { COMMON_MESSAGES, ROUTE_NAMES, UI_STRINGS } from "../../utils/constants";
import { formatDate } from "../../utils/common.utils";

const route = useRoute();
const router = useRouter();
const store = useProductStore();

const product = computed(() => store.product);
const loading = computed(() => store.loading.fetchSingleProduct);
const productId = computed(() => Number(route.params.id));
const loadError = ref<string | null>(null);
const deletingVariantId = ref<number | null>(null);
const selectedVariant = ref<Variant | null>(null);
const showDeleteDialog = ref(false);
let viewRequestSequence = 0;

const snackbar = ref({
  show: false,
  message: "",
  color: "success" as "success" | "error",
});

const variantSlots = {
  fakePrice: "item.fake_price",
  status: "item.status",
  actions: "item.actions",
};

const variantHeaders = [
  { title: UI_STRINGS.PRODUCTS.VARIANT_HEADERS.ID, key: "id" },
  { title: UI_STRINGS.PRODUCTS.VARIANT_HEADERS.TITLE, key: "title", minWidth: 150 },
  { title: UI_STRINGS.PRODUCTS.VARIANT_HEADERS.CODE, key: "code" },
  { title: UI_STRINGS.PRODUCTS.VARIANT_HEADERS.PRICE, key: "price" },
  { title: UI_STRINGS.PRODUCTS.VARIANT_HEADERS.FAKE_PRICE, key: "fake_price" },
  {
    title: UI_STRINGS.PRODUCTS.VARIANT_HEADERS.AVAILABLE,
    key: "available_quantity",
  },
  { title: UI_STRINGS.PRODUCTS.VARIANT_HEADERS.ON_HAND, key: "on_hand_quantity" },
  { title: UI_STRINGS.PRODUCTS.VARIANT_HEADERS.STATUS, key: "status" },
  {
    title: UI_STRINGS.PRODUCTS.VARIANT_HEADERS.ACTIONS,
    key: "actions",
    sortable: false,
    align: "end" as const,
  },
];

function notify(message: string, color: "success" | "error" = "success") {
  snackbar.value = { show: true, message, color };
}

function goToProducts() {
  void router.push({ name: ROUTE_NAMES.PRODUCTS });
}

function openDeleteDialog(variant: Variant) {
  selectedVariant.value = variant;
  showDeleteDialog.value = true;
}

function closeDeleteDialog() {
  if (deletingVariantId.value !== null) return;

  showDeleteDialog.value = false;
  selectedVariant.value = null;
}

async function confirmDeleteVariant() {
  const variant = selectedVariant.value;
  if (!variant || deletingVariantId.value !== null) return;

  deletingVariantId.value = variant.id;

  try {
    await store.deleteVariant(variant.id);
    notify(UI_STRINGS.PRODUCTS.VARIANT_DELETED_SUCCESS);
    showDeleteDialog.value = false;
    selectedVariant.value = null;
  } catch {
    notify(store.error || COMMON_MESSAGES.ERROR.NETWORK, "error");
  } finally {
    deletingVariantId.value = null;
  }
}

async function fetchProduct(id: number) {
  const requestSequence = ++viewRequestSequence;
  loadError.value = null;
  store.clearProduct();

  if (!Number.isSafeInteger(id) || id <= 0) {
    loadError.value = UI_STRINGS.PRODUCTS.INVALID_PRODUCT_ID;
    void router.replace({ name: ROUTE_NAMES.PRODUCTS });
    return;
  }

  try {
    await store.fetchSingleProduct(id);
  } catch {
    if (requestSequence === viewRequestSequence) {
      loadError.value = store.error || UI_STRINGS.PRODUCTS.DETAIL_FETCH_ERROR;
    }
  }
}

watch(productId, (id) => void fetchProduct(id), { immediate: true });

onBeforeUnmount(() => {
  viewRequestSequence += 1;
  store.clearProduct();
});
</script>

<template>
  <VContainer fluid class="pa-4 pa-md-6">
    <VRow align="center" class="mb-5">
      <VCol cols="12">
        <div class="d-flex align-center ga-3">
          <BaseButton
            icon
            variant="text"
            size="small"
            :block="false"
            :aria-label="UI_STRINGS.PRODUCTS.BACK_TO_PRODUCTS"
            @click="goToProducts"
          >
            <VIcon icon="mdi-arrow-left" />
          </BaseButton>

          <div>
            <h1 class="text-h5 font-weight-bold">
              {{ UI_STRINGS.PRODUCTS.DETAIL_TITLE }}
            </h1>
            <p class="text-body-2 text-medium-emphasis">
              {{ UI_STRINGS.PRODUCTS.DETAIL_DESCRIPTION }}
            </p>
          </div>
        </div>
      </VCol>
    </VRow>

    <VProgressLinear v-if="loading" indeterminate color="primary" class="mb-4" />

    <template v-else-if="loadError">
      <VAlert type="error" variant="tonal" class="mb-4">
        {{ loadError }}
      </VAlert>

      <div class="d-flex flex-wrap ga-2">
        <BaseButton :block="false" @click="fetchProduct(productId)">
          {{ UI_STRINGS.COMMON.RETRY }}
        </BaseButton>
        <BaseButton variant="outlined" :block="false" @click="goToProducts">
          {{ UI_STRINGS.PRODUCTS.BACK_TO_PRODUCTS }}
        </BaseButton>
      </div>
    </template>

    <template v-else-if="product">
      <VCard rounded="lg" class="mb-5">
        <VCardText class="pa-4 pa-md-6">
          <VRow>
            <VCol cols="12" md="4" lg="3">
              <VImg
                v-if="product.product_image"
                :src="`${product.product_image}`"
                :alt="product.title"
                aspect-ratio="1"
                cover
                rounded="lg"
                class="product-detail-image"
              >
                <template #placeholder>
                  <div class="fill-height d-flex align-center justify-center">
                    <VIcon icon="mdi-image-outline" color="medium-emphasis" />
                  </div>
                </template>

                <template #error>
                  <div class="fill-height d-flex align-center justify-center">
                    <VIcon icon="mdi-image-off-outline" color="medium-emphasis" />
                  </div>
                </template>
              </VImg>

              <div
                v-else
                class="product-detail-image d-flex align-center justify-center rounded-lg"
                role="img"
                :aria-label="UI_STRINGS.PRODUCTS.NO_IMAGE"
              >
                <VIcon icon="mdi-image-outline" color="medium-emphasis" />
              </div>
            </VCol>

            <VCol cols="12" md="8" lg="9">
              <div class="d-flex align-center flex-wrap ga-3 mb-3">
                <h2 class="text-h5 font-weight-bold">
                  {{ product.title }}
                </h2>

                <VChip
                  :color="product.status === 'active' ? 'success' : 'warning'"
                  size="small"
                  variant="tonal"
                >
                  {{
                    product.status === "active"
                      ? UI_STRINGS.COMMON.ACTIVE
                      : UI_STRINGS.COMMON.INACTIVE
                  }}
                </VChip>
              </div>

              <p class="text-body-1 text-medium-emphasis mb-5">
                {{ product.description || UI_STRINGS.PRODUCTS.NO_DESCRIPTION }}
              </p>

              <VRow>
                <VCol cols="12" sm="6">
                  <div class="text-caption text-medium-emphasis">
                    {{ UI_STRINGS.PRODUCTS.PRODUCT_ID }}
                  </div>
                  <div class="text-body-1 font-weight-medium">{{ product.id }}</div>
                </VCol>

                <VCol cols="12" sm="6">
                  <div class="text-caption text-medium-emphasis">
                    {{ UI_STRINGS.PRODUCTS.VENDOR }}
                  </div>
                  <div class="text-body-1 font-weight-medium">
                    {{ product.vendor?.full_name || UI_STRINGS.PRODUCTS.EMPTY_VALUE }}
                  </div>
                </VCol>

                <VCol cols="12" sm="6">
                  <div class="text-caption text-medium-emphasis">
                    {{ UI_STRINGS.PRODUCTS.ATTRIBUTE_SET }}
                  </div>
                  <div class="text-body-1 font-weight-medium">
                    {{ product.attribute_set?.name || UI_STRINGS.PRODUCTS.EMPTY_VALUE }}
                  </div>
                </VCol>

                <VCol cols="12" sm="6">
                  <div class="text-caption text-medium-emphasis">
                    {{ UI_STRINGS.PRODUCTS.CREATED_AT }}
                  </div>
                  <div class="text-body-1 font-weight-medium">
                    {{ formatDate(product.createdAt) }}
                  </div>
                </VCol>
              </VRow>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <VCard rounded="lg">
        <VCardText class="pa-4 pa-md-6">
          <div class="d-flex align-center mb-4">
            <div>
              <h3 class="text-h6 font-weight-bold">{{ UI_STRINGS.PRODUCTS.VARIANT_TITLE }}</h3>
              <p class="text-body-2 text-medium-emphasis">
                {{ product.variants?.length || 0 }}
                {{
                  product.variants?.length === 1
                    ? UI_STRINGS.PRODUCTS.VARIANT_SINGULAR
                    : UI_STRINGS.PRODUCTS.VARIANT_PLURAL
                }}
              </p>
            </div>
          </div>

          <VDataTable
            :headers="variantHeaders"
            :items="product.variants || []"
            item-value="id"
            :items-per-page="10"
          >
            <template #[variantSlots.fakePrice]="{ item }">
              {{ item.fake_price || UI_STRINGS.PRODUCTS.EMPTY_VALUE }}
            </template>

            <template #[variantSlots.status]="{ item }">
              <VChip
                :color="item.status === 'active' ? 'success' : 'warning'"
                size="small"
                variant="tonal"
              >
                {{
                  item.status === "active" ? UI_STRINGS.COMMON.ACTIVE : UI_STRINGS.COMMON.INACTIVE
                }}
              </VChip>
            </template>

            <template #[variantSlots.actions]="{ item }">
              <BaseButton
                icon
                color="error"
                variant="text"
                size="small"
                :block="false"
                :loading="deletingVariantId === item.id"
                :disabled="deletingVariantId !== null"
                :aria-label="`${UI_STRINGS.PRODUCTS.DELETE_VARIANT_ACTION} ${item.title}`"
                @click="openDeleteDialog(item)"
              >
                <VIcon icon="mdi-delete-outline" />
              </BaseButton>
            </template>

            <template #no-data>
              <div class="pa-6 text-center text-medium-emphasis">
                {{ UI_STRINGS.PRODUCTS.NO_VARIANTS }}
              </div>
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </template>

    <VDialog v-model="showDeleteDialog" max-width="420" persistent>
      <VCard rounded="lg">
        <VCardText class="pa-5">
          <h3 class="text-h6 font-weight-bold mb-2">
            {{ UI_STRINGS.PRODUCTS.DELETE_VARIANT_TITLE }}
          </h3>

          <p class="text-body-2 text-medium-emphasis">
            {{ UI_STRINGS.PRODUCTS.DELETE_VARIANT_CONFIRMATION }}
            <strong>{{ selectedVariant?.title }}</strong
            >{{ UI_STRINGS.PRODUCTS.DELETE_VARIANT_CONFIRMATION_END }}
          </p>
          <p class="text-body-2 text-medium-emphasis mt-2">
            {{ UI_STRINGS.PRODUCTS.DELETE_VARIANT_WARNING }}
          </p>
        </VCardText>

        <VCardText class="d-flex justify-end ga-2 pt-0">
          <BaseButton
            variant="text"
            size="small"
            :block="false"
            :disabled="deletingVariantId !== null"
            @click="closeDeleteDialog"
          >
            {{ UI_STRINGS.COMMON.CANCEL }}
          </BaseButton>

          <BaseButton
            color="error"
            size="small"
            :block="false"
            :loading="deletingVariantId !== null"
            @click="confirmDeleteVariant"
          >
            {{ UI_STRINGS.COMMON.DELETE }}
          </BaseButton>
        </VCardText>
      </VCard>
    </VDialog>

    <VSnackbar v-model="snackbar.show" :color="snackbar.color" location="top end" timeout="3000">
      {{ snackbar.message }}
    </VSnackbar>
  </VContainer>
</template>

<style scoped>
.product-detail-image {
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1;
  background: rgb(var(--v-theme-surface-variant));
}
</style>
