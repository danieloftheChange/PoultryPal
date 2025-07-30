import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const batchSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, required: true },
    farmId: { type: String, required: true },
    name: { type: String, required: true },
    arrivalDate: { type: Date, required: true },
    ageAtArrival: { type: Number, required: true },
    age: { type: Number },
    chickenType: { type: String, required: true },
    originalCount: { type: Number, required: true }, // Renamed from quantity
    supplier: { type: String, required: true },
    dead: { type: Number, default: 0 }, // Number of birds that died
    culled: { type: Number, default: 0 }, // Number of birds that were culled
    offlaid: { type: Number, default: 0 }, // Number of birds that were offlaid/sold
    isArchived: { type: Boolean, default: false },
  },
  { 
    timestamps: true,
    // Add virtual field for current count
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field to calculate current count
batchSchema.virtual('currentCount').get(function() {
  return this.originalCount - (this.dead + this.culled + this.offlaid);
});

const Batch = mongoose.model("Batch", batchSchema);

const batchAllocationSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, required: true },
    batchId: { type: String, required: true },
    houseId: { type: String, required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);
const BatchAllocation = mongoose.model("BatchAllocation", batchAllocationSchema);

export { Batch, BatchAllocation };