import express from "express";
import diagnosisController from "./diagnosis.controller.js";
import multer from "multer";
import authMiddleware from "../../config/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single('image'), diagnosisController.createDiagnosis);
router.get("/", diagnosisController.getDiagnosesByFarm);
router.get("/:id", diagnosisController.getDiagnosisById);
router.put("/:id", diagnosisController.updateDiagnosis);
router.delete("/:id", diagnosisController.deleteDiagnosis);

export default router;
