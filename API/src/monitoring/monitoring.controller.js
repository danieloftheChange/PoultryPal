import SensorData from "./monitoring.model.js";
import logger from "../../config/logger.js";

const getSensorDataForHouse = async (req, res) => {
  try {
    const user = req.user;
    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const data = await SensorData.find().sort({ timestamp: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createSensorDataForHouse = async (req, res) => {
  try {
    const { ammonia, temperature, humidity } = req.body;

    if (ammonia == null || temperature == null || humidity == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sensorData = await SensorData.create({
      ammonia,
      temperature,
      humidity,
    });

    res.status(201).json(sensorData);
  } catch (error) {
    logger.error("Error creating sensor data:", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  createSensorDataForHouse,
  getSensorDataForHouse,
};
