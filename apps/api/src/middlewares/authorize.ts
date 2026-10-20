import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";
import type { AuthPayload } from "../utils/jwt.js";

type Role = AuthPayload["role"];

export const authorize =
  (...allowed: Role[]): RequestHandler =>
  (_req, res, next) => {
    const auth = res.locals.auth;

    if (!auth) return next(ApiError.unauthorized());
    if (!allowed.includes(auth.role)) {
      return next(
        ApiError.forbidden("You do not have permission to perform this action"),
      );
    }
    return next();
  };
