import { loginSchema, changePasswordSchema } from "../validators/auth.validators.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { changeDoctorPassword, loginDoctor } from "../services/auth.service.js";

export const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);
  const result = await loginDoctor(data);
  res.json(result);
});

export const me = asyncHandler(async (req, res) => {
  res.json({ doctor: req.user });
});

export const logout = asyncHandler(async (_req, res) => {
  res.json({ message: "Logout successful" });
});

export const changePassword = asyncHandler(async (req, res) => {
  const data = changePasswordSchema.parse(req.body);
  await changeDoctorPassword(req.user.id, data.currentPassword, data.newPassword);
  res.json({ message: "Password updated successfully" });
});
