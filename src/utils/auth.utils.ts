import { jwtDecode } from "jwt-decode";
import { AUTH_ERROR_CODES, AUTH_MESSAGES } from "./constants";
import { ApiError } from "../api/api-error";
import type { AuthUser } from "../store/auth.store";

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
    throw new ApiError({
      message: AUTH_MESSAGES.INVALID_TOKEN,
      code: AUTH_ERROR_CODES.INVALID_TOKEN,
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
    throw new ApiError({
      message: AUTH_MESSAGES.SESSION_EXPIRED,
      code: AUTH_ERROR_CODES.TOKEN_EXPIRED,
    });
  }

  const id = payload.id ?? payload.sub;

  if (
    typeof id !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.role !== "string"
  ) {
    throw new ApiError({
      message: AUTH_MESSAGES.INVALID_TOKEN,
      code: AUTH_ERROR_CODES.INVALID_TOKEN,
    });
  }

  return {
    id,
    email: payload.email,
    name: typeof payload.name === "string" ? payload.name : undefined,
    role: payload.role,
  };
}
