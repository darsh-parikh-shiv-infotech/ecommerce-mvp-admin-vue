import axios from "axios";
import { StatusCodes } from "http-status-codes";
import type { ApiErrorResponse } from "./axios";

import type { AxiosRequestConfig } from "axios";
import { API_ERROR_CODES, COMMON_MESSAGES } from "../utils/constants";

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

export class ApiError extends Error {
  readonly status?: number;
  readonly statusCode?: string | number;
  readonly errors?: Record<string, string[]>;
  readonly config?: AxiosRequestConfig;
  readonly isNetworkError: boolean;
  readonly isTimeout: boolean;
  readonly isCancelled: boolean;

  constructor(options: ApiErrorOptions) {
    super(options.message);

    this.name = "ApiError";
    this.status = options.status;
    this.statusCode = options.statusCode;
    this.errors = options.errors;
    this.config = options.config;
    this.isNetworkError = options.isNetworkError ?? false;
    this.isTimeout = options.isTimeout ?? false;
    this.isCancelled = options.isCancelled ?? false;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return typeof value === "object" && value !== null;
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isCancel(error)) {
    return new ApiError({
      message: COMMON_MESSAGES.ERROR.CANCELLED,
      statusCode: API_ERROR_CODES.REQUEST_CANCELLED,
      isCancelled: true,
    });
  }

  if (!axios.isAxiosError(error)) {
    return new ApiError({
      message: COMMON_MESSAGES.ERROR.GENERAL,
      statusCode: API_ERROR_CODES.UNKNOWN_ERROR,
    });
  }

  const response = error.response;
  const payload: unknown = response?.data;

  if (!response) {
    const isTimeout = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";

    return new ApiError({
      message: isTimeout ? COMMON_MESSAGES.ERROR.TIMEOUT : COMMON_MESSAGES.ERROR.NETWORK,
      statusCode: isTimeout ? API_ERROR_CODES.TIMEOUT_ERROR : API_ERROR_CODES.NETWORK_ERROR,
      config: error.config,
      isNetworkError: !isTimeout,
      isTimeout,
    });
  }

  const body = isApiErrorResponse(payload) ? payload : {};

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

  return new ApiError({
    message:
      (typeof body.message === "string" && body.message.trim()) ||
      (typeof body.error === "string" && body.error.trim()) ||
      fallbackMessage,
    status,
    statusCode: body.statusCode ?? body.statusCode,
    errors: body.errors,
    config: error.config,
  });
}
