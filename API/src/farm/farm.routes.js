import express from "express";
import farmController from "./farm.controller.js";

const router = express.Router();

/**
 * @swagger
 * /farm:
 *   post:
 *     summary: Create a new farm
 *     description: Add a new farm to the system.
 *     tags:
 *       - Farm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the farm.
 *                 example: Sunny Farm
 *               location:
 *                 type: string
 *                 description: Location of the farm.
 *                 example: "123 Farm Lane"
 *     responses:
 *       201:
 *         description: Farm created successfully.
 *       500:
 *         description: Internal server error.
 */
router.post("/", farmController.createFarm);

/**
 * @swagger
 * /farm:
 *   get:
 *     summary: Get all farms
 *     description: Fetch a list of all farms.
 *     tags:
 *       - Farm
 *     responses:
 *       200:
 *         description: A list of farms.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   location:
 *                     type: string
 *       500:
 *         description: Internal server error.
 */
router.get("/", farmController.getFarms);

/**
 * @swagger
 * /farm/{farmId}:
 *   get:
 *     summary: Get farm by ID
 *     description: Fetch a single farm by its ID.
 *     tags:
 *       - Farm
 *     parameters:
 *       - in: path
 *         name: farmId
 *         required: true
 *         description: ID of the farm.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Farm details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 location:
 *                   type: string
 *       404:
 *         description: Farm not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/:id", farmController.getFarm);

/**
 * @swagger
 * /farm/{farmId}:
 *   patch:
 *     summary: Update farm details
 *     description: Update the details of an existing farm.
 *     tags:
 *       - Farm
 *     parameters:
 *       - in: path
 *         name: farmId
 *         required: true
 *         description: ID of the farm.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Farm updated successfully.
 *       400:
 *         description: Invalid farm ID or input.
 *       500:
 *         description: Internal server error.
 */
router.patch("/:id", farmController.updateFarm);

/**
 * @swagger
 * /farm/{farmId}:
 *   delete:
 *     summary: Delete a farm
 *     description: Delete a farm from the system.
 *     tags:
 *       - Farm
 *     parameters:
 *       - in: path
 *         name: farmId
 *         required: true
 *         description: ID of the farm.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Farm deleted successfully.
 *       400:
 *         description: Invalid farm ID.
 *       500:
 *         description: Internal server error.
 */
router.delete("/:id", farmController.deleteFarm);

export default router;
