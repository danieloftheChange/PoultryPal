import Stock from "./stock.model.js";

// Get all stock items for the logged-in user's farm
const getStock = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const stocks = await Stock.find({ farmId: user.farmId }).sort({ createdAt: -1 });
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createStock = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const { item, category, quantity, threshold } = req.body;

    const newStock = new Stock({
      farmId: user.farmId,
      item,
      category,
      quantity,
      threshold,
    });

    await newStock.save();
    res.status(201).json(newStock);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getStockById = async (req, res) => {
  try {
    const user = req.user;
    const stockId = req.params.id;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const stock = await Stock.findOne({ id: stockId, farmId: user.farmId });

    if (!stock) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const user = req.user;
    const stockId = req.params.id;
    const updates = req.body;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const stock = await Stock.findOneAndUpdate(
      { id: stockId, farmId: user.farmId },
      updates,
      { new: true }
    );

    if (!stock) {
      return res
        .status(404)
        .json({ message: "Stock item not found or unauthorized" });
    }

    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteStock = async (req, res) => {
  try {
    const user = req.user;
    const stockId = req.params.id;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const stock = await Stock.findOneAndDelete({
      id: stockId,
      farmId: user.farmId,
    });

    if (!stock) {
      return res
        .status(404)
        .json({ message: "Stock item not found or unauthorized" });
    }

    res.status(200).json({ message: "Stock item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default {
  getStock,
  createStock,
  getStockById,
  updateStock,
  deleteStock,
};
