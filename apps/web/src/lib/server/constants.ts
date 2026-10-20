export const TOKEN_COOKIE = "rd_token";
export const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24; // keep in sync with JWT_ACCESS_EXPIRES_IN (1d)
export const API_URL = process.env.API_URL ?? "http://localhost:4000/api";
