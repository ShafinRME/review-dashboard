import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { loginSchema, signupSchema } from "./auth.schema.js";
import * as controller from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/signup", validate(signupSchema), controller.signup);
authRouter.post("/login", validate(loginSchema), controller.login);
authRouter.get("/me", authenticate, controller.me);
