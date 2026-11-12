import { z } from "zod";

const statusSchema = z.enum(["pending", "in_progress", "completed"]);
const prioritySchema = z.enum(["low", "medium", "high"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional(),
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  dueDate: z.coerce.date().nullable().optional()
}).strict();

export const updateTaskSchema = createTaskSchema.partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for an update"
  });

export const listTasksQuerySchema = z.object({
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
}).strict();
