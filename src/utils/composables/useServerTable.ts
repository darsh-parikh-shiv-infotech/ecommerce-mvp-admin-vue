import { onMounted, ref, watch } from "vue";
import { DEFAULT_PARAMS, type PaginationRequest } from "../../store/common.types";
import { useDebounce } from "./useDebounce";

export interface ServerTableOptions {
  page: number;
  itemsPerPage: number;
  sortBy: {
    key: string;
    order: "asc" | "desc";
  }[];
}

export function useServerTable(
  fetchPage: (params: PaginationRequest) => Promise<void>,
  onError: (error: unknown) => void,
  searchDelay = 400,
) {
  const search = ref("");
  const query = ref<PaginationRequest>({ ...DEFAULT_PARAMS });
  const debouncedSearch = useDebounce(search, searchDelay);

  async function load(overrides: Partial<PaginationRequest> = {}): Promise<void> {
    Object.assign(query.value, overrides);

    try {
      await fetchPage({
        ...query.value,
        search: search.value.trim() || undefined,
      });
    } catch (error: unknown) {
      onError(error);
    }
  }

  function handleOptions(options: ServerTableOptions): void {
    const sorting = options.sortBy[0];

    void load({
      page: options.page,
      limit: options.itemsPerPage,
      sortKey: sorting?.key ?? DEFAULT_PARAMS.sortKey,
      sortValue: sorting?.order ?? DEFAULT_PARAMS.sortValue,
    });
  }

  watch(debouncedSearch, () => {
    void load({ page: 1 });
  });

  onMounted(() => {
    void load({ page: DEFAULT_PARAMS.page });
  });

  return {
    search,
    load,
    handleOptions,
  };
}
