import "./env.js";
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
import { createDashboardRouter } from "./routes/dashboard.js";
import { createClinicianSlotsRouter } from "./routes/clinician-slots.js";
const cfg = loadConfig();
const app = express();
app.set("trust proxy", 1);
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(cors({
    origin: cfg.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json({ limit: "512kb" }));
app.use(cookieParser());
app.get("/api/health", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ status: "ok" });
});
app.use(authMiddleware(cfg));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api", limiter);
app.use("/api/auth", (req, res, next) => {
    res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
    next();
});
app.use("/api/auth", createAuthRouter(cfg));
app.use("/api/records", createRecordsRouter(cfg));
app.use("/api/labs", createLabsRouter(cfg));
app.use("/api/appointments", createAppointmentsRouter(cfg));
app.use("/api/admin", createAdminRouter());
app.use("/api/patients", createPatientsRouter());
app.use("/api/providers", createProvidersRouter());
app.use("/api/dashboard", createDashboardRouter());
app.use("/api/clinician-slots", createClinicianSlotsRouter(cfg));
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
            if (err)
                next(err);
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
const server = app.listen(cfg.PORT, () => {
    console.info(`API listening on ${cfg.PORT}`);
});
server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
        console.error(`[api] Port ${cfg.PORT} is already in use. Stop the other process (e.g. fuser -k ${cfg.PORT}/tcp) or set PORT=4001 in apps/api/.env and match Vite proxy in apps/web/vite.config.ts`);
        process.exit(1);
    }
    throw err;
});
