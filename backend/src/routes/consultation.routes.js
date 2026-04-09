import { Router } from "express";
import {
  getConsultation,
  getConsultationPrescription,
  getConsultations,
  patchCompleteConsultation,
  postConsultation,
  putConsultation,
  removeConsultation,
} from "../controllers/consultation.controller.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", getConsultations);
router.post("/", postConsultation);
router.get("/:id", getConsultation);
router.put("/:id", putConsultation);
router.delete("/:id", removeConsultation);
router.patch("/:id/complete", patchCompleteConsultation);
router.get("/:id/prescription", getConsultationPrescription);

export default router;
