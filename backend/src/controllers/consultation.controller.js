import { asyncHandler } from "../utils/asyncHandler.js";
import {
  consultationSchema,
  consultationUpdateSchema,
} from "../validators/consultation.validators.js";
import {
  completeConsultation,
  createConsultation,
  deleteConsultation,
  getConsultationById,
  listConsultations,
  updateConsultation,
} from "../services/consultation.service.js";

export const getConsultations = asyncHandler(async (req, res) => {
  const consultations = await listConsultations({
    search: req.query.search,
    status: req.query.status,
  });
  res.json({ consultations });
});

export const postConsultation = asyncHandler(async (req, res) => {
  const data = consultationSchema.parse(req.body);
  const consultation = await createConsultation(req.user.id, data);
  res.status(201).json({ consultation });
});

export const getConsultation = asyncHandler(async (req, res) => {
  const consultation = await getConsultationById(req.params.id);
  res.json({ consultation });
});

export const putConsultation = asyncHandler(async (req, res) => {
  const data = consultationUpdateSchema.parse(req.body);
  const consultation = await updateConsultation(req.params.id, req.user.id, data);
  res.json({ consultation });
});

export const patchCompleteConsultation = asyncHandler(async (req, res) => {
  const consultation = await completeConsultation(req.params.id, req.user.id);
  res.json({ consultation });
});

export const removeConsultation = asyncHandler(async (req, res) => {
  await deleteConsultation(req.params.id, req.user.id);
  res.json({ message: "Consultation deleted successfully" });
});

export const getConsultationPrescription = asyncHandler(async (req, res) => {
  const consultation = await getConsultationById(req.params.id);
  res.json({ prescription: consultation.prescription });
});
