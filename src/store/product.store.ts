import { defineStore } from "pinia";
import {
  EMPTY_PAGINATION,
  DEFAULT_PARAMS,
  type PaginationData,
  type PaginationRequest,
  type Product,
  type ProductPayload,
  type UploadedFile,
} from "./common.types";
import { commonService, productService } from "../api/services";
import { isApiError, normalizeApiError } from "../api/api-error";
import { COMMON_MESSAGES } from "../utils/constants";

interface ProductState {
  products: Product[];
  product: Product | null;
  pagination: Omit<PaginationData<Product>, "rows">;
  listParams: PaginationRequest;
  loading: {
    fetchProducts: boolean;
    fetchSingleProduct: boolean;
    createProduct: boolean;
    updateProduct: boolean;
    deleteVariant: boolean;
    uploadFile: boolean;
  };
  error: string | null;
}

let productFetchSequence = 0;
let productListFetchSequence = 0;

export const useProductStore = defineStore("product", {
  state: (): ProductState => ({
    products: [],
    product: null,
    pagination: { ...EMPTY_PAGINATION },

    listParams: { ...DEFAULT_PARAMS },

    loading: {
      fetchProducts: false,
      fetchSingleProduct: false,
      createProduct: false,
      updateProduct: false,
      deleteVariant: false,
      uploadFile: false,
    },

    error: null,
  }),

  actions: {
    async fetchProducts(params: PaginationRequest = {}): Promise<void> {
      const requestSequence = ++productListFetchSequence;

      this.loading.fetchProducts = true;
      this.error = null;

      const requestParams = {
        ...this.listParams,
        ...params,
      };

      try {
        const response = await productService.fetchProducts(requestParams);

        if (requestSequence !== productListFetchSequence) return;

        this.products = response.rows;
        this.pagination = {
          totalItems: response.totalItems,
          totalPages: response.totalPages,
          currentPage: response.currentPage,
          pageSize: response.pageSize,
          numberOfRows: response.numberOfRows,
        };

        this.listParams = requestParams;
      } catch (error: unknown) {
        if (requestSequence !== productListFetchSequence) return;

        const apiError = isApiError(error) ? error : normalizeApiError(error);

        this.error = apiError.message;
        throw apiError;
      } finally {
        if (requestSequence === productListFetchSequence) {
          this.loading.fetchProducts = false;
        }
      }
    },

    async fetchSingleProduct(id: number): Promise<void> {
      const requestSequence = ++productFetchSequence;
      this.loading.fetchSingleProduct = true;
      this.error = null;

      try {
        const product = await productService.fetchSingleProduct(id);

        if (requestSequence === productFetchSequence) {
          this.product = product;
        }
      } catch (error: unknown) {
        const apiError = isApiError(error) ? error : normalizeApiError(error);

        if (requestSequence === productFetchSequence) {
          this.error = apiError.message;
        }

        throw apiError;
      } finally {
        if (requestSequence === productFetchSequence) {
          this.loading.fetchSingleProduct = false;
        }
      }
    },

    async createProduct(payload: ProductPayload): Promise<void> {
      this.loading.createProduct = true;
      this.error = null;

      try {
        await productService.createProduct(payload);
      } catch (error: unknown) {
        const apiError = isApiError(error) ? error : normalizeApiError(error);
        this.error = apiError.message;
        throw apiError;
      } finally {
        this.loading.createProduct = false;
      }
    },

    async updateProduct(id: number, payload: ProductPayload): Promise<void> {
      this.loading.updateProduct = true;
      this.error = null;

      try {
        await productService.updateProduct(id, payload);
      } catch (error: unknown) {
        const apiError = isApiError(error) ? error : normalizeApiError(error);
        this.error = apiError.message;
        throw apiError;
      } finally {
        this.loading.updateProduct = false;
      }
    },

    async deleteVariant(id: number): Promise<void> {
      this.loading.deleteVariant = true;
      this.error = null;
      const productId = this.product?.id;

      try {
        if (typeof productId !== "number" || !Number.isFinite(productId)) {
          throw new Error(COMMON_MESSAGES.ERROR.VALIDATION);
        }

        await productService.deleteVariant(productId, id);

        const currentProduct = this.product;
        if (productId !== undefined && currentProduct?.id === productId) {
          currentProduct.variants = currentProduct.variants.filter((variant) => variant.id !== id);
        }
      } catch (error: unknown) {
        const apiError = isApiError(error) ? error : normalizeApiError(error);
        this.error = apiError.message;
        throw apiError;
      } finally {
        this.loading.deleteVariant = false;
      }
    },

    async uploadFile(file: File): Promise<UploadedFile[]> {
      this.loading.uploadFile = true;
      this.error = null;

      try {
        return await commonService.uploadFile(file);
      } catch (error: unknown) {
        const apiError = isApiError(error) ? error : normalizeApiError(error);

        this.error = apiError.message;
        throw apiError;
      } finally {
        this.loading.uploadFile = false;
      }
    },

    clearProduct(): void {
      productFetchSequence += 1;
      this.product = null;
      this.loading.fetchSingleProduct = false;
      this.error = null;
    },

    clearError(): void {
      this.error = null;
    },
  },
});
