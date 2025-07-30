import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const productionSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, required: true },
    batchId: { type: String, required: true },
    date: { type: Date, default: Date.now, index: true },
    numberOfDeadBirds: { type: Number, default: 0 },
    numberOfEggsCollected: { type: Number, default: 0 },
    
    // New tray-based fields
    numberOfTrays: { 
      type: Number, 
      default: 0,
      validate: {
        validator: function(v) {
          return v >= 0;
        },
        message: 'Number of trays must be non-negative'
      }
    },
    extraEggs: { 
      type: Number, 
      default: 0,
      validate: {
        validator: function(v) {
          return v >= 0 && v <= 29;
        },
        message: 'Extra eggs must be between 0 and 29'
      }
    },
    
    // Production rate calculation (percentage)
    productionRate: { 
      type: Number, 
      default: 0,
      validate: {
        validator: function(v) {
          return v >= 0 && v <= 100;
        },
        message: 'Production rate must be between 0 and 100 percent'
      }
    },
    
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Constants
const EGGS_PER_TRAY = 30;

// Pre-save middleware to calculate numberOfEggsCollected from trays and extra eggs
productionSchema.pre('save', function(next) {
  // Calculate total eggs from trays and extra eggs
  if (this.numberOfTrays !== undefined || this.extraEggs !== undefined) {
    const trays = this.numberOfTrays || 0;
    const extraEggs = this.extraEggs || 0;
    this.numberOfEggsCollected = (trays * EGGS_PER_TRAY) + extraEggs;
  }
  
  // If numberOfEggsCollected is set directly, calculate trays and extra eggs
  if (this.numberOfEggsCollected !== undefined && (this.numberOfTrays === undefined && this.extraEggs === undefined)) {
    const totalEggs = this.numberOfEggsCollected || 0;
    this.numberOfTrays = Math.floor(totalEggs / EGGS_PER_TRAY);
    this.extraEggs = totalEggs % EGGS_PER_TRAY;
  }
  
  next();
});

// Virtual field to get eggs per tray constant
productionSchema.virtual('eggsPerTray').get(function() {
  return EGGS_PER_TRAY;
});

// Virtual field to calculate total production value
productionSchema.virtual('totalProductionValue').get(function() {
  return {
    trays: this.numberOfTrays || 0,
    extraEggs: this.extraEggs || 0,
    totalEggs: this.numberOfEggsCollected || 0,
    productionRate: this.productionRate || 0
  };
});

// Instance method to calculate production rate based on batch current count
productionSchema.methods.calculateProductionRate = function(batchCurrentCount) {
  if (!batchCurrentCount || batchCurrentCount === 0) {
    this.productionRate = 0;
    return 0;
  }
  
  const rate = (this.numberOfEggsCollected / batchCurrentCount) * 100;
  this.productionRate = Math.round(rate * 10) / 10; // Round to 1 decimal place
  return this.productionRate;
};

// Static method to validate egg count against batch count
productionSchema.statics.validateEggCount = function(eggCount, batchCurrentCount) {
  if (!batchCurrentCount || batchCurrentCount === 0) {
    return {
      isValid: eggCount === 0,
      message: eggCount === 0 ? 'Valid' : 'No birds in batch, egg count must be 0'
    };
  }
  
  const isValid = eggCount <= batchCurrentCount;
  return {
    isValid: isValid,
    message: isValid 
      ? 'Valid' 
      : `Egg count (${eggCount}) cannot exceed current bird count (${batchCurrentCount})`
  };
};

// Static method to calculate tray breakdown from egg count
productionSchema.statics.calculateTrayBreakdown = function(totalEggs) {
  const trays = Math.floor(totalEggs / EGGS_PER_TRAY);
  const extraEggs = totalEggs % EGGS_PER_TRAY;
  return {
    trays: trays,
    extraEggs: extraEggs,
    totalEggs: totalEggs,
    eggsPerTray: EGGS_PER_TRAY
  };
};

// Index for efficient querying
productionSchema.index({ batchId: 1, date: -1 });
productionSchema.index({ date: -1 });
productionSchema.index({ batchId: 1, createdAt: -1 });

const Production = mongoose.model("Production", productionSchema);
export default Production;