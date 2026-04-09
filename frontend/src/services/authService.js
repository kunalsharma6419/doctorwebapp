import { apiFetch } from "./api.js";

export const authService = {
  login(payload) {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me() {
    return apiFetch("/auth/me");
  },
  logout() {
    return apiFetch("/auth/logout", {
      method: "POST",
    });
  },
  changePassword(payload) {
    return apiFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
