<script setup lang="ts">
import { VDataTableServer } from "vuetify/components";
import { PAGINATION_CONFIG } from "../../utils/constants";

export interface BaseTableHeader {
  title: string;
  key: string;
  align?: "start" | "center" | "end";
  sortable?: boolean;
  width?: string | number;
  minWidth?: string | number;
}

withDefaults(
  defineProps<{
    headers: BaseTableHeader[];
    items: object[];
    loading?: boolean;
    page?: number;
    itemsPerPage?: number;
    totalItems: number;
    itemValue?: string;
    emptyText?: string;
    hideFooter?: boolean;
    itemsPerPageOptions?: number[];
  }>(),
  {
    loading: false,
    page: 1,
    itemsPerPage: 10,
    itemValue: "id",
    emptyText: "No records found.",
    hideFooter: false,
    itemsPerPageOptions: () => [...PAGINATION_CONFIG.ITEMS_PER_PAGE_OPTIONS],
  },
);

const emit = defineEmits<{
  "update:page": [page: number];
  "update:itemsPerPage": [limit: number];
  "update:options": [
    options: {
      page: number;
      itemsPerPage: number;
      sortBy: { key: string; order: "asc" | "desc" }[];
    },
  ];
}>();
</script>

<template>
  <div class="base-table">
    <v-data-table-server
      :headers="headers"
      :items="items"
      :loading="loading"
      :page="page"
      :items-per-page="itemsPerPage"
      :items-length="totalItems"
      :item-value="itemValue"
      :hide-default-footer="hideFooter"
      :loading-text="'Loading records...'"
      :no-data-text="emptyText"
      class="base-data-table"
      :items-per-page-options="itemsPerPageOptions"
      @update:options="emit('update:options', $event)"
    >
      <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps ?? {}" />
      </template>
    </v-data-table-server>
  </div>
</template>

<style scoped>
.base-table {
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  border-radius: 14px;
}

.base-data-table {
  min-width: 680px;
}

.base-data-table :deep(.v-table__wrapper) {
  overflow-x: hidden;
}

.base-data-table :deep(th) {
  background: #faf9fc;
  color: #898592;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.base-data-table :deep(td) {
  color: #514e5b;
  font-size: 12px;
}

.base-data-table :deep(.v-data-table-footer) {
  border-top: 1px solid #eeedf2;
  padding: 8px 16px;
}
</style>
