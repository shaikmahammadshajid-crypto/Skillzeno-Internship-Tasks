import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, message: "Invalid resource ID" });
    return;
  }
  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ success: false, message: error.message });
    return;
  }
  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    res.status(409).json({ success: false, message: "A record with this value already exists" });
    return;
  }

  const status = Number(error?.status) || 500;
  res.status(status >= 400 && status < 600 ? status : 500).json({
    success: false,
    message: status >= 500 ? "Internal server error" : (error.message || "Request failed"),
    ...(process.env.NODE_ENV === "development" && status >= 500 ? { detail: error.message } : {})
  });
};
