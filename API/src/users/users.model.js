// const mongoose = require("mongoose");
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, required: true },
    farmId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ["Worker", "Manager"], default: "Manager" },
    email: { type: String, required: true, unique: true },
    contact: { type: String, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
