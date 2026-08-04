require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const connectDB = require("./server/config/db");
const authRoutes = require("./server/routes/authRoutes");
const adminRoutes = require("./server/routes/adminRoutes");
const participantRoutes = require("./server/routes/participantRoutes");
const exportRoutes = require("./server/routes/exportRoutes");
const contactRoutes = require("./server/routes/contactRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

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
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong. Please try again."
  });
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
