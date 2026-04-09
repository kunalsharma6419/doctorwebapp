import { asyncHandler } from "../utils/asyncHandler.js";
import { patientQuerySchema, patientSchema } from "../validators/patient.validators.js";
import {
  createPatient,
  deletePatient,
  getPatientById,
  getPatientHistory,
  listPatients,
  updatePatient,
} from "../services/patient.service.js";

export const getPatients = asyncHandler(async (req, res) => {
  const filters = patientQuerySchema.parse(req.query);
  const patients = await listPatients(filters);
  res.json({ patients });
});

export const postPatient = asyncHandler(async (req, res) => {
  const data = patientSchema.parse(req.body);
  const patient = await createPatient(data);
  res.status(201).json({ patient });
});

export const getPatient = asyncHandler(async (req, res) => {
  const patient = await getPatientById(req.params.id);
  res.json({ patient });
});

export const putPatient = asyncHandler(async (req, res) => {
  const data = patientSchema.parse(req.body);
  const patient = await updatePatient(req.params.id, data);
  res.json({ patient });
});

export const removePatient = asyncHandler(async (req, res) => {
  await deletePatient(req.params.id);
  res.json({ message: "Patient deleted successfully" });
});

export const getHistory = asyncHandler(async (req, res) => {
  const history = await getPatientHistory(req.params.id);
  res.json({ history });
});
