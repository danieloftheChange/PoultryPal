import Farm from "./farm.model.js";

// Create a farm and associate it with the user's uid
const createFarm = async (req, res) => {
  try {
    const newFarm = new Farm({
      ...req.body,
      uid: req.body.uid,
    });
    const savedFarm = await newFarm.save();
    res.status(201).json(savedFarm);
  } catch (error) {
    console.error("Error creating farm:", error);
    res
      .status(500)
      .json({ message: "Error creating farm", error: error.message });
  }
};

// Retrieve all farms for the specified user
const getFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ uid: req.query.uid });
    res.status(200).json(farms);
  } catch (error) {
    console.error("Error retrieving farms:", error);
    res
      .status(500)
      .json({ message: "Error retrieving farms", error: error.message });
  }
};

// Retrieve a specific farm by ID and check if it belongs to the specified user
const getFarm = async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.farmId,
      uid: req.query.uid,
    });
    if (!farm) return res.status(404).json({ message: "Farm not found" });
    res.status(200).json(farm);
  } catch (error) {
    console.error("Error retrieving farm:", error);
    res
      .status(500)
      .json({ message: "Error retrieving farm", error: error.message });
  }
};

// Update a farm if it belongs to the specified user
const updateFarm = async (req, res) => {
  try {
    const updatedFarm = await Farm.findOneAndUpdate(
      { _id: req.params.farmId, uid: req.body.uid },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedFarm)
      return res.status(404).json({ message: "Farm not found" });
    res.status(200).json(updatedFarm);
  } catch (error) {
    console.error("Error updating farm:", error);
    res
      .status(500)
      .json({ message: "Error updating farm", error: error.message });
  }
};

// Delete a farm if it belongs to the specified user
const deleteFarm = async (req, res) => {
  try {
    const deletedFarm = await Farm.findOneAndDelete({
      _id: req.params.farmId,
      uid: req.query.uid,
    });
    if (!deletedFarm)
      return res.status(404).json({ message: "Farm not found" });
    res.status(200).json({ message: "Farm deleted successfully" });
  } catch (error) {
    console.error("Error deleting farm:", error);
    res
      .status(500)
      .json({ message: "Error deleting farm", error: error.message });
  }
};

export default {
  createFarm,
  getFarms,
  getFarm,
  updateFarm,
  deleteFarm,
};