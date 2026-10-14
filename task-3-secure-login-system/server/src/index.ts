import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { rateLimit } from "express-rate-limit";
import argon2 from "argon2";
import Database from "better-sqlite3";
import { Store } from "express-session";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { db } from "./db.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? 4000);
const clientOrigin = process.env.CLIENT_ORIGIN ?? String.fromCharCode(104,116,116,112,58,47,47,108,111,99,97,108,104,111,115,116,58,53,49,55,52);
const secret = process.env.SESSION_SECRET;

if (!secret || secret.length < 64) {
  throw new Error("SESSION_SECRET must contain at least 64 characters.");
}

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: clientOrigin,
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));

class SQLiteSessionStore extends Store {
  private database: Database.Database;

  constructor(database: Database.Database) {
    super();
    this.database = database;
  }

  get(
    sid: string,
    callback: (err: Error | null, session?: session.SessionData | null) => void
  ) {
    try {
      const row = this.database
        .prepare("SELECT sess, expired FROM sessions WHERE sid = ?")
        .get(sid) as { sess: string; expired: number } | undefined;

      if (!row) return callback(null, null);

      if (row.expired <= Date.now()) {
        this.destroy(sid, () => callback(null, null));
        return;
      }

      callback(null, JSON.parse(row.sess));
    } catch (error) {
      callback(error as Error);
    }
  }

  set(
    sid: string,
    sessionData: session.SessionData,
    callback?: (err?: Error | null) => void
  ) {
    try {
      const expires = sessionData.cookie.expires
        ? new Date(sessionData.cookie.expires).getTime()
        : Date.now() + 8 * 60 * 60 * 1000;

      this.database.prepare(`
        INSERT INTO sessions (sid, sess, expired)
        VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET
          sess = excluded.sess,
          expired = excluded.expired
      `).run(sid, JSON.stringify(sessionData), expires);

      callback?.(null);
    } catch (error) {
      callback?.(error as Error);
    }
  }

  destroy(sid: string, callback?: (err?: Error | null) => void) {
    try {
      this.database.prepare("DELETE FROM sessions WHERE sid = ?").run(sid);
      callback?.(null);
    } catch (error) {
      callback?.(error as Error);
    }
  }

  touch(
    sid: string,
    sessionData: session.SessionData,
    callback?: (err?: Error | null) => void
  ) {
    try {
      const expires = sessionData.cookie.expires
        ? new Date(sessionData.cookie.expires).getTime()
        : Date.now() + 8 * 60 * 60 * 1000;

      this.database.prepare(
        "UPDATE sessions SET expired = ? WHERE sid = ?"
      ).run(expires, sid);

      callback?.(null);
    } catch (error) {
      callback?.(error as Error);
    }
  }
}

app.use(session({
  name: "securelogin.sid",
  secret,
  store: new SQLiteSessionStore(db),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  },
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Try again later." },
});

const emailSchema = z.string().trim().email().max(254).transform(
  (value) => value.toLowerCase()
);

const registrationSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(12, "Password must contain at least 12 characters.")
    .max(128)
    .regex(/[a-z]/, "Password must contain a lowercase letter.")
    .regex(/[A-Z]/, "Password must contain an uppercase letter.")
    .regex(/[0-9]/, "Password must contain a number.")
    .regex(/[^A-Za-z0-9]/, "Password must contain a symbol."),
}).strict();

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
}).strict();

function requireOrigin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const origin = req.get("origin");
  if (origin && origin !== clientOrigin) {
    res.status(403).json({ error: "Request origin not allowed." });
    return;
  }
  next();
}

function asyncRoute(
  handler: (req: express.Request, res: express.Response) => Promise<unknown>
): express.RequestHandler {
  return (req, res, next) => {
    handler(req, res).catch(next);
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Secure Login API" });
});

app.post("/api/auth/register", authLimiter, requireOrigin, asyncRoute(async (req, res) => {
  const parsed = registrationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid registration details.",
      details: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  const { email, password } = parsed.data;
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  try {
    const result = db.prepare(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)"
    ).run(email, passwordHash);

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((error) => error ? reject(error) : resolve());
    });

    req.session.userId = Number(result.lastInsertRowid);

    await new Promise<void>((resolve, reject) => {
      req.session.save((error) => error ? reject(error) : resolve());
    });

    res.status(201).json({ message: "Account created successfully.", user: { id: Number(result.lastInsertRowid), email } });
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      res.status(409).json({ error: "Unable to create account with those details." });
      return;
    }
    throw error;
  }
}));

app.post("/api/auth/login", authLimiter, requireOrigin, asyncRoute(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid email and password." });
    return;
  }

  const user = db.prepare(
    "SELECT id, email, password_hash FROM users WHERE email = ?"
  ).get(parsed.data.email) as
    | { id: number; email: string; password_hash: string }
    | undefined;

  const valid = user
    ? await argon2.verify(user.password_hash, parsed.data.password)
    : false;

  if (!valid || !user) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((error) => error ? reject(error) : resolve());
  });

  req.session.userId = user.id;

  await new Promise<void>((resolve, reject) => {
    req.session.save((error) => error ? reject(error) : resolve());
  });

  res.json({ message: "Login successful.", user: { id: user.id, email: user.email } });
}));

app.get("/api/auth/me", (req, res) => {
  const userId = req.session.userId;
  if (typeof userId !== "number") {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const user = db.prepare(
    "SELECT id, email, created_at FROM users WHERE id = ?"
  ).get(userId);

  if (!user) {
    req.session.destroy(() => undefined);
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  res.json({ user });
});

app.post("/api/auth/logout", requireOrigin, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("securelogin.sid", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({ message: "Logged out successfully." });
  });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Request failed:", error instanceof Error ? error.message : "Unknown error");
  res.status(500).json({ error: "An unexpected server error occurred." });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Secure Login API listening on http://127.0.0.1:${port}`);
});
