import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { verifyToken } from "../utils/jwt.js";

export async function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const payload = verifyToken(token);
    const doctor = await prisma.doctor.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        specialization: true,
      },
    });

    if (!doctor) {
      return next(new ApiError(401, "Doctor account not found"));
    }

    req.user = doctor;
    return next();
  } catch (_error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}
