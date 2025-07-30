import Formula from "./feed-formula.model.js";
import axios from "axios";

// Configuration for the optimization service
const OPTIMIZER_SERVICE_URL = process.env.FEED_OPTIMIZER_URL || "http://feed-optimizer:8000";

/**
 * Get all feed formulas for the user's farm
 */
const getFormulas = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const formulas = await Formula.find({ 
      farmId: user.farmId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json(formulas);
  } catch (error) {
    console.error("Error getting feed formulas:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get a feed formula by ID
 */
const getFormulaById = async (req, res) => {
  try {
    const user = req.user;
    const formulaId = req.params.id;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const formula = await Formula.findOne({ 
      id: formulaId, 
      farmId: user.farmId,
      isActive: true
    });

    if (!formula) {
      return res.status(404).json({ message: "Feed formula not found" });
    }

    res.status(200).json(formula);
  } catch (error) {
    console.error("Error getting feed formula:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a new feed formula
 */
const createFormula = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const { 
      name, 
      ingredients, 
      targetNutrition, 
      targetGroup, 
      notes 
    } = req.body;

    // Calculate total cost based on ingredients
    const totalCost = ingredients.reduce((sum, ingredient) => {
      return sum + (ingredient.quantity * (ingredient.cost || 0));
    }, 0);

    const newFormula = new Formula({
      farmId: user.farmId,
      name,
      ingredients,
      targetNutrition,
      targetGroup,
      totalCost,
      notes
    });

    const savedFormula = await newFormula.save();
    
    res.status(201).json(savedFormula);
  } catch (error) {
    console.error("Error creating feed formula:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update an existing feed formula
 */
const updateFormula = async (req, res) => {
  try {
    const user = req.user;
    const formulaId = req.params.id;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const { 
      name, 
      ingredients, 
      targetNutrition, 
      targetGroup, 
      notes,
      isActive
    } = req.body;

    // Calculate total cost if ingredients are provided
    let totalCost;
    if (ingredients) {
      totalCost = ingredients.reduce((sum, ingredient) => {
        return sum + (ingredient.quantity * (ingredient.cost || 0));
      }, 0);
    }

    // Build update object with only the provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (ingredients) updateData.ingredients = ingredients;
    if (targetNutrition) updateData.targetNutrition = targetNutrition;
    if (targetGroup) updateData.targetGroup = targetGroup;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (totalCost !== undefined) updateData.totalCost = totalCost;

    const updatedFormula = await Formula.findOneAndUpdate(
      { id: formulaId, farmId: user.farmId },
      updateData,
      { new: true }
    );

    if (!updatedFormula) {
      return res.status(404).json({ message: "Feed formula not found" });
    }

    res.status(200).json(updatedFormula);
  } catch (error) {
    console.error("Error updating feed formula:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a feed formula (soft delete)
 */
const deleteFormula = async (req, res) => {
  try {
    const user = req.user;
    const formulaId = req.params.id;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    // Soft delete by setting isActive to false
    const deletedFormula = await Formula.findOneAndUpdate(
      { id: formulaId, farmId: user.farmId },
      { isActive: false },
      { new: true }
    );

    if (!deletedFormula) {
      return res.status(404).json({ message: "Feed formula not found" });
    }

    res.status(200).json({ message: "Feed formula deleted successfully" });
  } catch (error) {
    console.error("Error deleting feed formula:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Generate optimized feed formula using the optimization service
 */
const optimizeFormula = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const { 
      availableIngredients, 
      targetNutrition, 
      targetGroup,
      constraints
    } = req.body;

    // Validate inputs
    if (!availableIngredients || !Array.isArray(availableIngredients) || availableIngredients.length === 0) {
      return res.status(400).json({ message: "Available ingredients are required" });
    }

    if (!targetNutrition) {
      return res.status(400).json({ message: "Target nutrition is required" });
    }

    // Call the optimization service
    try {
      const optimizerResponse = await axios.post(`${OPTIMIZER_SERVICE_URL}/optimize`, {
        farmId: user.farmId,
        availableIngredients,
        targetNutrition,
        targetGroup,
        constraints
      });

      // Return the optimized formula
      res.status(200).json(optimizerResponse.data);
    } catch (error) {
      console.error("Error calling optimization service:", error);
      
      // Handle specific errors from the optimization service
      if (error.response) {
        return res.status(error.response.status).json({
          message: "Optimization service error",
          error: error.response.data
        });
      }
      
      // Handle network errors
      return res.status(500).json({
        message: "Failed to connect to optimization service",
        error: error.message
      });
    }
  } catch (error) {
    console.error("Error optimizing feed formula:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default {
  getFormulas,
  getFormulaById,
  createFormula,
  updateFormula,
  deleteFormula,
  optimizeFormula
};