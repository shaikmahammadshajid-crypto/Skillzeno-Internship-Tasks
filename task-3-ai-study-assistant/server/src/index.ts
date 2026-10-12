import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.disable("x-powered-by");
app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "32kb" }));

app.use("/api", rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a minute and try again." }
}));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "StudyPilot AI API" });
});

const requestSchema = z.object({
  mode: z.enum(["ask", "summarize", "quiz", "plan"]),
  prompt: z.string().trim().min(3, "Enter at least 3 characters.").max(8000, "Keep your input under 8,000 characters.")
});

const instructions: Record<z.infer<typeof requestSchema>["mode"], string> = {
  ask: "You are StudyPilot AI, a patient study tutor. Explain accurately in clear student-friendly language. Use headings and examples when helpful. If a request is ambiguous, state the assumption. Do not invent citations.",
  summarize: "You are StudyPilot AI. Summarize the user's supplied material faithfully. Use a concise overview, key points, and important terms. Do not add unsupported facts. If no source material is provided, ask the user to paste it.",
  quiz: "You are StudyPilot AI. Create a useful quiz from the topic or notes. Provide 5 questions, four options for multiple-choice questions, then an answer key with brief explanations at the end. Do not put answers immediately after each question.",
  plan: "You are StudyPilot AI, a study-planning coach. Build a realistic, structured study plan based on the user's goal, time available, and constraints. If details are missing, state reasonable assumptions and give an adaptable plan."
};

app.post("/api/assistant", async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || "Please check your input."
    });
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || apiKey === "replace_with_your_private_api_key") {
    return res.status(503).json({
      error: "AI service is not configured. Add your provider key to server/.env, then restart the server."
    });
  }

  try {
    const client = new OpenAI({
      apiKey,
      ...(process.env.AI_BASE_URL ? { baseURL: process.env.AI_BASE_URL } : {})
    });

    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: instructions[parsed.data.mode] },
        { role: "user", content: parsed.data.prompt }
      ],
      temperature: parsed.data.mode === "quiz" ? 0.6 : 0.4
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    if (!answer) {
      return res.status(502).json({ error: "The AI returned an empty response. Please try again." });
    }

    return res.json({ answer, mode: parsed.data.mode });
  } catch (error) {
    // Log technical details on the server only; never return credentials or provider internals.
    console.error("AI request failed:", error instanceof Error ? error.message : "Unknown error");
    return res.status(502).json({
      error: "The AI request failed. Check your API key, model name, provider quota, and network connection, then try again."
    });
  }
});

app.listen(port, () => {
  console.log(`StudyPilot AI API listening on http://localhost:${port}`);
});
