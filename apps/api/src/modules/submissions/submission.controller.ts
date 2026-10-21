import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as submissionService from "./submission.service.js";

export const create = asyncHandler(async (_req, res) => {
  const { submission, resubmitted } = await submissionService.createSubmission(
    res.locals.auth!.sub,
    res.locals.body,
  );
  sendSuccess(res, { submission, resubmitted }, resubmitted ? 200 : 201);
});

export const listMine = asyncHandler(async (_req, res) => {
  const submissions = await submissionService.listMySubmissions(
    res.locals.auth!.sub,
  );
  sendSuccess(res, { submissions });
});
