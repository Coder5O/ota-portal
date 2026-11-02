// Stub: Base44/Cloudflare error-capture middleware removed during Firebase migration.
// Kept as no-ops so any lingering imports compile without errors.
import { createMiddleware } from "@tanstack/react-start";

export const errorCaptureFunctionMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => next(),
);

export const errorCaptureRequestMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next }) => next(),
);
