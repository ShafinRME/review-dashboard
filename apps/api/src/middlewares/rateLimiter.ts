import { rateLimit } from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

// Keyed by authenticated user id, so it must run after `authenticate`.
export const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: (_req, res) => res.locals.auth?.sub ?? "anonymous",
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(ApiError.tooMany("Too many submissions. Please try again later.")),
});
