import { Router } from "express";
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from "../controllers/task.controller";
import { validate } from "../middleware/validate";
import { createTaskSchema, listTasksQuerySchema, updateTaskSchema } from "../validators/task.validator";

const router = Router();

router.route("/")
  .post(validate(createTaskSchema), createTask)
  .get(validate(listTasksQuerySchema, "query"), getTasks);

router.route("/:id")
  .get(getTaskById)
  .patch(validate(updateTaskSchema), updateTask)
  .put(validate(updateTaskSchema), updateTask)
  .delete(deleteTask);

export default router;
