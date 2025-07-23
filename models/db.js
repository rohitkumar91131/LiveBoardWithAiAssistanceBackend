import dotenv from 'dotenv'
dotenv.config()
import mongoose from "mongoose";
const MONGO_URI = process.env.MONGO_URI
async function connectDb() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Database connection successful");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}
connectDb();
export default connectDb;
