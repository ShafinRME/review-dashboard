import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(
      ApiError.unauthorized("Missing or malformed Authorization header"),
    );
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    res.locals.auth = verifyAccessToken(token);
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(ApiError.unauthorized("Token expired"));
    }
    return next(ApiError.unauthorized("Invalid token"));
  }
};
