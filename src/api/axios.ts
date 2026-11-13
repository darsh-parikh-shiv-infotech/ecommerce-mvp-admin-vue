import type { InternalAxiosRequestConfig } from "axios";
import axios from "axios";

import { storageUtils } from "../utils/storage.utils";
import { API_CONFIG, COMMON_MESSAGES } from "../utils/constants";
import { createApiError, normalizeApiError } from "./api-error";
import { StatusCodes } from "http-status-codes";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export interface ApiResponse<T> {
  statusCode?: number;
  message?: string;
  data: T;
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

api.interceptors.response.use((response) => {
  const data = response.data;

  if (typeof data?.statusCode === "number" && data.statusCode >= StatusCodes.BAD_REQUEST) {
    throw createApiError({
      message: data.message || COMMON_MESSAGES.ERROR.GENERAL,
      statusCode: data.statusCode,
    });
  }

  return response;
}, handleResponseError);

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
