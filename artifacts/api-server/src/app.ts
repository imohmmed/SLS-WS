import express, { type ErrorRequestHandler, type Express } from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const allowedOrigins = new Set([
  "https://sls-iq.com",
  "https://www.sls-iq.com",
]);

const registrationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "وصلت للحد المؤقت من الطلبات. حاول مرة ثانية بعد ١٥ دقيقة.",
  },
});

// Trust only the nearest ingress hop for accurate rate-limit client addresses.
app.set("trust proxy", 1);
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      const isLocalDevelopmentOrigin =
        process.env["NODE_ENV"] !== "production" &&
        (origin?.endsWith(".replit.dev") === true ||
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin ?? ""));

      callback(
        null,
        !origin || allowedOrigins.has(origin) || isLocalDevelopmentOrigin,
      );
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    maxAge: 86400,
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.post("/api/registrations", registrationRateLimit);
app.use("/api", router);

const requestErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.too.large"
  ) {
    res.status(413).json({ error: "حجم الطلب أكبر من المسموح." });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    res.status(400).json({ error: "صيغة الطلب غير صالحة." });
    return;
  }

  req.log.error({ err: error }, "Unhandled API request error");
  res.status(500).json({ error: "حدث خطأ غير متوقع. حاول مرة ثانية لاحقاً." });
};

app.use(requestErrorHandler);

export default app;
