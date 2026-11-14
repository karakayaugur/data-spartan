import { logger } from "../lib/logger.js";

export default function errorRoute(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed",
    });
  }

  const body = req.body ?? {};
  const message =
    typeof body.message === "string" && body.message.trim() ? body.message : "Unknown client error";

  logger("Client error report", {
    source: body.source,
    status: body.status,
    url: body.url,
    stack: body.stack,
    userAgent: req.get("user-agent"),
    clientMessage: message,
  });

  res.status(204).end();
}
