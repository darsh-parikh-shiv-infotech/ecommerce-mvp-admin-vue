import { defineStore } from "pinia";
import { storageUtils } from "../utils/storage.utils";
import { getAuthUser } from "../utils/auth.utils";
import { authService } from "../api/services";
import { normalizeApiError } from "../api/api-error";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface AuthLoginResponse {
  accessToken: string;
}

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    accessToken: null,
    user: null,
    isInitialized: false,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => {
      return Boolean(state.accessToken && state.user);
    },

    userRole: (state): string | null => {
      return state.user?.role ?? null;
    },
  },

  actions: {
    initializeAuth(): void {
      if (this.isInitialized) return;
      this.validateSession();
      this.isInitialized = true;
    },

    async login(credentials: LoginCredentials): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.login(credentials);

        const token = response.accessToken;
        const user = getAuthUser(token);

        storageUtils.setAccessToken(token);

        this.accessToken = token;
        this.user = user;
        this.isInitialized = true;
      } catch (error: unknown) {
        const apiError = normalizeApiError(error);

        this.error = apiError.message;
        throw apiError;
      } finally {
        this.loading = false;
      }
    },

    logout(): void {
      this.clearSession();
      this.isInitialized = true;
      this.error = null;
    },

    clearSession(): void {
      storageUtils.removeAccessToken();

      this.accessToken = null;
      this.user = null;
    },
    clearError(): void {
      this.error = null;
    },
    validateSession(): void {
      const token = storageUtils.getAccessToken();

      if (!token) {
        this.clearSession();
        return;
      }

      try {
        const user = getAuthUser(token);

        this.accessToken = token;
        this.user = user;
      } catch {
        this.clearSession();
      }
    },
  },
});
