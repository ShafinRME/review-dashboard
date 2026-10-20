import type { AuthPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Locals {
      auth?: AuthPayload;
    }
  }
}

export {};
