import { Router } from "express";
import {
  getHistory,
  getPatient,
  getPatients,
  postPatient,
  putPatient,
  removePatient,
} from "../controllers/patient.controller.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", getPatients);
router.post("/", postPatient);
router.get("/:id", getPatient);
router.put("/:id", putPatient);
router.delete("/:id", removePatient);
router.get("/:id/history", getHistory);

export default router;
