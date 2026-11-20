<script setup lang="ts">
import { computed, ref } from "vue";
import BaseButton from "../../components/common/BaseButton.vue";
import BaseTable, { type BaseTableHeader } from "../../components/common/BaseTable.vue";
import BaseTextField from "../../components/common/BaseTextField.vue";
import AttributeSetFormDialog from "../../components/attribute-set/AttributeSetFormDialog.vue";
import { useAttributeSetStore, type AttributeSetPayload } from "../../store/attribute-set.store.ts";
import { UI_STRINGS } from "../../utils/constants.ts";
import { getPlaceholder } from "../../utils/placeholder.utils.ts";
import { VChip, VIcon, VSnackbar } from "vuetify/components";
import { useServerTable } from "../../utils/composables/useServerTable.ts";
import type { AttributeSet } from "../../store/common.types.ts";
import { formatDate } from "../../utils/common.utils.ts";

const store = useAttributeSetStore();
const itemSlots = {
  attributes: "item.attributes",
  status: "item.status",
  createdAt: "item.createdAt",
  actions: "item.actions",
};
const headers: BaseTableHeader[] = [
  { title: "Name", key: "name", minWidth: 150 },
  { title: "Attributes", key: "attributes", minWidth: 220, sortable: false },
  { title: "Status", key: "status", minWidth: 110 },
  { title: "Created", key: "createdAt", minWidth: 130 },
  { title: "Actions", key: "actions", align: "end", sortable: false },
];
const dialogOpen = ref(false);
const editingAttributeSet = ref<AttributeSet | null>(null);
const showSnackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref<"success" | "error">("success");

const attributeSets = computed(() => store.attributeSets);
const pagination = computed(() => store.pagination);
const isSaving = computed(
  () => store.loading.createAttributeSet || store.loading.updateAttributeSet,
);

const {
  search,
  load: loadAttributeSets,
  handleOptions: handleTableOptions,
} = useServerTable(
  (params) => store.fetchAttributeSets(params),
  () => notify(store.error || UI_STRINGS.ATTRIBUTE_SET.FETCH_ERROR, "error"),
);

function notify(message: string, color: "success" | "error" = "success") {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  showSnackbar.value = true;
}

async function ensureAttributesLoaded() {
  if (store.attributes.length) return;

  await store.fetchAttributes();
}
async function openCreateDialog() {
  editingAttributeSet.value = null;

  try {
    await ensureAttributesLoaded();
    dialogOpen.value = true;
  } catch {
    notify(store.error || UI_STRINGS.ATTRIBUTE_SET.FETCH_ERROR, "error");
  }
}

async function openEditDialog(item: AttributeSet) {
  editingAttributeSet.value = item;

  try {
    await ensureAttributesLoaded();
    dialogOpen.value = true;
  } catch {
    notify(store.error || UI_STRINGS.ATTRIBUTE_SET.FETCH_ERROR, "error");
  }
}

async function handleSave(payload: AttributeSetPayload) {
  try {
    const wasEditing = Boolean(editingAttributeSet.value);

    if (wasEditing) {
      await store.updateAttributeSet(editingAttributeSet.value!.id, payload);
      notify(UI_STRINGS.ATTRIBUTE_SET.UPDATE_SUCCESS);
    } else {
      await store.createAttributeSet(payload);
      notify(UI_STRINGS.ATTRIBUTE_SET.CREATE_SUCCESS);
    }

    dialogOpen.value = false;
    editingAttributeSet.value = null;

    await loadAttributeSets({ page: wasEditing ? pagination.value.currentPage : 1 });
  } catch {
    notify(store.error || "Unable to save attribute set.", "error");
  }
}
</script>
<template>
  <section class="attribute-set-page d-flex flex-column ga-6">
    <header class="d-flex flex-wrap align-center justify-space-between ga-4">
      <div>
        <h1 class="page-title">
          {{ UI_STRINGS.ATTRIBUTE_SET.TITLE }}
        </h1>

        <p class="page-description mt-1">
          {{ UI_STRINGS.ATTRIBUTE_SET.DESCRIPTION }}
        </p>
      </div>

      <BaseButton size="small" :block="false" @click="openCreateDialog">
        <v-icon icon="mdi-plus" size="18" class="mr-2" />
        {{ UI_STRINGS.ATTRIBUTE_SET.ADD }}
      </BaseButton>
    </header>

    <div class="filter-panel d-flex flex-wrap align-center ga-3 pa-4">
      <BaseTextField
        v-model="search"
        :label="UI_STRINGS.ATTRIBUTE_SET.SEARCH_LABEL"
        :placeholder="getPlaceholder(UI_STRINGS.ATTRIBUTE_SET.SEARCH_LABEL)"
        prepend-inner-icon="mdi-magnify"
        hide-details
        density="compact"
        class="search-field"
        :loading="store.loading.fetchAttributeSets"
      />
    </div>

    <div class="table-panel">
      <BaseTable
        :headers="headers"
        :loading="store.loading.fetchAttributeSets"
        :items="attributeSets"
        :page="pagination.currentPage"
        :items-per-page="pagination.pageSize"
        :total-items="pagination.totalItems"
        :empty-text="UI_STRINGS.ATTRIBUTE_SET.EMPTY_TITLE"
        @update:options="handleTableOptions"
      >
        <template #[itemSlots.attributes]="{ item }">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="attribute in item.attributes"
              :key="attribute.id"
              size="small"
              variant="tonal"
              color="deep-purple"
            >
              {{ attribute.name }}
            </v-chip>

            <span v-if="!item.attributes.length">—</span>
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
          <div class="d-flex justify-end">
            <BaseButton
              icon
              size="small"
              variant="text"
              :aria-label="`${UI_STRINGS.COMMON.EDIT} ${item.name}`"
              @click="openEditDialog(item)"
            >
              <v-icon icon="mdi-pencil-outline" />
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </div>

    <AttributeSetFormDialog
      v-model="dialogOpen"
      :attributes="store.attributes"
      :initial-data="editingAttributeSet"
      :loading="isSaving"
      @submit="handleSave"
    />

    <VSnackbar v-model="showSnackbar" :color="snackbarColor" location="top end" :timeout="3500">
      {{ snackbarMessage }}
    </VSnackbar>
  </section>
</template>

<style scoped>
.attribute-set-page {
  min-width: 0;
}

.page-title {
  color: #302e3c;
  font-size: 25px;
  font-weight: 750;
  letter-spacing: -0.8px;
}

.page-description {
  color: #9995a2;
  font-size: 12px;
}

.filter-panel,
.table-panel {
  overflow: hidden;
  border: 1px solid #eeedf2;
  border-radius: 14px;
  background: #fff;
}

.search-form {
  width: min(100%, 480px);
}

.search-field {
  min-width: 180px;
}

@media (max-width: 650px) {
  .search-form {
    width: 100%;
  }
}
</style>
