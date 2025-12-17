import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const birdCountHistorySchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, required: true },
    batchId: { type: String, required: true },
    farmId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },

    // Changes made
    dead: { type: Number, default: 0 },
    culled: { type: Number, default: 0 },
    offlaid: { type: Number, default: 0 },

    // Context
    reason: { type: String },
    notes: { type: String },

    // State before and after
    beforeState: {
      dead: { type: Number },
      culled: { type: Number },
      offlaid: { type: Number },
      currentCount: { type: Number }
    },
    afterState: {
      dead: { type: Number },
      culled: { type: Number },
      offlaid: { type: Number },
      currentCount: { type: Number }
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
birdCountHistorySchema.index({ batchId: 1, createdAt: -1 });
birdCountHistorySchema.index({ farmId: 1, createdAt: -1 });

const BirdCountHistory = mongoose.model("BirdCountHistory", birdCountHistorySchema);

export default BirdCountHistory;
