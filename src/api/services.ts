import type { AuthLoginResponse, LoginCredentials } from "../store/auth.store";
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
