const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const connectDB = require("./server/config/db");
const authRoutes = require("./server/routes/authRoutes");
const adminRoutes = require("./server/routes/adminRoutes");
const participantRoutes = require("./server/routes/participantRoutes");
const exportRoutes = require("./server/routes/exportRoutes");
const contactRoutes = require("./server/routes/contactRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

/* Render (and most PaaS hosts) put this app behind a reverse proxy, which
   sets X-Forwarded-For to the real client IP. Without telling Express to
   trust that one hop, req.ip resolves to the proxy's own IP for every
   request — which would make the new rate limiters below either count
   all visitors as a single IP (one person's login attempts could lock out
   everyone) or, with newer express-rate-limit versions, refuse to start
   handling requests at all. "1" = trust exactly one proxy hop, the normal
   safe setting for Render/Heroku-style single-proxy deployments. */
app.set("trust proxy", 1);

/* This backend only ever returns JSON, PDFs, and CSVs to a separate
   frontend origin (Netlify) — it never serves HTML pages itself, so
   Helmet's Content-Security-Policy (an HTML/script-loading protection)
   isn't applicable here and is left off rather than risking a policy
   tuned for the wrong kind of app. crossOriginResourcePolicy is relaxed
   to "cross-origin" for the same reason: the frontend legitimately fetches
   this API (and downloads PDFs/CSVs from it) from a different origin, and
   Helmet's same-origin default would block that. Everything else uses
   Helmet's standard safe defaults (HSTS, removing X-Powered-By, etc.) on
   top of the existing manual header block below. */
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

/* ── Build allowed CORS origins ───────────────────────────────── */
const ALLOWED_ORIGINS = [
  "https://incomparable-torrone-1b1ae8.netlify.app", // production frontend (hardcoded fallback)
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500"
];

// Also allow the FRONTEND_URL env var if set on Render
if (process.env.FRONTEND_URL && !ALLOWED_ORIGINS.includes(process.env.FRONTEND_URL)) {
  ALLOWED_ORIGINS.push(process.env.FRONTEND_URL);
}

/* ── Security headers ─────────────────────────────────────────── */
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Render health checks, mobile apps)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ── Health check (used by Render to verify the service is up) ── */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ── API routes ───────────────────────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/participant", participantRoutes);
app.use("/api/exports", exportRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (_req, res) => {
  res.json({
    name: "AYS Summit API",
    status: "running",
    env: process.env.NODE_ENV || "development",
    frontend: "https://incomparable-torrone-1b1ae8.netlify.app"
  });
});

/* ── Global error handler ─────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  // Always log the full error server-side for debugging.
  console.error(err);

  /* err.status is only ever set by our own code deliberately throwing a
     safe, purpose-written message (e.g. the invitation-letter file-type
     check in adminRoutes.js). Anything without it is an unexpected
     exception — a raw Mongoose ValidationError/CastError, a DB hiccup,
     etc. — whose .message can contain internal field/schema/path details
     that shouldn't reach a website visitor, so those get a generic
     message instead while the real error is still logged above. */
  const status = err.status || 500;
  const message = err.status ? err.message : "Something went wrong. Please try again.";
  res.status(status).json({ message });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[${process.env.NODE_ENV || "development"}] AYS Summit API listening on port ${PORT}`);
      console.log(`Allowed CORS origins: ${ALLOWED_ORIGINS.join(", ")}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to MongoDB:", error.message);
    console.error(error.stack);
    process.exit(1);
  });
