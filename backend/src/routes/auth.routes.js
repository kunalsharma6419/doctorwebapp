import { Router } from "express";
import { changePassword, login, logout, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.post("/change-password", requireAuth, changePassword);

export default router;
