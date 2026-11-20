<script setup lang="ts">
import { VDataTableServer } from "vuetify/components";
import { PAGINATION_CONFIG, UI_STRINGS } from "../../utils/constants";

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
    totalItems?: number;
    itemValue?: string;
    emptyText?: string;
    hideFooter?: boolean;
    itemsPerPageOptions?: number[];
    minWidth?: string | number;
  }>(),
  {
    loading: false,
    page: 1,
    itemsPerPage: 10,
    totalItems: undefined,
    itemValue: "id",
    emptyText: UI_STRINGS.TABLE.EMPTY,
    hideFooter: false,
    itemsPerPageOptions: () => [...PAGINATION_CONFIG.ITEMS_PER_PAGE_OPTIONS],
    minWidth: 680,
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
      :items-length="totalItems ?? items.length"
      :item-value="itemValue"
      :hide-default-footer="hideFooter"
      :loading-text="UI_STRINGS.TABLE.LOADING"
      :no-data-text="emptyText"
      class="base-data-table"
      :style="{
        minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
      }"
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
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 14px;
  -webkit-overflow-scrolling: touch;
}

.base-data-table {
  width: 100%;
}

.base-data-table :deep(.v-table__wrapper) {
  overflow: visible;
}

.base-data-table :deep(.v-table > .v-table__wrapper > table) {
  width: 100%;
  border-spacing: 0;
}

/* Footer */
.base-data-table :deep(.v-data-table-footer) {
  border-top: 1px solid #eeedf2;
  padding: 8px 16px;
}
</style>
