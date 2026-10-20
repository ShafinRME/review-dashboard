import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { submissionLimiter } from "../../middlewares/rateLimiter.js";
import { validate } from "../../middlewares/validate.js";
import { createSubmissionSchema } from "./submission.schema.js";
import * as controller from "./submission.controller.js";

export const submissionRouter = Router();

submissionRouter.use(authenticate, authorize("STUDENT"));

submissionRouter.post(
  "/",
  submissionLimiter,
  validate(createSubmissionSchema),
  controller.create,
);
submissionRouter.get("/mine", controller.listMine);
