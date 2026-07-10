require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const connectDB = require("./server/config/db");
const authRoutes = require("./server/routes/authRoutes");
const adminRoutes = require("./server/routes/adminRoutes");
const participantRoutes = require("./server/routes/participantRoutes");
const exportRoutes = require("./server/routes/exportRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// View engine and static files moved to frontend

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
  origin: [
    "https://incomparable-torrone-1b1ae8.netlify.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ── API routes ───────────────────────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/participant", participantRoutes);
app.use("/api/exports", exportRoutes);

/* ── Frontend Page Routes have been removed for Netlify deployment ── */

/* ── Global error handler ─────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Unexpected server error"
  });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ISAAC summit app running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  });
