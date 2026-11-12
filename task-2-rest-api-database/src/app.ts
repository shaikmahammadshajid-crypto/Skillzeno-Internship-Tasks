import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import taskRoutes from "./routes/task.routes";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { env } from "./config/env";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()) }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
if (env.NODE_ENV !== "test") app.use(morgan("dev"));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false
}));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, status: "ok", service: "SkillZeno Task 2 REST API" });
});

app.use("/api/tasks", taskRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
