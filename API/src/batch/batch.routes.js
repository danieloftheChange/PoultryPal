import express from "express";
import batchController from "./batch.controller.js";
import authMiddleware from "../../config/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", batchController.getBatches);
router.post("/", batchController.createBatch);
router.get("/:id", batchController.getBatchById);
router.patch("/:id", batchController.updateBatch);
router.delete("/:id", batchController.deleteBatch);
router.patch("/:id/counts", batchController.updateBirdCounts);
router.post("/allocation", batchController.createBatchAllocation);
router.get("/allocations/:batchId", batchController.getBatchAllocations);
router.get("/allocation/:houseId", batchController.getHouseBatchAllocations);
router.patch("/allocation/:id", batchController.updateBatchAllocation);
router.post("/allocation/transfer", batchController.transferBirds);

export default router;