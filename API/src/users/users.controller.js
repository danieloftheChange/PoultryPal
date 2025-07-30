import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./users.model.js";
import Farm from "../farm/farm.model.js";

const JWT_SECRET =
  "f873c65e7bdf4e8aaf3e86a8a091b3f6c9d1452e47a6741d512af0f7df06a5a8";
const JWT_REFRESH_SECRET =
  "9c7b3a84f41d487ab987e4a77bc6e9d2f4824e8bdc3b4ef8a2f6c9d7435be5c9";

const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newFarm = new Farm({
      name: `${firstName}'s Farm`,
    });

    const savedFarm = await newFarm.save();

    const newUser = new User({
      farmId: savedFarm.id,
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User and Farm created successfully",
      user: savedUser,
      farm: savedFarm,
    });
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ message: "Error signing up", error: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const { firstName, lastName, role, contact, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      farmId: user.farmId,
      firstName,
      lastName,
      role,
      email,
      contact,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: savedUser,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

const getStaff = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const staff = await User.find({ farmId: user.farmId }).sort({ createdAt: -1 });

    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        farmId: user.farmId,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

export default {
  signup,
  login,
  registerUser,
  getStaff,
};
