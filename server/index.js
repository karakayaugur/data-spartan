import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import apiRoute from "./routes/api.js";
import errorRoute from "./routes/error.js";
import { logger } from "./lib/logger.js";

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "../client/dist/browser");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
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
app.get("/proxyUrl/error-test", (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This is a test error response",
  });
});
app.use("/proxyUrl", apiRoute);
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
