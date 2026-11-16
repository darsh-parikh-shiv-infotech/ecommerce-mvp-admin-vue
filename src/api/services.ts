import type { AttributeSetPayload } from "../store/attribute-set.store";
import type { AuthLoginResponse, LoginCredentials } from "../store/auth.store";
import type {
  Attribute,
  AttributeSet,
  PaginationData,
  PaginationRequest,
} from "../store/common.types";
import { API_ENDPOINTS } from "../utils/constants";
import api, { type ApiResponse } from "./axios";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthLoginResponse> => {
    const response = await api.post<ApiResponse<AuthLoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );

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
