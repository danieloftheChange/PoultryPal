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

// PERFORMANCE: Add indexes for frequently queried fields
batchSchema.index({ farmId: 1, isArchived: 1 }); // Common filter combination
batchSchema.index({ farmId: 1, chickenType: 1 }); // Filter by type
batchSchema.index({ farmId: 1, createdAt: -1 }); // Sorting by date
batchSchema.index({ farmId: 1, name: 1 }); // Search by name

// Virtual field to calculate current count
batchSchema.virtual('currentCount').get(function() {
  return this.originalCount - (this.dead + this.culled + this.offlaid);
});

// Method to get allocated count (must be called with await)
batchSchema.methods.getAllocatedCount = async function() {
  const BatchAllocation = mongoose.model('BatchAllocation');
  const allocations = await BatchAllocation.find({ batchId: this.id });
  return allocations.reduce((sum, allocation) => sum + allocation.quantity, 0);
};

// Method to get unallocated count (must be called with await)
batchSchema.methods.getUnallocatedCount = async function() {
  const allocatedCount = await this.getAllocatedCount();
  return this.currentCount - allocatedCount;
};

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

// PERFORMANCE: Add indexes for allocation queries
batchAllocationSchema.index({ batchId: 1 });
batchAllocationSchema.index({ houseId: 1 });
batchAllocationSchema.index({ batchId: 1, houseId: 1 });

const BatchAllocation = mongoose.model("BatchAllocation", batchAllocationSchema);

export { Batch, BatchAllocation };