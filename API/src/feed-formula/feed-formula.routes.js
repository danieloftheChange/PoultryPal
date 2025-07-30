import express from "express";
import feedFormulaController from "./feed-formula.controller.js";
import authMiddleware from "../../config/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

/**
 * @swagger
 * /feed-formula:
 *   get:
 *     summary: Get all feed formulas for the farm
 *     description: Retrieve all feed formulas for the authenticated user's farm
 *     tags:
 *       - Feed Formula
 *     responses:
 *       200:
 *         description: List of feed formulas
 *       400:
 *         description: User does not belong to a farm
 *       500:
 *         description: Server error
 */
router.get("/", feedFormulaController.getFormulas);

/**
 * @swagger
 * /feed-formula/{id}:
 *   get:
 *     summary: Get feed formula by ID
 *     description: Retrieve a specific feed formula by its ID
 *     tags:
 *       - Feed Formula
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the feed formula
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feed formula details
 *       404:
 *         description: Feed formula not found
 *       500:
 *         description: Server error
 */
router.get("/:id", feedFormulaController.getFormulaById);

/**
 * @swagger
 * /feed-formula:
 *   post:
 *     summary: Create a new feed formula
 *     description: Create a new feed formula with ingredients and target nutrition
 *     tags:
 *       - Feed Formula
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unit:
 *                       type: string
 *                     cost:
 *                       type: number
 *               targetNutrition:
 *                 type: object
 *                 properties:
 *                   protein:
 *                     type: number
 *                   energy:
 *                     type: number
 *                   calcium:
 *                     type: number
 *                   phosphorus:
 *                     type: number
 *               targetGroup:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feed formula created successfully
 *       400:
 *         description: Invalid input or user does not belong to a farm
 *       500:
 *         description: Server error
 */
router.post("/", feedFormulaController.createFormula);

/**
 * @swagger
 * /feed-formula/{id}:
 *   patch:
 *     summary: Update feed formula
 *     description: Update an existing feed formula
 *     tags:
 *       - Feed Formula
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the feed formula
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
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *               targetNutrition:
 *                 type: object
 *               targetGroup:
 *                 type: string
 *               notes:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Feed formula updated successfully
 *       404:
 *         description: Feed formula not found
 *       500:
 *         description: Server error
 */
router.patch("/:id", feedFormulaController.updateFormula);

/**
 * @swagger
 * /feed-formula/{id}:
 *   delete:
 *     summary: Delete feed formula
 *     description: Delete a feed formula (soft delete by setting isActive to false)
 *     tags:
 *       - Feed Formula
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the feed formula
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feed formula deleted successfully
 *       404:
 *         description: Feed formula not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", feedFormulaController.deleteFormula);

/**
 * @swagger
 * /feed-formula/optimize:
 *   post:
 *     summary: Generate optimized feed formula
 *     description: Generate an optimized feed formula based on available ingredients and target nutrition
 *     tags:
 *       - Feed Formula
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               availableIngredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     nutritionProfile:
 *                       type: object
 *                     costPerKg:
 *                       type: number
 *                     maxInclusion:
 *                       type: number
 *               targetNutrition:
 *                 type: object
 *               targetGroup:
 *                 type: string
 *     responses:
 *       200:
 *         description: Optimized feed formula
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/optimize", feedFormulaController.optimizeFormula);

export default router;