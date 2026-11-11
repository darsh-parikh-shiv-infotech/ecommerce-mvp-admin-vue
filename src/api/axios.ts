import type { InternalAxiosRequestConfig } from "axios";
import axios from "axios";

import { storageUtils } from "../utils/storage.utils";
import { API_CONFIG } from "../utils/constants";
import { normalizeApiError } from "./api-error";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export interface ApiResponse<T> {
  code?: number;
  message?: string;
  data: T;
}
export interface ApiErrorResponse {
  code?: string | number;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

if (!baseURL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

const api = axios.create({
  baseURL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    [API_CONFIG.HEADERS.ACCEPT]: API_CONFIG.CONTENT_TYPES.JSON,
    [API_CONFIG.HEADERS.CONTENT_TYPE]: API_CONFIG.CONTENT_TYPES.JSON,
  },
});

api.interceptors.request.use(handleRequest, handleRequestError);

api.interceptors.response.use((response) => response, handleResponseError);

function handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = storageUtils.getAccessToken();

  config.headers.set(API_CONFIG.HEADERS.ACCEPT, API_CONFIG.CONTENT_TYPES.JSON);

  if (token) {
    config.headers.set(API_CONFIG.HEADERS.AUTHORIZATION, `${API_CONFIG.AUTH_SCHEME} ${token}`);
  }

  return config;
}

function handleRequestError(error: unknown): Promise<never> {
  return Promise.reject(normalizeApiError(error));
}

function handleResponseError(error: unknown): Promise<never> {
  return Promise.reject(normalizeApiError(error));
}

export default api;
