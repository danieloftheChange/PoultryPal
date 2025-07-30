import express from "express";
import productionController from "./production.controller.js";
import authMiddleware from "../../config/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", productionController.getProduction);
router.post("/", productionController.createProduction);
router.get("/:id", productionController.getProductionById);
router.patch("/:id", productionController.updateProduction);
router.delete("/:id", productionController.deleteProduction);

export default router;
