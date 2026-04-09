import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";

function buildVitals(data) {
  if (!data) {
    return undefined;
  }

  return {
    temperature: data.temperature ?? null,
    bloodPressureSystolic: data.bloodPressureSystolic ?? null,
    bloodPressureDiastolic: data.bloodPressureDiastolic ?? null,
    pulseRate: data.pulseRate ?? null,
    respiratoryRate: data.respiratoryRate ?? null,
    oxygenSaturation: data.oxygenSaturation ?? null,
    height: data.height ?? null,
    weight: data.weight ?? null,
    bmi: data.bmi ?? null,
  };
}

function buildPrescription(data, patientId, doctorId) {
  if (!data) {
    return undefined;
  }

  return {
    notes: data.notes ?? null,
    patientId,
    doctorId,
    items: {
      create: data.items.map((item) => ({
        medicineName: item.medicineName,
        dosage: item.dosage ?? null,
        frequency: item.frequency ?? null,
        duration: item.duration ?? null,
        instructions: item.instructions ?? null,
        quantity: item.quantity ?? null,
      })),
    },
  };
}

export async function createConsultation(doctorId, data) {
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId },
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return prisma.consultation.create({
    data: {
      patientId: data.patientId,
      doctorId,
      visitDate: data.visitDate ? new Date(data.visitDate) : new Date(),
      chiefComplaint: data.chiefComplaint,
      symptoms: data.symptoms ?? null,
      examinationNotes: data.examinationNotes ?? null,
      diagnosis: data.diagnosis ?? null,
      treatmentPlan: data.treatmentPlan ?? null,
      doctorNotes: data.doctorNotes ?? null,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      status: data.status,
      vitals: data.vitals
        ? {
            create: buildVitals(data.vitals),
          }
        : undefined,
      prescription: data.prescription
        ? {
            create: buildPrescription(data.prescription, data.patientId, doctorId),
          }
        : undefined,
    },
    include: {
      patient: true,
      vitals: true,
      prescription: {
        include: { items: true },
      },
    },
  });
}

export async function listConsultations(filters = {}) {
  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { chiefComplaint: { contains: filters.search, mode: "insensitive" } },
            { diagnosis: { contains: filters.search, mode: "insensitive" } },
            { patient: { fullName: { contains: filters.search, mode: "insensitive" } } },
            { patient: { patientCode: { contains: filters.search, mode: "insensitive" } } },
            { patient: { phone: { contains: filters.search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  return prisma.consultation.findMany({
    where,
    orderBy: { visitDate: "desc" },
    include: {
      patient: {
        select: {
          id: true,
          patientCode: true,
          fullName: true,
          age: true,
          gender: true,
          phone: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
        },
      },
      prescription: {
        select: {
          id: true,
          _count: {
            select: { items: true },
          },
        },
      },
    },
  });
}

export async function getConsultationById(id) {
  const consultation = await prisma.consultation.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
          specialization: true,
        },
      },
      vitals: true,
      prescription: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!consultation) {
    throw new ApiError(404, "Consultation not found");
  }

  return consultation;
}

export async function updateConsultation(id, doctorId, data) {
  const existing = await getConsultationById(id);

  if (existing.doctorId !== doctorId) {
    throw new ApiError(403, "You cannot edit this consultation");
  }

  return prisma.$transaction(async (tx) => {
    await tx.consultation.update({
      where: { id },
      data: {
        visitDate: data.visitDate ? new Date(data.visitDate) : undefined,
        chiefComplaint: data.chiefComplaint,
        symptoms: data.symptoms,
        examinationNotes: data.examinationNotes,
        diagnosis: data.diagnosis,
        treatmentPlan: data.treatmentPlan,
        doctorNotes: data.doctorNotes,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : data.followUpDate,
        status: data.status,
      },
    });

    if (data.vitals) {
      await tx.consultationVitals.upsert({
        where: { consultationId: id },
        create: {
          consultationId: id,
          ...buildVitals(data.vitals),
        },
        update: buildVitals(data.vitals),
      });
    }

    if (data.prescription) {
      const prescription = await tx.prescription.upsert({
        where: { consultationId: id },
        create: {
          consultationId: id,
          patientId: existing.patientId,
          doctorId,
          notes: data.prescription.notes ?? null,
        },
        update: {
          notes: data.prescription.notes ?? null,
        },
      });

      await tx.prescriptionItem.deleteMany({
        where: { prescriptionId: prescription.id },
      });

      if (data.prescription.items.length > 0) {
        await tx.prescriptionItem.createMany({
          data: data.prescription.items.map((item) => ({
            prescriptionId: prescription.id,
            medicineName: item.medicineName,
            dosage: item.dosage ?? null,
            frequency: item.frequency ?? null,
            duration: item.duration ?? null,
            instructions: item.instructions ?? null,
            quantity: item.quantity ?? null,
          })),
        });
      }
    }

    return getConsultationById(id);
  });
}

export async function completeConsultation(id, doctorId) {
  const consultation = await getConsultationById(id);

  if (consultation.doctorId !== doctorId) {
    throw new ApiError(403, "You cannot complete this consultation");
  }

  return prisma.consultation.update({
    where: { id },
    data: { status: "COMPLETED" },
  });
}

export async function deleteConsultation(id, doctorId) {
  const consultation = await getConsultationById(id);

  if (consultation.doctorId !== doctorId) {
    throw new ApiError(403, "You cannot delete this consultation");
  }

  return prisma.consultation.delete({
    where: { id },
  });
}
