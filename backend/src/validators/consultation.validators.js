import { z } from "zod";

const vitalsSchema = z.object({
  temperature: z.number().min(30).max(45).optional().nullable(),
  bloodPressureSystolic: z.number().int().min(40).max(300).optional().nullable(),
  bloodPressureDiastolic: z.number().int().min(30).max(200).optional().nullable(),
  pulseRate: z.number().int().min(20).max(250).optional().nullable(),
  respiratoryRate: z.number().int().min(5).max(80).optional().nullable(),
  oxygenSaturation: z.number().int().min(10).max(100).optional().nullable(),
  height: z.number().min(30).max(300).optional().nullable(),
  weight: z.number().min(1).max(500).optional().nullable(),
  bmi: z.number().min(1).max(100).optional().nullable(),
});

const prescriptionItemSchema = z.object({
  medicineName: z.string().trim().min(1),
  dosage: z.string().trim().max(100).optional().nullable(),
  frequency: z.string().trim().max(100).optional().nullable(),
  duration: z.string().trim().max(100).optional().nullable(),
  instructions: z.string().trim().max(300).optional().nullable(),
  quantity: z.number().int().min(1).max(999).optional().nullable(),
});

export const consultationSchema = z.object({
  patientId: z.string().cuid(),
  visitDate: z.string().datetime().optional(),
  chiefComplaint: z.string().trim().min(1),
  symptoms: z.string().trim().max(2000).optional().nullable(),
  examinationNotes: z.string().trim().max(4000).optional().nullable(),
  diagnosis: z.string().trim().max(2000).optional().nullable(),
  treatmentPlan: z.string().trim().max(2000).optional().nullable(),
  doctorNotes: z.string().trim().max(2000).optional().nullable(),
  followUpDate: z.string().datetime().optional().nullable(),
  status: z.enum(["DRAFT", "COMPLETED"]).default("DRAFT"),
  vitals: vitalsSchema.optional(),
  prescription: z
    .object({
      notes: z.string().trim().max(1000).optional().nullable(),
      items: z.array(prescriptionItemSchema).default([]),
    })
    .optional(),
});

export const consultationUpdateSchema = consultationSchema.omit({ patientId: true }).partial();
