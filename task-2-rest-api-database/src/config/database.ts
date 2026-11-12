import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
  });
  console.log("MongoDB connected");
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
