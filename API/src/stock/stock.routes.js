import express from "express";
import stockController from "./stock.controller.js";
import authMiddleware from "../../config/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", stockController.getStock);
router.post("/", stockController.createStock);
router.get("/:id", stockController.getStockById);
router.patch("/:id", stockController.updateStock);
router.delete("/:id", stockController.deleteStock);

export default router;
