import express from "express";
import monitoringController from "./monitoring.controller.js";
import authMiddleware from "../../config/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, monitoringController.getSensorDataForHouse);
router.post("/", monitoringController.createSensorDataForHouse);

export default router;
