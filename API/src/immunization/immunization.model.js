import mongoose from 'mongoose';
import { v4 as uuidv4 } from "uuid";

const immunizationSchema = new mongoose.Schema({
    id: { type: String, default: uuidv4, unique: true, required: true },
    house: { type: mongoose.Schema.Types.ObjectId, ref: "House", required: true, index: true },
    scheduledStartDate: { type: Date, required: true }, 
    scheduledEndDate: { type: Date }, 
    vaccineName: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
    reminderSent: { type: Boolean, default: false },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }, 
  { timestamps: true }
);

const Immunization = mongoose.model("Immunization", immunizationSchema);
export default Immunization;
