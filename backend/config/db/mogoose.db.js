import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  globalThis.__mongoConnected = false;
  try {
    const username = process.env.MONGOOSE_USER;
    const password = encodeURIComponent(process.env.MONGOOSE_PASSWORD || "");
    const dbname = process.env.MONGOOSE_DBNAME;
    const uri =
      process.env.MONGO_URI;

    const conn = await mongoose.connect(uri);

    console.log(`✅ Database connected: ${conn.connection.host}`);
    globalThis.__mongoConnected = true;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    // Don't hard-crash the entire app in dev/testing.
    // The API routes can still respond with 503 where DB is required.
    return null;
  }
};

export default connectDB;
