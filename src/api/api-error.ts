import axios from "axios";
import { StatusCodes } from "http-status-codes";
import type { AxiosRequestConfig } from "axios";

import { API_ERROR_CODES, COMMON_MESSAGES } from "../utils/constants";

export interface ApiErrorResponse {
  statusCode?: string | number;
  status?: string;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ApiErrorOptions {
  message: string;
  status?: number;
  statusCode?: string | number;
  errors?: Record<string, string[]>;
  config?: AxiosRequestConfig;
  isNetworkError?: boolean;
  isTimeout?: boolean;
  isCancelled?: boolean;
}

export type ApiError = Error & {
  status?: number;
  statusCode?: string | number;
  errors?: Record<string, string[]>;
  config?: AxiosRequestConfig;
  isNetworkError: boolean;
  isTimeout: boolean;
  isCancelled: boolean;
};

export function createApiError(options: ApiErrorOptions): ApiError {
  return Object.assign(new Error(options.message), {
    name: "ApiError",
    status: options.status,
    statusCode: options.statusCode,
    errors: options.errors,
    config: options.config,
    isNetworkError: options.isNetworkError ?? false,
    isTimeout: options.isTimeout ?? false,
    isCancelled: options.isCancelled ?? false,
  }) as ApiError;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    error.name === "ApiError" &&
    "isNetworkError" in error &&
    "isTimeout" in error &&
    "isCancelled" in error
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArrayRecord(value: unknown): value is Record<string, string[]> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (item) => Array.isArray(item) && item.every((entry) => typeof entry === "string"),
    )
  );
}

export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (axios.isCancel(error)) {
    return createApiError({
      message: COMMON_MESSAGES.ERROR.CANCELLED,
      statusCode: API_ERROR_CODES.REQUEST_CANCELLED,
      isCancelled: true,
    });
  }

  if (!axios.isAxiosError(error)) {
    return createApiError({
      message: COMMON_MESSAGES.ERROR.GENERAL,
      statusCode: API_ERROR_CODES.UNKNOWN_ERROR,
    });
  }

  const response = error.response;

  if (!response) {
    const isTimeout = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";

    return createApiError({
      message: isTimeout ? COMMON_MESSAGES.ERROR.TIMEOUT : COMMON_MESSAGES.ERROR.NETWORK,
      statusCode: isTimeout ? API_ERROR_CODES.TIMEOUT_ERROR : API_ERROR_CODES.NETWORK_ERROR,
      config: error.config,
      isNetworkError: !isTimeout,
      isTimeout,
    });
  }

  const body = isRecord(response.data) ? response.data : {};
  const status = response.status;

  const fallbackMessage =
    status === StatusCodes.UNAUTHORIZED
      ? COMMON_MESSAGES.ERROR.UNAUTHORIZED
      : status === StatusCodes.FORBIDDEN
        ? COMMON_MESSAGES.ERROR.FORBIDDEN
        : status === StatusCodes.NOT_FOUND
          ? COMMON_MESSAGES.ERROR.NOT_FOUND
          : status === StatusCodes.UNPROCESSABLE_ENTITY
            ? COMMON_MESSAGES.ERROR.VALIDATION
            : COMMON_MESSAGES.ERROR.GENERAL;

  const message =
    (typeof body.message === "string" && body.message.trim()) ||
    (typeof body.error === "string" && body.error.trim()) ||
    fallbackMessage;

  const statusCode =
    typeof body.statusCode === "string" || typeof body.statusCode === "number"
      ? body.statusCode
      : undefined;

  return createApiError({
    message,
    status,
    statusCode,
    errors: isStringArrayRecord(body.errors) ? body.errors : undefined,
    config: error.config,
  });
}
