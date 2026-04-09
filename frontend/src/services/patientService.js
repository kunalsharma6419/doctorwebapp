import { apiFetch } from "./api.js";

export const patientService = {
  list(search = "") {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiFetch(`/patients${query}`);
  },
  getById(id) {
    return apiFetch(`/patients/${id}`);
  },
  history(id) {
    return apiFetch(`/patients/${id}/history`);
  },
  create(payload) {
    return apiFetch("/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id, payload) {
    return apiFetch(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  remove(id) {
    return apiFetch(`/patients/${id}`, {
      method: "DELETE",
    });
  },
};
