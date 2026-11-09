import { createServer } from "node:http";

const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? 8081);
const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map();
const allowedOrigins = new Set([
  "https://sls-iq.com",
  "https://www.sls-iq.com",
]);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}

function getOrigin(request) {
  return typeof request.headers.origin === "string"
    ? request.headers.origin
    : "";
}

function isAllowedOrigin(origin) {
  return !origin || allowedOrigins.has(origin);
}

function sendJson(response, statusCode, payload, origin = "") {
  const headers = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  };

  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }

  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(payload));
}

function sendPreflight(response, origin) {
  if (!isAllowedOrigin(origin)) {
    sendJson(response, 403, { error: "مصدر الطلب غير مسموح." });
    return;
  }

  response.writeHead(204, {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    ...(origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
  });
  response.end();
}

function cleanExpiredRateLimits(now = Date.now()) {
  for (const [key, value] of rateLimitStore) {
    if (value.resetAt <= now) rateLimitStore.delete(key);
  }
}

function isRateLimited(clientKey) {
  const now = Date.now();
  let entry = rateLimitStore.get(clientKey);

  if (!entry || entry.resetAt <= now) {
    if (rateLimitStore.size >= 5000) cleanExpiredRateLimits(now);
    if (rateLimitStore.size >= 5000) return true;
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitStore.set(clientKey, entry);
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

const cleanupTimer = setInterval(cleanExpiredRateLimits, 60 * 1000);
cleanupTimer.unref();

async function readJsonBody(request) {
  const contentType = request.headers["content-type"] ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    const error = new Error("Expected JSON request body.");
    error.statusCode = 415;
    throw error;
  }

  const chunks = [];
  let size = 0;
  let tooLarge = false;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      tooLarge = true;
      continue;
    }
    chunks.push(chunk);
  }

  if (tooLarge) {
    const error = new Error("Request body is too large.");
    error.statusCode = 413;
    throw error;
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Invalid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function validateRegistration(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const limits = {
    fullName: 120,
    phone: 30,
    email: 254,
    subscriptionPlan: 24,
    contentField: 120,
    experience: 120,
    goal: 500,
    notes: 1000,
  };
  const allowedKeys = new Set(Object.keys(limits));

  if (Object.keys(value).some((key) => !allowedKeys.has(key))) return null;
  const registration = {};

  for (const [key, maxLength] of Object.entries(limits)) {
    const field = value[key];
    if (typeof field !== "string" || field.length > maxLength) return null;
    const trimmed = field.trim();
    if (trimmed.length === 0) return null;
    registration[key] = trimmed;
  }

  if (registration.fullName.length < 2) return null;
  if (registration.phone.length < 7) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email)) {
    return null;
  }
  if (!["full", "installments", "single-day"].includes(registration.subscriptionPlan)) {
    return null;
  }

  return registration;
}

function getAppsScriptEndpoint() {
  const rawUrl = process.env.APPS_SCRIPT_URL?.trim();
  const secret = process.env.APPS_SCRIPT_SECRET?.trim();
  if (!rawUrl || !secret || secret.length < 32) return null;

  try {
    const url = new URL(rawUrl);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "script.google.com" ||
      !/^\/macros\/s\/[^/]+\/exec$/.test(url.pathname)
    ) {
      return null;
    }
    return { url: url.toString(), secret };
  } catch {
    return null;
  }
}

async function forwardRegistration(endpoint, registration) {
  const response = await fetch(endpoint.url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: endpoint.secret,
      registration,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const responseText = await response.text();
  let result;
  try {
    result = JSON.parse(responseText);
  } catch {
    result = null;
  }

  return response.ok && result?.success === true;
}

async function handleRequest(request, response) {
  const origin = getOrigin(request);

  if (request.method === "OPTIONS") {
    sendPreflight(response, origin);
    return;
  }

  if (!isAllowedOrigin(origin)) {
    sendJson(response, 403, { error: "مصدر الطلب غير مسموح." });
    return;
  }

  const requestUrl = new URL(
    request.url ?? "/",
    `http://${request.headers.host ?? "localhost"}`,
  );

  if (request.method === "GET" && requestUrl.pathname === "/api/healthz") {
    sendJson(response, 200, { status: "ok" }, origin);
    return;
  }

  if (
    request.method !== "POST" ||
    requestUrl.pathname !== "/api/registrations"
  ) {
    sendJson(response, 404, { error: "المسار غير موجود." }, origin);
    return;
  }

  const clientIp =
    typeof request.headers["x-real-ip"] === "string"
      ? request.headers["x-real-ip"]
      : "unknown";
  if (isRateLimited(clientIp)) {
    sendJson(
      response,
      429,
      { error: "وصلت للحد المؤقت من الطلبات. حاول مرة ثانية بعد ١٥ دقيقة." },
      origin,
    );
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? Number(error.statusCode)
        : 400;
    const message =
      statusCode === 413
        ? "حجم الطلب أكبر من المسموح."
        : statusCode === 415
          ? "صيغة الطلب غير مدعومة."
          : "صيغة الطلب غير صالحة.";
    sendJson(response, statusCode, { error: message }, origin);
    return;
  }

  const registration = validateRegistration(body);
  if (!registration) {
    sendJson(
      response,
      400,
      { error: "يرجى التأكد من المعلومات المدخلة." },
      origin,
    );
    return;
  }

  const endpoint = getAppsScriptEndpoint();
  if (!endpoint) {
    sendJson(
      response,
      503,
      {
        error: "نموذج التسجيل قيد التفعيل. تواصل معنا على واتساب حالياً.",
      },
      origin,
    );
    return;
  }

  try {
    const planLabels = {
      full: "الورشة كاملة، دفع كامل، ١٢٥٬٠٠٠ دينار",
      installments:
        "الورشة كاملة على دفعتين: ٧٥٬٠٠٠ للأيام الثلاثة الأولى و٥٠٬٠٠٠ قبل اليوم الرابع",
      "single-day": "يوم واحد، ٢٥٬٠٠٠ دينار",
    };
    const { subscriptionPlan, ...sheetRegistration } = registration;
    sheetRegistration.notes =
      `خيار الاشتراك: ${planLabels[subscriptionPlan]}\n\nملاحظة: ${registration.notes}`;
    const succeeded = await forwardRegistration(endpoint, sheetRegistration);
    if (!succeeded) {
      console.error("Apps Script rejected or failed to save a registration.");
      sendJson(
        response,
        502,
        { error: "تعذّر إرسال التسجيل الآن. حاول مرة ثانية بعد قليل." },
        origin,
      );
      return;
    }

    sendJson(
      response,
      201,
      {
        success: true,
        message: "وصل تسجيلك بنجاح، ننتظرك بورشة سلس.",
      },
      origin,
    );
  } catch (error) {
    console.error(
      "Apps Script request failed:",
      error instanceof Error ? error.name : "UnknownError",
    );
    sendJson(
      response,
      502,
      { error: "تعذّر إرسال التسجيل الآن. حاول مرة ثانية بعد قليل." },
      origin,
    );
  }
}

const server = createServer((request, response) => {
  void handleRequest(request, response).catch((error) => {
    console.error(
      "Unhandled API error:",
      error instanceof Error ? error.name : "UnknownError",
    );
    if (!response.headersSent) {
      sendJson(response, 500, {
        error: "حدث خطأ غير متوقع. حاول مرة ثانية لاحقاً.",
      });
    } else {
      response.destroy();
    }
  });
});

server.listen(PORT, HOST, () => {
  console.info(`Workshop API listening on ${HOST}:${PORT}`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    clearInterval(cleanupTimer);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
