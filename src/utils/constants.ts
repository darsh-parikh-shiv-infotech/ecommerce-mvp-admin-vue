import { StatusCodes } from "http-status-codes";

export const HTTP_STATUS = StatusCodes;

export const API_CONFIG = {
  TIMEOUT: 15000,
  AUTH_SCHEME: "Bearer",
  HEADERS: {
    ACCEPT: "Accept",
    CONTENT_TYPE: "Content-Type",
    AUTHORIZATION: "Authorization",
  },
  CONTENT_TYPES: {
    JSON: "application/json",
  },
} as const;

export const API_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  REQUEST_CANCELLED: "REQUEST_CANCELLED",
} as const;

export const COMMON_MESSAGES = {
  SUCCESS: {
    CREATED: "Created successfully.",
    UPDATED: "Updated successfully.",
    DELETED: "Deleted successfully.",
    FETCHED: "Data fetched successfully.",
    SAVED: "Changes saved successfully.",
  },
  ERROR: {
    GENERAL: "Something went wrong. Please try again.",
    NETWORK: "Unable to connect to the server.",
    TIMEOUT: "The request took too long. Please try again.",
    UNAUTHORIZED: "Your session has expired. Please sign in again.",
    FORBIDDEN: "You do not have permission to perform this action.",
    NOT_FOUND: "The requested resource was not found.",
    VALIDATION: "Please check the submitted information.",
    CANCELLED: "The request was cancelled.",
  },
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
  },
} as const;

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: "Login successful.",
  LOGOUT_SUCCESS: "Logout successful.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  INVALID_TOKEN: "Invalid authentication token.",
  INVALID_CREDENTIALS: "Invalid email or password.",

  EMAIL_REQUIRED: "Email is required.",
  EMAIL_INVALID: "Please enter a valid email address.",
  PASSWORD_REQUIRED: "Password is required.",
} as const;

export const ROUTE_NAMES = {
  LOGIN: "login",
  DASHBOARD: "dashboard",
} as const;

export const ROUTE_PATHS = {
  LOGIN: "/login",
  DASHBOARD: "/",
} as const;

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
} as const;
