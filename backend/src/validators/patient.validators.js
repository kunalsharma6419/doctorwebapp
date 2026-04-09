import { z } from "zod";

export const patientSchema = z.object({
  patientCode: z.string().trim().min(3).optional(),
  fullName: z.string().trim().min(2),
  dateOfBirth: z.string().datetime().optional().nullable(),
  age: z.number().int().min(0).max(130).optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().trim().min(7).max(20).optional().nullable(),
  country: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  bloodGroup: z.string().trim().max(10).optional().nullable(),
  allergies: z.string().trim().max(1000).optional().nullable(),
  chronicConditions: z.string().trim().max(1000).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const patientQuerySchema = z.object({
  search: z.string().trim().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});
