import "dotenv/config";
import path from "node:path";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { loadConfig } from "./config.js";
import { authMiddleware } from "./middleware/auth.js";
import { createAuthRouter } from "./routes/auth.js";
import { createRecordsRouter } from "./routes/records.js";
import { createLabsRouter } from "./routes/labs.js";
import { createAppointmentsRouter } from "./routes/appointments.js";
import { createAdminRouter } from "./routes/admin.js";
import { createPatientsRouter } from "./routes/patients.js";
import { createProvidersRouter } from "./routes/providers.js";

const cfg = loadConfig();
const app = express();

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: cfg.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "512kb" }));
app.use(cookieParser());
app.use(authMiddleware(cfg));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", createAuthRouter(cfg));
app.use("/api/records", createRecordsRouter());
app.use("/api/labs", createLabsRouter());
app.use("/api/appointments", createAppointmentsRouter());
app.use("/api/admin", createAdminRouter());
app.use("/api/patients", createPatientsRouter());
app.use("/api/providers", createProvidersRouter());

/** When `WEB_DIST` is set (path to `apps/web/dist`), serve the SPA on the same origin as `/api` (production deployment). */
const webDist = process.env.WEB_DIST?.trim();
if (cfg.NODE_ENV === "production" && webDist) {
  const webRoot = path.resolve(process.cwd(), webDist);
  app.use(express.static(webRoot));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(path.join(webRoot, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal error" });
});

app.listen(cfg.PORT, () => {
  console.info(`API listening on ${cfg.PORT}`);
});
