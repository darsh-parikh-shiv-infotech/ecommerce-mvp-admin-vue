import type { AttributeSetPayload } from "../store/attribute-set.store";
import type { AuthLoginResponse, AuthUserResponse, LoginCredentials } from "../store/auth.store";
import type {
  Attribute,
  AttributeSet,
  PaginationData,
  PaginationRequest,
  Product,
  ProductPayload,
  UploadedFile,
} from "../store/common.types";
import { API_CONFIG, API_ENDPOINTS } from "../utils/constants";
import api, { type ApiResponse } from "./axios";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthLoginResponse> => {
    const response = await api.post<ApiResponse<AuthLoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );

    return response.data.data;
  },
  viewFullProfile: async (token: string): Promise<AuthUserResponse> => {
    const response = await api.get<ApiResponse<AuthUserResponse>>(API_ENDPOINTS.AUTH.VIEW_PROFILE, {
      headers: {
        [API_CONFIG.HEADERS.AUTHORIZATION]: `${API_CONFIG.AUTH_SCHEME} ${token}`,
      },
    });
    return response.data.data;
  },
};

export const attributeSetService = {
  fetchAttributeSets: async (params: PaginationRequest): Promise<PaginationData<AttributeSet>> => {
    const response = await api.post<ApiResponse<PaginationData<AttributeSet>>>(
      API_ENDPOINTS.ATTRIBUTE_SET.LIST,
      params,
    );

    return response.data.data;
  },

  fetchAttributes: async (params: PaginationRequest): Promise<PaginationData<Attribute>> => {
    const response = await api.post<ApiResponse<PaginationData<Attribute>>>(
      API_ENDPOINTS.ATTRIBUTE_SET.ATTRIBUTES,
      params,
    );

    return response.data.data;
  },

  createAttributeSet: async (payload: AttributeSetPayload): Promise<void> => {
    await api.post(API_ENDPOINTS.ATTRIBUTE_SET.CREATE, payload);
  },

  updateAttributeSet: async (id: number, payload: AttributeSetPayload): Promise<void> => {
    await api.put(API_ENDPOINTS.ATTRIBUTE_SET.UPDATE(id), payload);
  },
};

export const productService = {
  fetchProducts: async (params: PaginationRequest): Promise<PaginationData<Product>> => {
    const response = await api.post<ApiResponse<PaginationData<Product>>>(
      API_ENDPOINTS.PRODUCT.LIST,
      params,
    );

    return response.data.data;
  },

  fetchSingleProduct: async (id: number): Promise<Product> => {
    const response = await api.get<ApiResponse<Product>>(API_ENDPOINTS.PRODUCT.FETCH_SINGLE(id));
    return response.data.data;
  },

  createProduct: async (payload: ProductPayload): Promise<void> => {
    await api.post(API_ENDPOINTS.PRODUCT.CREATE, payload);
  },

  updateProduct: async (id: number, payload: ProductPayload): Promise<void> => {
    await api.put(API_ENDPOINTS.PRODUCT.UPDATE(id), payload);
  },

  deleteVariant: async (productId: number, variantId: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.PRODUCT.DELETE_VARIANT(productId, variantId));
  },
};

export const commonService = {
  uploadFile: async (file: File): Promise<UploadedFile[]> => {
    const formData = new FormData();
    formData.append("files", file);

    const response = await api.post<ApiResponse<{ image: UploadedFile[] }>>(
      API_ENDPOINTS.COMMON.FILE_UPLOAD,
      formData,
    );

    return response.data.data.image;
  },
};
