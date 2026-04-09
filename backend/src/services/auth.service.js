import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { signToken } from "../utils/jwt.js";

export async function loginDoctor(data) {
  const doctor = await prisma.doctor.findUnique({
    where: { email: data.email },
  });

  if (!doctor) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(data.password, doctor.passwordHash);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken({ sub: doctor.id, email: doctor.email });

  return {
    token,
    doctor: {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
    },
  };
}

export async function changeDoctorPassword(doctorId, currentPassword, newPassword) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, doctor.passwordHash);

  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.doctor.update({
    where: { id: doctorId },
    data: { passwordHash },
  });
}
