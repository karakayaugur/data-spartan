const ANSI = {
  red: "\x1b[31m",
  blue: "\x1b[34m",
  white: "\x1b[37m",
  reset: "\x1b[0m",
};

const maskedFields = [
  "username",
  "user_name",
  "userName",
  "password",
  "token",
  "secret",
  "cvv",
  "expiry_month",
  "expirymonth",
  "expiryMonth",
  "expiry_year",
  "expiryYear",
  "expiryyear",
  "email",
  "cardNumber",
  "card_number",
  "cardnumber",
  "bank_account_detail",
  "iban",
  "api_key",
  "apikey",
  "apiKey",
  "secret_key",
  "secretkey",
  "secretKey",
  "number",
  "otp",
  "role",
];

function color(code, text) {
  return `${code}${text}${ANSI.reset}`;
}

function mask(params) {
  if (!params || typeof params !== "object") return params;

  const copy = { ...params };
  maskedFields.forEach((field) => {
    if (copy[field]) {
      copy[field] = `${field}-***`;
    }
  });
  return copy;
}

function shouldLog(req) {
  return req.originalUrl.startsWith("/proxyUrl/");
}

function maskUrl(req) {
  const url = new URL(req.originalUrl, `http://${req.headers.host ?? "localhost"}`);
  const params = new URLSearchParams(url.searchParams);
  for (const key of params.keys()) {
    params.set(key, "***");
  }
  const query = params.toString();
  return query ? `${url.pathname} ${query}` : url.pathname;
}

function formatHeaders(req) {
  const headers = { ...(req["x-headers"] ?? req.headers) };
  if (headers.authorization ?? headers.Authorization) {
    headers.Authorization = "***";
    delete headers.authorization;
  }
  delete headers["accept-language"];
  delete headers["content-type"];
  delete headers["user-agent"];
  return JSON.stringify(headers);
}

function formatRequestLog(req, res, responseTimeMs) {
  const parts = [
    color(ANSI.red, req.method),
    color(ANSI.red, String(res.statusCode)),
    color(ANSI.white, maskUrl(req)),
    color(ANSI.blue, `@${new Date().toISOString()}`),
    color(ANSI.blue, `${responseTimeMs}ms`),
    color(ANSI.white, `Headers${formatHeaders(req)}`),
  ];

  if (req.originalUrl.includes("/proxyUrl/error")) {
    parts.push(color(ANSI.blue, JSON.stringify(mask(req.body))));
  }

  return parts.join(" ");
}

function log(message, meta = {}) {
  const time = new Date().toISOString();
  const metaLine = meta && Object.keys(meta).length ? ` ${JSON.stringify(mask(meta))}` : "";

  console.log(`${color(ANSI.blue, time)} ${message}${metaLine}`);
}

function httpLogger(req, res, next) {
  if (!shouldLog(req)) {
    next();
    return;
  }

  const start = Date.now();
  res.on("finish", () => {
    console.log(formatRequestLog(req, res, Date.now() - start));
  });
  next();
}

export const logger = Object.assign(log, { http: httpLogger });
