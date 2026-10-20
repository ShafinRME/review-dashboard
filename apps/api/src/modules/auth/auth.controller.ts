import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as authService from "./auth.service.js";

export const signup = asyncHandler(async (_req, res) => {
  const result = await authService.signup(res.locals.body);
  sendSuccess(res, result, 201);
});

export const login = asyncHandler(async (_req, res) => {
  const result = await authService.login(res.locals.body);
  sendSuccess(res, result);
});

export const me = asyncHandler(async (_req, res) => {
  const user = await authService.getMe(res.locals.auth!.sub);
  sendSuccess(res, { user });
});
