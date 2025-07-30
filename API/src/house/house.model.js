import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const houseSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, required: true },
    farmId: { type: String, required: true },
    name: { type: String, required: true },
    capacity: { type: Number },
    houseType: { type: String, enum: ["Caged", "Deep Litter"] },
    isMonitored: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const House = mongoose.model("House", houseSchema);
export default House;
