import mongoose from "mongoose";

export async function connectDB(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}