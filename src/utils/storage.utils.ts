import { STORAGE_KEYS } from "./constants";

export const storageUtils = {
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  removeAccessToken(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
};
