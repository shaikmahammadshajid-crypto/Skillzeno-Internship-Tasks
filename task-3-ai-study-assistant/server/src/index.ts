
import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.disable("x-powered-by");
app.use(cors({ origin: FRONTEND_URL, methods: ["GET", "POST"] }));
app.use(express.json({ limit: "1mb" }));

app.use(
  "/api/assistant",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const requestSchema = z.object({
  mode: z.enum(["ask", "summarize", "quiz", "plan"]),
  prompt: z.string().trim().min(1).max(12000),
});

const instructions = {
  ask: "Answer the student's question accurately and explain difficult ideas step by step.",
  summarize: "Summarize the supplied content into concise notes with headings and key takeaways.",
  quiz: "Create a practice quiz on the supplied topic, with answers and brief explanations.",
  plan: "Create a realistic study plan with focused sessions, breaks, and revision tasks.",
};

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "StudyPilot AI API" });
});

app.post("/api/assistant", async (req: Request, res: Response) => {
  const parsed = requestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Provide a valid mode and a prompt between 1 and 12000 characters.",
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    res.status(503).json({
      error: "Gemini is not configured. Add GEMINI_API_KEY to server/.env.",
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.AI_MODEL || "gemini-3.8-flash";

    const result = await ai.models.generateContent({
      model,
      contents: parsed.data.prompt,
      config: {
        systemInstruction:
          "You are StudyPilot AI, a helpful academic study assistant. Be accurate, organized, encouraging, and transparent when uncertain. " +
          instructions[parsed.data.mode],
        temperature: 0.5,
      },
    });

    const answer = result.text?.trim();

    if (!answer) {
      res.status(502).json({
        error: "Gemini returned an empty response. Please try again.",
      });
      return;
    }

    res.json({ answer, mode: parsed.data.mode, model });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error("Gemini request failed:", message);

    const isUnavailable =
      message.includes('"code":503') ||
      message.includes("UNAVAILABLE");

    res.status(isUnavailable ? 503 : 502).json({
      error: isUnavailable
        ? "Gemini is temporarily busy. Please try again in a few seconds."
        : "Gemini request failed. Check the backend logs for details.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`StudyPilot AI API running at http://localhost:${PORT}`);
});
