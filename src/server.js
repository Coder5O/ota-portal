// Server entry point. Replaced Base44/Cloudflare error-capture with a plain TanStack Start handler.
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

export default { fetch: createStartHandler(defaultStreamHandler) };
