import Production from "./production.model.js";
import { Batch } from "../batch/batch.model.js";

// Get all production records for logged-in user's farm
const getProduction = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }
    
    const batches = await Batch.find({ farmId: user.farmId });
    const batchIds = batches.map((batch) => batch.id);

    const production = await Production.find({ batchId: { $in: batchIds } })
      .sort({ createdAt: -1 });

    // Enhance production records with calculated fields
    const enhancedProduction = production.map(prod => {
      const batch = batches.find(b => b.id === prod.batchId);
      const prodObj = prod.toObject();
      
      // Calculate production rate if batch is found
      if (batch && batch.currentCount > 0) {
        prodObj.productionRate = ((prod.numberOfEggsCollected / batch.currentCount) * 100).toFixed(1);
      } else {
        prodObj.productionRate = 0;
      }
      
      // Add tray breakdown
      const trayBreakdown = Production.calculateTrayBreakdown(prod.numberOfEggsCollected);
      prodObj.trayBreakdown = trayBreakdown;
      
      return prodObj;
    });

    res.status(200).json(enhancedProduction);
  } catch (error) {
    console.error("Error getting production records:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createProduction = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const { 
      batchId, 
      date, 
      numberOfDeadBirds, 
      numberOfEggsCollected,
      numberOfTrays,
      extraEggs,
      notes 
    } = req.body;

    // Find and validate batch
    const batch = await Batch.findOne({ id: batchId, farmId: user.farmId });
    if (!batch) {
      return res
        .status(404)
        .json({ message: "Batch not found or unauthorized" });
    }

    // Calculate total eggs from trays if tray data is provided
    let totalEggs = numberOfEggsCollected || 0;
    let trays = numberOfTrays || 0;
    let extraEggsCount = extraEggs || 0;

    // If tray data is provided, calculate total eggs
    if (numberOfTrays !== undefined || extraEggs !== undefined) {
      totalEggs = (trays * 30) + extraEggsCount; // 30 eggs per tray
    } else if (numberOfEggsCollected !== undefined) {
      // If only total eggs provided, calculate tray breakdown
      const breakdown = Production.calculateTrayBreakdown(numberOfEggsCollected);
      trays = breakdown.trays;
      extraEggsCount = breakdown.extraEggs;
    }

    // Validate egg count against current bird count
    const validation = Production.validateEggCount(totalEggs, batch.currentCount);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: validation.message,
        currentBirdCount: batch.currentCount,
        requestedEggCount: totalEggs
      });
    }

    // Create production record
    const newProduction = new Production({
      batchId,
      date,
      numberOfDeadBirds: numberOfDeadBirds || 0,
      numberOfEggsCollected: totalEggs,
      numberOfTrays: trays,
      extraEggs: extraEggsCount,
      notes
    });

    // Calculate and set production rate
    newProduction.calculateProductionRate(batch.currentCount);

    await newProduction.save();

    // Return enhanced response with tray breakdown
    const response = {
      ...newProduction.toObject(),
      trayBreakdown: Production.calculateTrayBreakdown(totalEggs),
      productionRate: newProduction.productionRate,
      batchInfo: {
        name: batch.name,
        currentCount: batch.currentCount,
        chickenType: batch.chickenType
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating production record:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProductionById = async (req, res) => {
  try {
    const user = req.user;
    const productionId = req.params.id;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const production = await Production.findOne({ id: productionId });

    if (!production) {
      return res.status(404).json({ message: "Production record not found" });
    }

    // Verify user has access to this production record
    const batch = await Batch.findOne({
      id: production.batchId,
      farmId: user.farmId,
    });
    if (!batch) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this production record" });
    }

    // Enhance response with calculated fields
    const response = {
      ...production.toObject(),
      trayBreakdown: Production.calculateTrayBreakdown(production.numberOfEggsCollected),
      productionRate: production.calculateProductionRate(batch.currentCount),
      batchInfo: {
        name: batch.name,
        currentCount: batch.currentCount,
        chickenType: batch.chickenType
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting production record:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateProduction = async (req, res) => {
  try {
    const user = req.user;
    const productionId = req.params.id;
    const updates = req.body;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const production = await Production.findOne({ id: productionId });
    if (!production) {
      return res.status(404).json({ message: "Production record not found" });
    }

    // Verify user has access to this production record
    const batch = await Batch.findOne({
      id: production.batchId,
      farmId: user.farmId,
    });
    if (!batch) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this production record" });
    }

    // Handle tray-based updates
    let totalEggs = updates.numberOfEggsCollected;
    let trays = updates.numberOfTrays;
    let extraEggs = updates.extraEggs;

    // Calculate total eggs from trays if tray data is provided
    if (updates.numberOfTrays !== undefined || updates.extraEggs !== undefined) {
      trays = updates.numberOfTrays || 0;
      extraEggs = updates.extraEggs || 0;
      totalEggs = (trays * 30) + extraEggs;
      updates.numberOfEggsCollected = totalEggs;
      updates.numberOfTrays = trays;
      updates.extraEggs = extraEggs;
    } else if (updates.numberOfEggsCollected !== undefined) {
      // If only total eggs provided, calculate tray breakdown
      const breakdown = Production.calculateTrayBreakdown(updates.numberOfEggsCollected);
      updates.numberOfTrays = breakdown.trays;
      updates.extraEggs = breakdown.extraEggs;
      totalEggs = updates.numberOfEggsCollected;
    }

    // Validate egg count if it's being updated
    if (totalEggs !== undefined) {
      const validation = Production.validateEggCount(totalEggs, batch.currentCount);
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: validation.message,
          currentBirdCount: batch.currentCount,
          requestedEggCount: totalEggs
        });
      }
    }

    // Update the production record
    const updated = await Production.findOneAndUpdate(
      { id: productionId },
      updates,
      { new: true, runValidators: true }
    );

    // Recalculate production rate
    if (totalEggs !== undefined) {
      updated.calculateProductionRate(batch.currentCount);
      await updated.save();
    }

    // Return enhanced response
    const response = {
      ...updated.toObject(),
      trayBreakdown: Production.calculateTrayBreakdown(updated.numberOfEggsCollected),
      productionRate: updated.productionRate,
      batchInfo: {
        name: batch.name,
        currentCount: batch.currentCount,
        chickenType: batch.chickenType
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error updating production record:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteProduction = async (req, res) => {
  try {
    const user = req.user;
    const productionId = req.params.id;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const production = await Production.findOne({ id: productionId });
    if (!production) {
      return res.status(404).json({ message: "Production record not found" });
    }

    // Verify user has access to this production record
    const batch = await Batch.findOne({
      id: production.batchId,
      farmId: user.farmId,
    });
    if (!batch) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this production record" });
    }

    await Production.findOneAndDelete({ id: productionId });

    res.status(200).json({ message: "Production record deleted successfully" });
  } catch (error) {
    console.error("Error deleting production record:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// New endpoint to get production statistics with tray breakdown
const getProductionStats = async (req, res) => {
  try {
    const user = req.user;
    const { batchId, startDate, endDate } = req.query;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    // Build query
    let query = {};
    
    if (batchId) {
      // Verify batch belongs to user's farm
      const batch = await Batch.findOne({ id: batchId, farmId: user.farmId });
      if (!batch) {
        return res.status(404).json({ message: "Batch not found or unauthorized" });
      }
      query.batchId = batchId;
    } else {
      // Get all batches for the farm
      const batches = await Batch.find({ farmId: user.farmId });
      const batchIds = batches.map((batch) => batch.id);
      query.batchId = { $in: batchIds };
    }

    // Add date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get production records
    const productions = await Production.find(query).sort({ date: -1 });

    // Calculate statistics
    const stats = {
      totalRecords: productions.length,
      totalEggs: productions.reduce((sum, p) => sum + (p.numberOfEggsCollected || 0), 0),
      totalTrays: productions.reduce((sum, p) => sum + (p.numberOfTrays || 0), 0),
      totalExtraEggs: productions.reduce((sum, p) => sum + (p.extraEggs || 0), 0),
      totalMortality: productions.reduce((sum, p) => sum + (p.numberOfDeadBirds || 0), 0),
      averageProductionRate: 0,
      eggsPerTray: 30
    };

    // Calculate average production rate
    const ratesSum = productions.reduce((sum, p) => sum + (p.productionRate || 0), 0);
    stats.averageProductionRate = productions.length > 0 ? ratesSum / productions.length : 0;

    // Calculate daily averages if date range is provided
    if (startDate && endDate) {
      const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
      stats.dailyAverages = {
        eggsPerDay: stats.totalEggs / daysDiff,
        traysPerDay: stats.totalTrays / daysDiff,
        mortalityPerDay: stats.totalMortality / daysDiff
      };
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting production statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default {
  getProduction,
  createProduction,
  getProductionById,
  updateProduction,
  deleteProduction,
  getProductionStats, // New endpoint
};