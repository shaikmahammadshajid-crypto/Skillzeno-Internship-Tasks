import { Request, Response } from "express";
import mongoose from "mongoose";
import { Task } from "../models/task.model";
import { asyncHandler } from "../utils/async-handler";

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.create(req.body);
  res.status(201).json({ success: true, message: "Task created", data: task });
});

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const priority = typeof req.query.priority === "string" ? req.query.priority : undefined;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const filter: Record<string, string> = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Task.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: tasks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ success: false, message: "Invalid task ID" });
    return;
  }
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404).json({ success: false, message: "Task not found" });
    return;
  }
  res.status(200).json({ success: true, data: task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ success: false, message: "Invalid task ID" });
    return;
  }
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!task) {
    res.status(404).json({ success: false, message: "Task not found" });
    return;
  }
  res.status(200).json({ success: true, message: "Task updated", data: task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ success: false, message: "Invalid task ID" });
    return;
  }
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    res.status(404).json({ success: false, message: "Task not found" });
    return;
  }
  res.status(200).json({ success: true, message: "Task deleted", data: task });
});
