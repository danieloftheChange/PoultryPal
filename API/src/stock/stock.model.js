import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const stockSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, required: true },
    farmId: { type: String, required: true },
    item: { type: String, required: true },
    category: { type: String, enum: ["Feed", "Equipment", "Medicine"], default: "Feed" },
    quantity: { type: Number, required: true },
    threshold: { type: Number },
  },
  { timestamps: true }
);

const Stock = mongoose.model("Stock", stockSchema);
export default Stock;
