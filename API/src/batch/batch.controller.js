import { Batch, BatchAllocation } from "./batch.model.js";
import House from "../house/house.model.js";
import logger from "../../config/logger.js";
import BirdCountHistory from "./birdCountHistory.model.js";

// Get all batches for the logged-in user's farm
const getBatches = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const batches = await Batch.find({ farmId: user.farmId }).sort({ createdAt: -1 });

    // Optionally include allocation data if requested
    if (req.query.includeAllocations === 'true') {
      // Fetch all allocations for this farm's batches in one query
      const batchIds = batches.map(b => b.id);
      const allAllocations = await BatchAllocation.find({ batchId: { $in: batchIds } });

      // Group allocations by batchId
      const allocationsByBatch = allAllocations.reduce((acc, alloc) => {
        if (!acc[alloc.batchId]) acc[alloc.batchId] = [];
        acc[alloc.batchId].push(alloc);
        return acc;
      }, {});

      // Enhance batches with allocation data
      const batchesWithAllocations = batches.map(batch => {
        const batchAllocations = allocationsByBatch[batch.id] || [];
        const allocatedCount = batchAllocations.reduce((sum, a) => sum + a.quantity, 0);
        const unallocatedCount = batch.currentCount - allocatedCount;

        return {
          ...batch.toObject(),
          allocatedCount,
          unallocatedCount
        };
      });

      return res.status(200).json(batchesWithAllocations);
    }

    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createBatch = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }
    const { name, arrivalDate, ageAtArrival, chickenType, originalCount, supplier } =
      req.body;

    const newBatch = new Batch({
      farmId: user.farmId,
      name,
      arrivalDate,
      ageAtArrival,
      chickenType,
      originalCount, // Use originalCount instead of quantity
      supplier,
      dead: 0, // Initialize tracking attributes
      culled: 0,
      offlaid: 0,
    });

    await newBatch.save();
    res.status(201).json(newBatch);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBatchById = async (req, res) => {
  try {
    const user = req.user;
    const batchId = req.params.id;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const batch = await Batch.findOne({ id: batchId, farmId: user.farmId });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// New endpoint to get batch availability (allocated/unallocated counts)
const getBatchAvailability = async (req, res) => {
  try {
    const user = req.user;
    const batchId = req.params.id;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const batch = await Batch.findOne({ id: batchId, farmId: user.farmId });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const allocatedCount = await batch.getAllocatedCount();
    const unallocatedCount = await batch.getUnallocatedCount();

    res.status(200).json({
      batchId: batch.id,
      batchName: batch.name,
      originalCount: batch.originalCount,
      dead: batch.dead,
      culled: batch.culled,
      offlaid: batch.offlaid,
      currentCount: batch.currentCount,
      allocatedCount: allocatedCount,
      unallocatedCount: unallocatedCount
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateBatch = async (req, res) => {
  try {
    const user = req.user;
    const batchId = req.params.id;
    const updates = req.body;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    // Validate tracking attributes if provided
    if (updates.dead !== undefined || updates.culled !== undefined || updates.offlaid !== undefined) {
      const batch = await Batch.findOne({ id: batchId, farmId: user.farmId });
      if (!batch) {
        return res.status(404).json({ message: "Batch not found or unauthorized" });
      }

      const newDead = updates.dead !== undefined ? updates.dead : batch.dead;
      const newCulled = updates.culled !== undefined ? updates.culled : batch.culled;
      const newOfflaid = updates.offlaid !== undefined ? updates.offlaid : batch.offlaid;

      // Ensure the sum doesn't exceed original count
      if (newDead + newCulled + newOfflaid > batch.originalCount) {
        return res.status(400).json({ 
          message: "Total of dead, culled, and offlaid birds cannot exceed original count" 
        });
      }

      // Ensure all values are non-negative
      if (newDead < 0 || newCulled < 0 || newOfflaid < 0) {
        return res.status(400).json({ 
          message: "Dead, culled, and offlaid counts must be non-negative" 
        });
      }
    }

    const batch = await Batch.findOneAndUpdate(
      { id: batchId, farmId: user.farmId },
      updates,
      { new: true }
    );

    if (!batch) {
      return res
        .status(404)
        .json({ message: "Batch not found or unauthorized" });
    }

    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const user = req.user;
    const batchId = req.params.id;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const batch = await Batch.findOneAndDelete({
      id: batchId,
      farmId: user.farmId,
    });

    if (!batch) {
      return res
        .status(404)
        .json({ message: "Batch not found or unauthorized" });
    }

    res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// New endpoint to update bird counts (dead, culled, offlaid)
const updateBirdCounts = async (req, res) => {
  try {
    const user = req.user;
    const batchId = req.params.id;
    const { dead, culled, offlaid, reason, notes } = req.body;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    // Validate that at least one count is provided
    if (dead === undefined && culled === undefined && offlaid === undefined) {
      return res.status(400).json({ message: "At least one count (dead, culled, or offlaid) must be provided" });
    }

    // Validate all provided values are non-negative integers
    if ((dead !== undefined && (dead < 0 || !Number.isInteger(dead))) ||
        (culled !== undefined && (culled < 0 || !Number.isInteger(culled))) ||
        (offlaid !== undefined && (offlaid < 0 || !Number.isInteger(offlaid)))) {
      return res.status(400).json({
        message: "Bird counts must be non-negative integers"
      });
    }

    // First, get current batch to validate
    const batch = await Batch.findOne({ id: batchId, farmId: user.farmId });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found or unauthorized" });
    }

    // Calculate new totals
    const newDead = dead !== undefined ? batch.dead + dead : batch.dead;
    const newCulled = culled !== undefined ? batch.culled + culled : batch.culled;
    const newOfflaid = offlaid !== undefined ? batch.offlaid + offlaid : batch.offlaid;

    // Validate totals don't exceed original count
    if (newDead + newCulled + newOfflaid > batch.originalCount) {
      return res.status(400).json({
        message: "Total of dead, culled, and offlaid birds cannot exceed original count",
        currentTotal: batch.dead + batch.culled + batch.offlaid,
        originalCount: batch.originalCount,
        requestedAddition: (dead || 0) + (culled || 0) + (offlaid || 0)
      });
    }

    // Store before state for audit trail
    const beforeState = {
      dead: batch.dead,
      culled: batch.culled,
      offlaid: batch.offlaid,
      currentCount: batch.currentCount
    };

    // CRITICAL FIX: Use atomic $inc operation to prevent race conditions
    const incrementUpdate = {};
    if (dead !== undefined) incrementUpdate.dead = dead;
    if (culled !== undefined) incrementUpdate.culled = culled;
    if (offlaid !== undefined) incrementUpdate.offlaid = offlaid;

    const updatedBatch = await Batch.findOneAndUpdate(
      { id: batchId, farmId: user.farmId },
      { $inc: incrementUpdate },
      { new: true }
    );

    if (!updatedBatch) {
      return res.status(404).json({ message: "Batch not found or unauthorized" });
    }

    // Create audit trail record
    const historyEntry = new BirdCountHistory({
      batchId: batch.id,
      farmId: user.farmId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      dead: dead || 0,
      culled: culled || 0,
      offlaid: offlaid || 0,
      reason: reason || '',
      notes: notes || '',
      beforeState: beforeState,
      afterState: {
        dead: updatedBatch.dead,
        culled: updatedBatch.culled,
        offlaid: updatedBatch.offlaid,
        currentCount: updatedBatch.currentCount
      }
    });

    await historyEntry.save();

    res.status(200).json({
      message: "Bird counts updated successfully",
      batch: updatedBatch,
      changes: {
        dead: dead || 0,
        culled: culled || 0,
        offlaid: offlaid || 0
      },
      historyId: historyEntry.id
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createBatchAllocation = async (req, res) => {
  try {
    const user = req.user;
    const { batchId, houseId, quantity } = req.body;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const batch = await Batch.findOne({ id: batchId, farmId: user.farmId });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // CRITICAL FIX: Check total allocations, not just current count
    const allocatedCount = await batch.getAllocatedCount();
    const unallocatedCount = batch.currentCount - allocatedCount;

    if (quantity > unallocatedCount) {
      return res.status(400).json({
        message: "Not enough unallocated birds available in batch",
        currentCount: batch.currentCount,
        allocatedCount: allocatedCount,
        unallocatedCount: unallocatedCount,
        requestedQuantity: quantity
      });
    }

    const house = await House.findOne({ id: houseId, farmId: user.farmId });
    if (!house) {
      return res
        .status(404)
        .json({ message: "House not found or unauthorized" });
    }

    const existingAllocation = await BatchAllocation.findOne({
      batchId,
      houseId,
    });
    const existingQuantity = existingAllocation
      ? existingAllocation.quantity
      : 0;
    const totalQuantity = existingQuantity + quantity;

    // Check house capacity
    if (house.capacity && totalQuantity > house.capacity) {
      return res
        .status(400)
        .json({ message: "Allocation exceeds house capacity" });
    }

    // CRITICAL FIX: Also check total house occupancy across all batches
    const allHouseAllocations = await BatchAllocation.find({ houseId });
    const currentHouseOccupancy = allHouseAllocations.reduce(
      (sum, alloc) => sum + alloc.quantity,
      0
    );
    const newTotalOccupancy = currentHouseOccupancy + quantity;

    if (house.capacity && newTotalOccupancy > house.capacity) {
      return res.status(400).json({
        message: "Adding this allocation would exceed house capacity",
        houseCapacity: house.capacity,
        currentOccupancy: currentHouseOccupancy,
        requestedAddition: quantity,
        availableSpace: house.capacity - currentHouseOccupancy
      });
    }

    let allocation;
    if (existingAllocation) {
      existingAllocation.quantity += quantity;
      allocation = await existingAllocation.save();
    } else {
      allocation = new BatchAllocation({ batchId, houseId, quantity });
      await allocation.save();
    }

    // Don't modify the originalCount, but we could track allocations separately if needed
    res.status(201).json(allocation);
  } catch (error) {
    logger.error("Batch Allocation Error", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBatchAllocations = async (req, res) => {
  try {
    const user = req.user;
    const { batchId } = req.params;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const batch = await Batch.findOne({ id: batchId, farmId: user.farmId });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const allocations = await BatchAllocation.find({ batchId }).sort({ createdAt: -1 });
    res.status(200).json(allocations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getHouseBatchAllocations = async (req, res) => {
  try {
    const user = req.user;
    const { houseId } = req.params;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const house = await House.findOne({ id: houseId, farmId: user.farmId });
    if (!house) {
      return res
        .status(404)
        .json({ message: "House not found or unauthorized" });
    }

    const allocations = await BatchAllocation.find({ houseId: houseId }).sort({ createdAt: -1 });
    res.status(200).json(allocations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateBatchAllocation = async (req, res) => {
  try {
    const user = req.user;
    const allocationId = req.params.id;
    const { quantity } = req.body;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const allocation = await BatchAllocation.findOne({ id: allocationId });
    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }

    const batch = await Batch.findOne({
      id: allocation.batchId,
      farmId: user.farmId,
    });
    if (!batch) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this allocation" });
    }

    const house = await House.findOne({
      id: allocation.houseId,
      farmId: user.farmId,
    });
    if (!house) {
      return res
        .status(404)
        .json({ message: "House not found or unauthorized" });
    }

    if (house.capacity && quantity > house.capacity) {
      return res
        .status(400)
        .json({ message: "Updated quantity exceeds house capacity" });
    }

    allocation.quantity = quantity;
    await allocation.save();

    res.status(200).json(allocation);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const transferBirds = async (req, res) => {
  try {
    const user = req.user;
    const { batchId, fromHouseId, toHouseId, quantity } = req.body;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const batch = await Batch.findOne({ id: batchId, farmId: user.farmId });
    if (!batch) {
      return res
        .status(404)
        .json({ message: "Batch not found or unauthorized" });
    }

    const fromAllocation = await BatchAllocation.findOne({
      batchId,
      houseId: fromHouseId,
    });

    if (!fromAllocation || fromAllocation.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient birds to transfer" });
    }

    const toHouse = await House.findOne({ id: toHouseId, farmId: user.farmId });
    if (!toHouse) {
      return res
        .status(404)
        .json({ message: "Destination house not found or unauthorized" });
    }

    const toAllocation = await BatchAllocation.findOne({
      batchId,
      houseId: toHouseId,
    });

    const currentToQuantity = toAllocation ? toAllocation.quantity : 0;
    const totalToQuantity = currentToQuantity + quantity;

    if (toHouse.capacity && totalToQuantity > toHouse.capacity) {
      return res
        .status(400)
        .json({ message: "Transfer exceeds destination house capacity" });
    }

    fromAllocation.quantity -= quantity;
    await fromAllocation.save();

    if (toAllocation) {
      toAllocation.quantity += quantity;
      await toAllocation.save();
    } else {
      const newAllocation = new BatchAllocation({
        batchId,
        houseId: toHouseId,
        quantity,
      });
      await newAllocation.save();
    }

    res.status(200).json({
      message: "Birds transferred successfully",
      from: fromAllocation,
      to: toAllocation || newAllocation,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get bird count history for a batch
const getBirdCountHistory = async (req, res) => {
  try {
    const user = req.user;
    const batchId = req.params.id;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    // Verify batch belongs to user's farm
    const batch = await Batch.findOne({ id: batchId, farmId: user.farmId });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found or unauthorized" });
    }

    // Get history sorted by most recent first
    const history = await BirdCountHistory.find({ batchId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 entries

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default {
  getBatches,
  createBatch,
  getBatchById,
  getBatchAvailability,
  updateBatch,
  deleteBatch,
  createBatchAllocation,
  getBatchAllocations,
  getHouseBatchAllocations,
  updateBatchAllocation,
  transferBirds,
  updateBirdCounts,
  getBirdCountHistory,
};