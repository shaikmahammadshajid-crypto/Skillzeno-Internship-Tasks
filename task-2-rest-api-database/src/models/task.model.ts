import { InferSchemaType, model, Schema } from "mongoose";

const taskSchema = new Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed"],
    default: "pending",
    required: true
  },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium", required: true },
  dueDate: { type: Date, default: null }
}, { timestamps: true, versionKey: false });

export type TaskDocument = InferSchemaType<typeof taskSchema>;
export const Task = model("Task", taskSchema);
