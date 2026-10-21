import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./env.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { submissionRouter } from "./modules/submissions/submission.routes.js";
import { mentorRouter } from "./modules/mentor/mentor.routes.js";

export const app = express();

// Render runs behind one reverse proxy; trust it so client IPs and protocol are read correctly.
app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN.split(","), credentials: true }));
app.use(express.json({ limit: "100kb" }));
if (env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRouter);
app.use("/api/submissions", submissionRouter);
app.use("/api/mentor", mentorRouter);

app.use(notFound);
app.use(errorHandler);
