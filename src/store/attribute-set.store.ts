import { defineStore } from "pinia";
import { attributeSetService } from "../api/services";
import { isApiError, normalizeApiError } from "../api/api-error";
import {
  DEFAULT_PARAMS,
  EMPTY_PAGINATION,
  type Attribute,
  type AttributeSet,
  type PaginationData,
  type PaginationRequest,
} from "./common.types";

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
        await attributeSetService.createAttributeSet(payload);
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
