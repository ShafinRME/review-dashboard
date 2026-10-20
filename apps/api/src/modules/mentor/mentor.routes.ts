import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import {
  idParamSchema,
  listQuerySchema,
  reviewSchema,
} from "./mentor.schema.js";
import * as controller from "./mentor.controller.js";

export const mentorRouter = Router();

mentorRouter.use(authenticate, authorize("MENTOR"));

mentorRouter.get("/stats", controller.stats);
mentorRouter.get(
  "/submissions",
  validate(listQuerySchema, "query"),
  controller.list,
);
mentorRouter.patch(
  "/submissions/:id/review",
  validate(idParamSchema, "params"),
  validate(reviewSchema),
  controller.review,
);
