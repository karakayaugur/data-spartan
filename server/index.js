import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import errorRoute from "./middlewares/client-error.js";
import { logger } from "./middlewares/logger.js";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "../client/dist/browser");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "upgrade-insecure-requests": null,
        "script-src-attr": ["'unsafe-inline'"],
      },
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger.http);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/proxyUrl/error", errorRoute);
app.use(
  "/proxyUrl",
  createProxyMiddleware({
    target: process.env.SWAPI_BASE_URL || "https://swapi.dev/api/",
    changeOrigin: true,
    proxyTimeout: 15_000,
    on: {
      proxyReq: fixRequestBody,
      error(error, _req, res) {
        logger("API proxy failed", { message: error.message });
        if (res.headersSent) return res.end();
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Unable to reach the upstream API" }));
      },
    },
  }),
);
app.use(express.static(clientDist));
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  logger("Application is ready on:", {
    port: PORT,
    url: `http://localhost:${PORT}`,
  });
});
