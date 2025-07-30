import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const SensorDataSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true, required: true },
  ammonia: Number,
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', SensorDataSchema);

export default SensorData ;
