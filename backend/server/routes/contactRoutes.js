const express = require("express");
const rateLimit = require("express-rate-limit");
const ContactMessage = require("../models/Contact");
const { sanitize } = require("../utils/sanitize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many messages sent. Please try again later." }
});

router.post("/", contactLimiter, asyncHandler(async (req, res) => {
  const name = sanitize(String(req.body.name || "").trim());
  const email = sanitize(String(req.body.email || "").toLowerCase().trim());
  const subject = sanitize(String(req.body.subject || "").trim());
  const message = sanitize(String(req.body.message || "").trim());

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "Name, email, subject, and message are all required." });
  }

  await ContactMessage.create({ name, email, subject, message });

  res.status(201).json({ message: "Message sent" });
}));

module.exports = router;
