import { jwtDecode } from "jwt-decode";

import { AUTH_ERROR_CODES, AUTH_MESSAGES } from "./constants";

import type { AuthUser } from "../store/auth.store";
import { createApiError } from "../api/api-error";

export interface AuthTokenPayload {
  sub?: string;
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export function decodeAuthToken(token: string): AuthTokenPayload {
  try {
    return jwtDecode<AuthTokenPayload>(token);
  } catch {
    throw createApiError({
      message: AUTH_MESSAGES.INVALID_TOKEN,
      statusCode: AUTH_ERROR_CODES.INVALID_TOKEN,
    });
  }
}

export function isTokenExpired(payload: AuthTokenPayload): boolean {
  if (!payload.exp) {
    return true;
  }

  return payload.exp <= Math.floor(Date.now() / 1000);
}

export function getAuthUser(token: string): AuthUser {
  const payload = decodeAuthToken(token);

  if (isTokenExpired(payload)) {
    throw createApiError({
      message: AUTH_MESSAGES.SESSION_EXPIRED,
      statusCode: AUTH_ERROR_CODES.TOKEN_EXPIRED,
    });
  }

  const rawId = payload.id ?? payload.sub;
  const id =
    typeof rawId === "string" && rawId.trim()
      ? rawId
      : typeof rawId === "number"
        ? String(rawId)
        : null;

  if (!id || typeof payload.email !== "string" || typeof payload.role !== "string") {
    throw createApiError({
      message: AUTH_MESSAGES.INVALID_TOKEN,
      statusCode: AUTH_ERROR_CODES.INVALID_TOKEN,
    });
  }

  return {
    id,
    email: payload.email,
    name: typeof payload.name === "string" ? payload.name : undefined,
    role: payload.role,
  };
}
