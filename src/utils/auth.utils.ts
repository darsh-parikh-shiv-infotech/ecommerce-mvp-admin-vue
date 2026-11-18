import { jwtDecode } from "jwt-decode";

import { AUTH_ERROR_CODES, AUTH_MESSAGES } from "./constants";

import type { AuthUser } from "../store/auth.store";
import { createApiError } from "../api/api-error";
import { authService } from "../api/services";

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
  if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
    return true;
  }

  return payload.exp <= Math.floor(Date.now() / 1000);
}

export async function getAuthUser(token: string): Promise<AuthUser> {
  const payload = decodeAuthToken(token);
  if (isTokenExpired(payload)) {
    throw createApiError({
      message: AUTH_MESSAGES.SESSION_EXPIRED,
      statusCode: AUTH_ERROR_CODES.TOKEN_EXPIRED,
    });
  }

  const response = await authService.viewFullProfile(token);
  const id =
    typeof response.id === "string"
      ? response.id.trim()
      : Number.isSafeInteger(response.id)
        ? String(response.id)
        : "";

  if (
    !id ||
    typeof response.email !== "string" ||
    !response.email.trim() ||
    typeof response.role?.name !== "string" ||
    !response.role.name.trim()
  ) {
    throw createApiError({
      message: AUTH_MESSAGES.INVALID_TOKEN,
      statusCode: AUTH_ERROR_CODES.INVALID_TOKEN,
    });
  }
  return {
    id,
    email: response.email,
    name: typeof response.full_name === "string" ? response.full_name : undefined,
    role: response.role.name,
  };
}
