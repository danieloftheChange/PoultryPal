import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const diagnosisSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, required: true },
    farmId: { type: String, required: true },
    imageUrl: { type: String },
    disease: { type: String },
    confidence: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

const Diagnosis = mongoose.model("Diagnosis", diagnosisSchema);

export default Diagnosis;
