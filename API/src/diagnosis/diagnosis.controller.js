import Diagnosis from "./diagnosis.model.js";

const createDiagnosis = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const { imageUrl, disease, confidence } = req.body;

    const newDiagnosis = new Diagnosis({
      farmId: user.farmId,
      imageUrl,
      disease,
      confidence,
    });

    const savedDiagnosis = await newDiagnosis.save();

    res.status(201).json({
      message: "Diagnosis created successfully",
      diagnosis: savedDiagnosis,
    });
  } catch (error) {
    console.error("Error creating diagnosis:", error);
    res
      .status(500)
      .json({ message: "Error creating diagnosis", error: error.message });
  }
};

const getDiagnosesByFarm = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const diagnoses = await Diagnosis.find({ farmId: user.farmId }).sort({ createdAt: -1 });

    res.status(200).json(diagnoses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDiagnosisById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user.farmId) {
      return res.status(400).json({
        success: false,
        message: "User does not belong to a farm"
      });
    }

    // SECURITY FIX: Verify diagnosis belongs to user's farm
    const diagnosis = await Diagnosis.findOne({
      id: id,
      farmId: user.farmId
    });

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: "Diagnosis not found or access denied"
      });
    }

    res.status(200).json({
      success: true,
      message: "Diagnosis retrieved successfully",
      diagnosis,
    });
  } catch (error) {
    console.error("Error fetching diagnosis:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching diagnosis",
      error: error.message
    });
  }
};

const updateDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, disease, notes } = req.body;
    const user = req.user;

    if (!user.farmId) {
      return res.status(400).json({
        success: false,
        message: "User does not belong to a farm"
      });
    }

    // SECURITY FIX: Verify diagnosis belongs to user's farm before updating
    const updatedDiagnosis = await Diagnosis.findOneAndUpdate(
      { id: id, farmId: user.farmId },
      { imageUrl, disease, notes },
      { new: true }
    );

    if (!updatedDiagnosis) {
      return res.status(404).json({
        success: false,
        message: "Diagnosis not found or access denied"
      });
    }

    res.status(200).json({
      success: true,
      message: "Diagnosis updated successfully",
      diagnosis: updatedDiagnosis,
    });
  } catch (error) {
    console.error("Error updating diagnosis:", error);
    res.status(500).json({
      success: false,
      message: "Error updating diagnosis",
      error: error.message
    });
  }
};

const deleteDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user.farmId) {
      return res.status(400).json({
        success: false,
        message: "User does not belong to a farm"
      });
    }

    // SECURITY FIX: Verify diagnosis belongs to user's farm before deleting
    const deletedDiagnosis = await Diagnosis.findOneAndDelete({
      id: id,
      farmId: user.farmId
    });

    if (!deletedDiagnosis) {
      return res.status(404).json({
        success: false,
        message: "Diagnosis not found or access denied"
      });
    }

    res.status(200).json({
      success: true,
      message: "Diagnosis deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting diagnosis:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting diagnosis",
      error: error.message
    });
  }
};

export default {
  createDiagnosis,
  getDiagnosesByFarm,
  getDiagnosisById,
  updateDiagnosis,
  deleteDiagnosis,
};
