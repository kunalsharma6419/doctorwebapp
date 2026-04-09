import { apiFetch } from "./api.js";

export const prescriptionService = {
  getByConsultationId(consultationId) {
    return apiFetch(`/consultations/${consultationId}/prescription`);
  },
};
