import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { MemStorage } from "./storage";
import { DbStorage } from "./db-storage";
import { runMigrations } from "./db";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Create storage instances
const memStorage = new MemStorage();
const dbStorage = new DbStorage(memStorage);

// Initialize the database
async function initDatabase() {
  try {
    // Run database migrations if using PostgreSQL
    if (process.env.USE_POSTGRES === "true") {
      await runMigrations();
      log("Database migrations completed successfully");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    // Fall back to memory storage if database initialization fails
    log("Falling back to in-memory storage");
    return memStorage;
  }
  return dbStorage;
}

(async () => {
  // Get the appropriate storage based on configuration
  const storage =
    process.env.USE_POSTGRES === "true" ? await initDatabase() : memStorage;

  log(
    `Using ${
      process.env.USE_POSTGRES === "true"
        ? "persistent PostgreSQL"
        : "in-memory"
    } storage`
  );

  const server = await registerRoutes(app, storage);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Change port to avoid conflicts with Vite
  // this serves both the API and the client.
  // Using port 5001 to avoid conflicts with Vite on port 5000
  const port = 5001;
  const host = process.platform === "win32" ? "localhost" : "0.0.0.0";

  if (server) {
    server.listen(
      {
        port,
        host,
        reusePort: process.platform !== "win32",
      },
      () => {
        log(`serving on port ${port} (${host})`);
      }
    );
  } else {
    log("Failed to create server, server is undefined");
  }
})();
