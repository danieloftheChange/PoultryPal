import Farm from "./farm.model.js";
import logger from "../../config/logger.js";

// Create a farm (only accessible by authenticated users)
const createFarm = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res.status(400).json({
        success: false,
        message: "User does not have a farm ID"
      });
    }

    // Users cannot create additional farms - they already have one from signup
    // If you want to allow multiple farms, remove this check and adjust logic
    const existingFarm = await Farm.findOne({ id: user.farmId });
    if (existingFarm) {
      return res.status(400).json({
        success: false,
        message: "User already has a farm"
      });
    }

    const newFarm = new Farm({
      ...req.body,
    });
    const savedFarm = await newFarm.save();

    res.status(201).json({
      success: true,
      message: "Farm created successfully",
      farm: savedFarm
    });
  } catch (error) {
    logger.error("Error creating farm:", { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Error creating farm",
      error: error.message
    });
  }
};

// Retrieve farm for the authenticated user
const getFarms = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res.status(400).json({
        success: false,
        message: "User does not belong to a farm"
      });
    }

    const farm = await Farm.findOne({ id: user.farmId });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found"
      });
    }

    // Return as array for backwards compatibility
    res.status(200).json([farm]);
  } catch (error) {
    logger.error("Error retrieving farms:", { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Error retrieving farms",
      error: error.message
    });
  }
};

// Retrieve the specific farm for authenticated user
const getFarm = async (req, res) => {
  try {
    const user = req.user;
    const farmId = req.params.id;

    if (!user.farmId) {
      return res.status(400).json({
        success: false,
        message: "User does not belong to a farm"
      });
    }

    // Ensure user can only access their own farm
    if (user.farmId !== farmId) {
      return res.status(403).json({
        success: false,
        message: "Access denied - not your farm"
      });
    }

    const farm = await Farm.findOne({ id: farmId });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found"
      });
    }

    res.status(200).json({
      success: true,
      farm
    });
  } catch (error) {
    logger.error("Error retrieving farm:", { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Error retrieving farm",
      error: error.message
    });
  }
};

// Update farm (user can only update their own farm)
const updateFarm = async (req, res) => {
  try {
    const user = req.user;
    const farmId = req.params.id;

    if (!user.farmId) {
      return res.status(400).json({
        success: false,
        message: "User does not belong to a farm"
      });
    }

    // Ensure user can only update their own farm
    if (user.farmId !== farmId) {
      return res.status(403).json({
        success: false,
        message: "Access denied - not your farm"
      });
    }

    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = ['name', 'location'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedFarm = await Farm.findOneAndUpdate(
      { id: farmId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedFarm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Farm updated successfully",
      farm: updatedFarm
    });
  } catch (error) {
    logger.error("Error updating farm:", { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Error updating farm",
      error: error.message
    });
  }
};

// Delete farm (user can only delete their own farm)
const deleteFarm = async (req, res) => {
  try {
    const user = req.user;
    const farmId = req.params.id;

    if (!user.farmId) {
      return res.status(400).json({
        success: false,
        message: "User does not belong to a farm"
      });
    }

    // Ensure user can only delete their own farm
    if (user.farmId !== farmId) {
      return res.status(403).json({
        success: false,
        message: "Access denied - not your farm"
      });
    }

    const deletedFarm = await Farm.findOneAndDelete({ id: farmId });

    if (!deletedFarm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Farm deleted successfully"
    });
  } catch (error) {
    logger.error("Error deleting farm:", { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Error deleting farm",
      error: error.message
    });
  }
};

export default {
  createFarm,
  getFarms,
  getFarm,
  updateFarm,
  deleteFarm,
};
