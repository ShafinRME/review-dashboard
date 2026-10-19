import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../env.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  // Malformed JSON body
  if (err instanceof SyntaxError && "body" in err) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid JSON body" });
  }

  // Database-level unique violation (backstop for duplicate prevention)
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    return res
      .status(409)
      .json({ success: false, message: "Resource already exists" });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.NODE_ENV === "development" && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
};
