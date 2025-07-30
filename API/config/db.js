import mongoose from "mongoose";

const uri =
  "mongodb+srv://kalijoe11:DseNJnKKOPkqsTLq@poultry-management.7x02b.mongodb.net/?retryWrites=true&w=majority&appName=Poultry-Management";

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
