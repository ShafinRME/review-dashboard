import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as mentorService from "./mentor.service.js";

export const list = asyncHandler(async (_req, res) => {
  const { items, meta } = await mentorService.listSubmissions(res.locals.query);
  sendSuccess(res, { submissions: items }, 200, meta);
});

export const stats = asyncHandler(async (_req, res) => {
  const stats = await mentorService.getStats();
  sendSuccess(res, { stats });
});

export const review = asyncHandler(async (_req, res) => {
  const submission = await mentorService.reviewSubmission(
    res.locals.params.id,
    res.locals.auth!.sub,
    res.locals.body,
  );
  sendSuccess(res, { submission });
});
