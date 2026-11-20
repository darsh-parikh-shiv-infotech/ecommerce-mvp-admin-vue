<script setup lang="ts">
import { computed, ref } from "vue";
import BaseButton from "../../components/common/BaseButton.vue";
import type { BaseTableHeader } from "../../components/common/BaseTable.vue";
import { useProductStore } from "../../store/product.store";
import { ROUTE_NAMES, UI_STRINGS } from "../../utils/constants.ts";
import { getPlaceholder } from "../../utils/placeholder.utils.ts";
import { VChip, VIcon, VImg, VSnackbar } from "vuetify/components";
import { useServerTable } from "../../utils/composables/useServerTable.ts";
import BaseTextField from "../../components/common/BaseTextField.vue";
import BaseTable from "../../components/common/BaseTable.vue";
import { formatDate } from "../../utils/common.utils.ts";
import { useRouter } from "vue-router";

const store = useProductStore();
const itemSlots = {
  image: "item.product_image",
  status: "item.status",
  createdAt: "item.createdAt",
  actions: "item.actions",
};
const headers: BaseTableHeader[] = [
  { title: UI_STRINGS.PRODUCTS.TABLE_HEADERS.ID, key: "id" },
  { title: UI_STRINGS.PRODUCTS.TABLE_HEADERS.TITLE, key: "title" },
  {
    title: UI_STRINGS.PRODUCTS.TABLE_HEADERS.IMAGE,
    key: "product_image",
    minWidth: 110,
  },
  {
    title: UI_STRINGS.PRODUCTS.TABLE_HEADERS.ATTRIBUTE_SET,
    key: "attribute_set.name",
    minWidth: 110,
  },
  {
    title: UI_STRINGS.PRODUCTS.TABLE_HEADERS.VENDOR,
    key: "vendor.full_name",
    minWidth: 110,
  },
  {
    title: UI_STRINGS.PRODUCTS.TABLE_HEADERS.STATUS,
    key: "status",
    minWidth: 110,
  },
  {
    title: UI_STRINGS.PRODUCTS.TABLE_HEADERS.CREATED,
    key: "createdAt",
    minWidth: 130,
  },
  {
    title: UI_STRINGS.PRODUCTS.TABLE_HEADERS.ACTIONS,
    key: "actions",
    align: "end",
    sortable: false,
  },
];
const router = useRouter();
const showSnackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref<"success" | "error">("success");

const products = computed(() => store.products);
const pagination = computed(() => store.pagination);
const { search, handleOptions: handleTableOptions } = useServerTable(
  (params) => store.fetchProducts(params),
  () => notify(store.error || UI_STRINGS.PRODUCTS.FETCH_ERROR, "error"),
);

function notify(message: string, color: "success" | "error" = "success") {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  showSnackbar.value = true;
}

function viewProduct(id: number) {
  void router.push({ name: ROUTE_NAMES.PRODUCT_DETAIL, params: { id } });
}
function editProduct(id: number) {
  void router.push({ name: ROUTE_NAMES.PRODUCT_EDIT, params: { id } });
}
function addProduct() {
  void router.push({ name: ROUTE_NAMES.PRODUCT_CREATE });
}
</script>
<template>
  <section class="product-page d-flex flex-column ga-6">
    <header class="d-flex flex-wrap align-center justify-space-between ga-4">
      <div>
        <h1 class="page-title">
          {{ UI_STRINGS.PRODUCTS.TITLE }}
        </h1>

        <p class="page-description mt-1">
          {{ UI_STRINGS.PRODUCTS.DESCRIPTION }}
        </p>
      </div>

      <BaseButton size="small" :block="false" @click="addProduct()">
        <v-icon icon="mdi-plus" size="18" class="mr-2" />
        {{ UI_STRINGS.PRODUCTS.ADD }}
      </BaseButton>
    </header>

    <div class="filter-panel d-flex flex-wrap align-center ga-3 pa-4">
      <BaseTextField
        v-model="search"
        :label="UI_STRINGS.PRODUCTS.SEARCH_LABEL"
        :placeholder="getPlaceholder(UI_STRINGS.PRODUCTS.SEARCH_LABEL)"
        prepend-inner-icon="mdi-magnify"
        hide-details
        density="compact"
        class="search-field"
        :loading="store.loading.fetchProducts"
      />
    </div>

    <div class="table-panel">
      <BaseTable
        :headers="headers"
        :loading="store.loading.fetchProducts"
        :items="products"
        :page="pagination.currentPage"
        :items-per-page="pagination.pageSize"
        :min-width="1280"
        :total-items="pagination.totalItems"
        :empty-text="UI_STRINGS.PRODUCTS.EMPTY_TITLE"
        @update:options="handleTableOptions"
      >
        <template #[itemSlots.image]="{ item }">
          <v-img
            v-if="item.product_image"
            :src="`${item.product_image}`"
            :alt="`${item.title} product image`"
            width="48"
            height="48"
            cover
            rounded="lg"
          >
            <template #placeholder>
              <div class="fill-height d-flex align-center justify-center bg-grey-lighten-4">
                <v-icon icon="mdi-image-outline" color="medium-emphasis" />
              </div>
            </template>

            <template #error>
              <div class="fill-height d-flex align-center justify-center bg-grey-lighten-4">
                <v-icon icon="mdi-image-off-outline" color="medium-emphasis" />
              </div>
            </template>
          </v-img>

          <div
            v-else
            class="product-image-placeholder d-flex align-center justify-center rounded-lg bg-grey-lighten-4"
            role="img"
            :aria-label="`${item.title} has no product image`"
          >
            <v-icon icon="mdi-image-outline" color="medium-emphasis" />
          </div>
        </template>

        <template #[itemSlots.status]="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="item.status === 'active' ? 'success' : 'warning'"
          >
            {{ item.status === "active" ? UI_STRINGS.COMMON.ACTIVE : UI_STRINGS.COMMON.INACTIVE }}
          </v-chip>
        </template>

        <template #[itemSlots.createdAt]="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template #[itemSlots.actions]="{ item }">
          <div class="d-flex justify-end ga-1">
            <BaseButton
              icon
              size="small"
              variant="text"
              :block="false"
              :aria-label="`${UI_STRINGS.PRODUCTS.VIEW_ACTION} ${item.title}`"
              @click="viewProduct(item.id)"
            >
              <v-icon icon="mdi-eye-outline" />
            </BaseButton>

            <BaseButton
              icon
              size="small"
              variant="text"
              :block="false"
              :aria-label="`${UI_STRINGS.COMMON.EDIT} ${item.title}`"
              @click="editProduct(item.id)"
            >
              <v-icon icon="mdi-pencil-outline" />
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </div>

    <VSnackbar v-model="showSnackbar" :color="snackbarColor" location="top end" :timeout="3500">
      {{ snackbarMessage }}
    </VSnackbar>
  </section>
</template>

<style scoped>
.product-image-placeholder {
  width: 48px;
  height: 48px;
}
</style>
