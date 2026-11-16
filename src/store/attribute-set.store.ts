import { defineStore } from "pinia";
import { attributeSetService } from "../api/services";
import { isApiError, normalizeApiError } from "../api/api-error";

export interface PaginationRequest {
  sortValue?: "asc" | "desc";
  sortKey?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationData<T> {
  rows: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  numberOfRows: number;
}

export interface Attribute {
  id: number;
  name: string;
}

export interface AttributeSet {
  id: number;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  attributes: Attribute[];
}

export interface AttributeSetPayload {
  name: string;
  attribute_id: number[];
  status: "active" | "inactive";
}

interface AttributeSetState {
  attributeSets: AttributeSet[];
  attributes: Attribute[];
  pagination: Omit<PaginationData<AttributeSet>, "rows">;
  attributePagination: Omit<PaginationData<Attribute>, "rows">;
  listParams: PaginationRequest;
  attributeListParams: PaginationRequest;
  loading: {
    fetchAttributeSets: boolean;
    fetchAttributes: boolean;
    createAttributeSet: boolean;
    updateAttributeSet: boolean;
  };
  error: string | null;
}

const DEFAULT_PARAMS: PaginationRequest = {
  sortValue: "desc",
  sortKey: "id",
  page: 1,
  limit: 10,
};

const EMPTY_PAGINATION = {
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
  numberOfRows: 0,
};

export const useAttributeSetStore = defineStore("attributeSet", {
  state: (): AttributeSetState => ({
    attributeSets: [],
    attributes: [],

    pagination: { ...EMPTY_PAGINATION },
    attributePagination: { ...EMPTY_PAGINATION },

    listParams: { ...DEFAULT_PARAMS },
    attributeListParams: { ...DEFAULT_PARAMS },

    loading: {
      fetchAttributeSets: false,
      fetchAttributes: false,
      createAttributeSet: false,
      updateAttributeSet: false,
    },

    error: null,
  }),

  actions: {
    async fetchAttributeSets(params: PaginationRequest = {}): Promise<void> {
      this.loading.fetchAttributeSets = true;
      this.error = null;

      const requestParams = {
        ...this.listParams,
        ...params,
      };

      try {
        const response = await attributeSetService.fetchAttributeSets(requestParams);

        this.attributeSets = response.rows;
        this.pagination = {
          totalItems: response.totalItems,
          totalPages: response.totalPages,
          currentPage: response.currentPage,
          pageSize: response.pageSize,
          numberOfRows: response.numberOfRows,
        };

        this.listParams = requestParams;
      } catch (error: unknown) {
        const apiError = isApiError(error) ? error : normalizeApiError(error);

        this.error = apiError.message;
        throw apiError;
      } finally {
        this.loading.fetchAttributeSets = false;
      }
    },

    async fetchAttributes(params: PaginationRequest = {}): Promise<void> {
      this.loading.fetchAttributes = true;
      this.error = null;

      const requestParams = {
        ...this.attributeListParams,
        ...params,
      };

      try {
        const response = await attributeSetService.fetchAttributes(requestParams);

        this.attributes = response.rows;
        this.attributePagination = {
          totalItems: response.totalItems,
          totalPages: response.totalPages,
          currentPage: response.currentPage,
          pageSize: response.pageSize,
          numberOfRows: response.numberOfRows,
        };

        this.attributeListParams = requestParams;
      } catch (error: unknown) {
        const apiError = isApiError(error) ? error : normalizeApiError(error);

        this.error = apiError.message;
        throw apiError;
      } finally {
        this.loading.fetchAttributes = false;
      }
    },

    async createAttributeSet(payload: AttributeSetPayload): Promise<void> {
      this.loading.createAttributeSet = true;
      this.error = null;

      try {
        await attributeSetService.createAtrributeSet(payload);
      } catch (error: unknown) {
        const apiError = isApiError(error) ? error : normalizeApiError(error);

        this.error = apiError.message;
        throw apiError;
      } finally {
        this.loading.createAttributeSet = false;
      }
    },

    async updateAttributeSet(id: number, payload: AttributeSetPayload): Promise<void> {
      this.loading.updateAttributeSet = true;
      this.error = null;

      try {
        await attributeSetService.updateAttributeSet(id, payload);
      } catch (error: unknown) {
        const apiError = isApiError(error) ? error : normalizeApiError(error);

        this.error = apiError.message;
        throw apiError;
      } finally {
        this.loading.updateAttributeSet = false;
      }
    },

    clearError(): void {
      this.error = null;
    },
  },
});
