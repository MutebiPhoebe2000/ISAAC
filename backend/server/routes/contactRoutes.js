const express = require("express");
const ContactMessage = require("../models/Contact");
const { sanitize } = require("../utils/sanitize");

const router = express.Router();

router.post("/", async (req, res) => {
  const name = sanitize(String(req.body.name || "").trim());
  const email = sanitize(String(req.body.email || "").toLowerCase().trim());
  const subject = sanitize(String(req.body.subject || "").trim());
  const message = sanitize(String(req.body.message || "").trim());

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "Name, email, subject, and message are all required." });
  }

  await ContactMessage.create({ name, email, subject, message });

  res.status(201).json({ message: "Message sent" });
});

module.exports = router;
