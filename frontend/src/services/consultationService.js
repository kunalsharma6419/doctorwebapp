import { apiFetch } from "./api.js";

export const consultationService = {
  list({ search = "", status = "" } = {}) {
    const params = new URLSearchParams();

    if (search) {
      params.set("search", search);
    }

    if (status) {
      params.set("status", status);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiFetch(`/consultations${query}`);
  },
  create(payload) {
    return apiFetch("/consultations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getById(id) {
    return apiFetch(`/consultations/${id}`);
  },
  update(id, payload) {
    return apiFetch(`/consultations/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  complete(id) {
    return apiFetch(`/consultations/${id}/complete`, {
      method: "PATCH",
    });
  },
  remove(id) {
    return apiFetch(`/consultations/${id}`, {
      method: "DELETE",
    });
  },
};
