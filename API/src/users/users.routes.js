import express from "express";
import userController from "./users.controller.js";
import authMiddleware from "../../config/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create a new user
 *     description: Add a new user to the system.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               farmId:
 *                 type: string
 *                 description: ID of the farm the user belongs to.
 *                 example: "12345"
 *               firstName:
 *                 type: string
 *                 description: First name of the user.
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: Last name of the user.
 *                 example: Doe
 *               role:
 *                 type: string
 *                 enum: [Worker, Manager]
 *                 description: Role of the user.
 *                 example: Manager
 *               email:
 *                 type: string
 *                 description: Email of the user.
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 description: Password for the user.
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: User created successfully.
 *       400:
 *         description: Bad request or email already exists.
 *       500:
 *         description: Internal server error.
 */
router.post("/signup", userController.signup);

router.post("/register", authMiddleware, userController.registerUser);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     description: Fetch a list of all users.
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   farmId:
 *                     type: string
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   role:
 *                     type: string
 *                   email:
 *                     type: string
 *       500:
 *         description: Internal server error.
 */
router.get("/staff", authMiddleware, userController.getStaff);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Fetch a single user by their ID.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 farmId:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 role:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
// router.get("/:id", userController.getUserById);

/**
 * @swagger
 * /user/{id}:
 *   patch:
 *     summary: Update user details
 *     description: Update the details of an existing user.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
// router.patch("/:id", userController.updateUser);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user from the system.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
// router.delete("/:id", userController.deleteUser);

router.post("/login", userController.login);

export default router;
