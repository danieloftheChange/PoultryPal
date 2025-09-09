import mongoose from "mongoose";

const uri =
  "mongodb+srv://ainedanielm:aYbXijBPdZ97T0To@poultrypal.f3blpsp.mongodb.net/?retryWrites=true&w=majority&appName=poultrypal";

async function connectToMongoDB() {
  try {
    await mongoose.connect(uri);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

export default connectToMongoDB;
