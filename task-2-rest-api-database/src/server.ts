import app from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env } from "./config/env";

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    const server = app.listen(env.PORT, () => {
      console.log(`API running at http://localhost:${env.PORT}`);
      console.log(`Health check: http://localhost:${env.PORT}/api/health`);
    });

    const shutdown = (signal: string) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

void startServer();
