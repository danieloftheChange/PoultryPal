import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const formulaSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, required: true },
    farmId: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    ingredients: [
      {
        name: { type: String, required: true, trim: true, maxlength: 50 },
        quantity: { type: Number, required: true, min: 0 },
        unit: { type: String, required: true, enum: ["kg", "g", "%"], default: "kg" },
        cost: { type: Number, min: 0 }
      },
    ],
    targetNutrition: {
      protein: { type: Number, min: 0, max: 100 },
      energy: { type: Number, min: 0 },
      calcium: { type: Number, min: 0 },
      phosphorus: { type: Number, min: 0 }
    },
    targetGroup: {
      type: String,
      enum: ["chicks", "growers", "layers", "broilers"],
      default: "layers",
    },
    totalCost: { type: Number, min: 0 },
    notes: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true } 
);

const Formula = mongoose.model("Formula", formulaSchema);
export default Formula;