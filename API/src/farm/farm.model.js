import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const farmSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, required: true },
    name: { type: String, maxlength: 100 },
    location: { type: String, maxlength: 100 },
  },
  { timestamps: true }
);

const Farm = mongoose.model("Farm", farmSchema);
export default Farm;
