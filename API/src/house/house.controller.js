import House from "./house.model.js";

// Get all houses for the logged-in user's farm
const getHouses = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const houses = await House.find({ farmId: user.farmId }).sort({ createdAt: -1 });

    res.status(200).json(houses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createHouse = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const { name, capacity, houseType } = req.body;

    const newHouse = new House({
      farmId: user.farmId,
      name,
      capacity,
      houseType,
    });

    await newHouse.save();
    res.status(201).json(newHouse);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getHouseById = async (req, res) => {
  try {
    const user = req.user;
    const houseId = req.params.id;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const house = await House.findOne({ id: houseId, farmId: user.farmId });

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    res.status(200).json(house);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateHouse = async (req, res) => {
  try {
    const user = req.user;
    const houseId = req.params.id;
    const updates = req.body;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const house = await House.findOneAndUpdate(
      { id: houseId, farmId: user.farmId },
      updates,
      { new: true }
    );

    if (!house) {
      return res
        .status(404)
        .json({ message: "House not found or unauthorized" });
    }

    res.status(200).json(house);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteHouse = async (req, res) => {
  try {
    const user = req.user;
    const houseId = req.params.id;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const house = await House.findOneAndDelete({
      id: houseId,
      farmId: user.farmId,
    });

    if (!house) {
      return res
        .status(404)
        .json({ message: "House not found or unauthorized" });
    }

    res.status(200).json({ message: "House deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default {
  getHouses,
  createHouse,
  getHouseById,
  updateHouse,
  deleteHouse,
};
