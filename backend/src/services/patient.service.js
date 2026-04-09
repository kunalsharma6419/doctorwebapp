import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { generatePatientCode } from "../utils/patientCode.js";

function toPatientPayload(data) {
  return {
    patientCode: data.patientCode || generatePatientCode(),
    fullName: data.fullName,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    age: data.age ?? null,
    gender: data.gender,
    phone: data.phone ?? null,
    country: data.country ?? null,
    state: data.state ?? null,
    city: data.city ?? null,
    address: data.address ?? null,
    bloodGroup: data.bloodGroup ?? null,
    allergies: data.allergies ?? null,
    chronicConditions: data.chronicConditions ?? null,
    notes: data.notes ?? null,
  };
}

export async function listPatients(filters) {
  const where = {
    ...(filters.gender ? { gender: filters.gender } : {}),
    ...(filters.search
      ? {
          OR: [
            { fullName: { contains: filters.search, mode: "insensitive" } },
            { phone: { contains: filters.search, mode: "insensitive" } },
            { patientCode: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  return prisma.patient.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { consultations: true },
      },
    },
  });
}

export async function createPatient(data) {
  return prisma.patient.create({
    data: toPatientPayload(data),
  });
}

export async function getPatientById(id) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      consultations: {
        orderBy: { visitDate: "desc" },
        select: {
          id: true,
          visitDate: true,
          chiefComplaint: true,
          diagnosis: true,
          followUpDate: true,
          status: true,
        },
      },
    },
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return patient;
}

export async function updatePatient(id, data) {
  const existing = await getPatientById(id);

  return prisma.patient.update({
    where: { id },
    data: {
      patientCode: data.patientCode || existing.patientCode,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      age: data.age ?? null,
      gender: data.gender,
      phone: data.phone ?? null,
      country: data.country ?? null,
      state: data.state ?? null,
      city: data.city ?? null,
      address: data.address ?? null,
      bloodGroup: data.bloodGroup ?? null,
      allergies: data.allergies ?? null,
      chronicConditions: data.chronicConditions ?? null,
      notes: data.notes ?? null,
    },
  });
}

export async function deletePatient(id) {
  await getPatientById(id);

  return prisma.patient.delete({
    where: { id },
  });
}

export async function getPatientHistory(id) {
  await getPatientById(id);

  return prisma.consultation.findMany({
    where: { patientId: id },
    orderBy: { visitDate: "desc" },
    include: {
      vitals: true,
      prescription: {
        include: {
          items: true,
        },
      },
    },
  });
}
