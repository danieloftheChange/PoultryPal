import express from "express";
import houseController from "./house.controller.js";
import authMiddleware from "../../config/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", houseController.getHouses);
router.post("/", houseController.createHouse);
router.get("/:id", houseController.getHouseById);
router.patch("/:id", houseController.updateHouse);
router.delete("/:id", houseController.deleteHouse);

export default router;
