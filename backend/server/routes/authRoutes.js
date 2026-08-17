const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const { requireAuth, signToken } = require("../middleware/auth");
const { createSummitId } = require("../utils/ids");
const { sanitize, sanitizeDeep } = require("../utils/sanitize");
const asyncHandler = require("../utils/asyncHandler");
const { getRegistrationFeeForCountry, getFeeSettings } = require("../config/fees");
const { sendRegistrationEmail } = require("../services/email");

const router = express.Router();

/* bcrypt work factor — 4 (the old value) is fast enough to brute-force
   offline; 12 is the current OWASP-recommended baseline. */
const BCRYPT_COST = 12;

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Deliberately generic — never reveal that a specific record is blocked,
   who blocked it, or why. */
const BLOCKED_REGISTRATION_MESSAGE =
  "Registration unavailable. Your registration cannot be completed. Please contact the AYS administration.";

/* Generous limits — enough headroom for genuine typos/retries (including
   many delegates behind one shared/conference-venue IP) while still
   blocking automated brute-force or mass-registration abuse. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only failed attempts count against the limit
  message: { message: "Too many login attempts. Please wait a few minutes and try again." }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many registration attempts from this network. Please try again later." }
});

router.post("/register", registerLimiter, asyncHandler(async (req, res) => {
  const payload = sanitizeDeep(req.body);
  const email = String(payload.email || "").toLowerCase().trim();
  const password = String(req.body.password || "");
  const phone = String(payload.phone || "").trim();

  if (!payload.fullName || !email || !EMAIL_FORMAT.test(email) || password.length < 6) {
    return res.status(400).json({ message: "Full name, valid email, and a 6+ character password are required." });
  }

  /* Blocked delegates are never deleted (so the block persists across
     attempts), so a match here can be either a normal duplicate account or
     a blocked one — those two cases must return different messages, and
     the blocked one must never reveal *why* internally. This check runs
     before any User.create() call, per the blocked-registration requirement. */
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.status === "Blocked") return res.status(403).json({ message: BLOCKED_REGISTRATION_MESSAGE });
    return res.status(409).json({ message: "An account already exists for this email." });
  }

  if (phone) {
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      if (existingPhone.status === "Blocked") return res.status(403).json({ message: BLOCKED_REGISTRATION_MESSAGE });
      return res.status(409).json({ message: "An account already exists for this phone number." });
    }
  }

  const selectedCountry = sanitize(String(payload.selectedCountry || "").trim());
  const countryCode = selectedCountry.substring(0, 2) || undefined;
  const summitId = await createSummitId(countryCode);
  const registrationFee = await getRegistrationFeeForCountry(countryCode);

  let user;
  try {
    user = await User.create({
      summitId,
      role: "delegate",
      fullName: payload.fullName,
      email,
      passwordHash: await bcrypt.hash(password, BCRYPT_COST),
      phone: payload.phone,
      whatsapp: payload.whatsapp,
      alternativeContact: payload.alternativeContact,
      address: payload.address,
      city: payload.city,
      country: payload.country,
      nationality: payload.nationality,
      gender: payload.gender,
      dateOfBirth: payload.dateOfBirth,
      applicantType: payload.applicantType,
      participantCategory: payload.participantCategory,
      passportNumber: payload.passportNumber,
      passportExpiry: payload.passportExpiry,
      nationalIdNumber: payload.nationalIdNumber,
      selectedCountry: selectedCountry || undefined,
      registrationFee,
      language: payload.language,
      idType: payload.idType,
      organization: payload.organization,
      motivation: payload.motivation,
      thematicInterests: payload.thematicInterests || [],
      support: payload.support,
      travel: payload.travel,
      medical: payload.medical,
      status: "Pending",
      notifications: [{ message: "Registration received. Your profile is pending review." }]
    });
  } catch (error) {
    if (error && error.code === 11000) {
      const field = error.keyPattern && error.keyPattern.phone ? "phone number" : "email";
      return res.status(409).json({ message: `An account already exists for this ${field}.` });
    }
    throw error;
  }

  await sendRegistrationEmail(user);

  res.status(201).json({ message: "Registration submitted", summitId: user.summitId });
}));

router.post("/login", loginLimiter, asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  const password = String(req.body.password || "");
  let user = await User.findOne({ email }).select("+passwordHash");

  /* One-time admin bootstrap: creates the very first admin account only —
     it can never promote or overwrite an existing account, and becomes
     permanently inert the moment any admin account exists anywhere in the
     database. (Previously this also promoted/reset the password of *any*
     existing account matching this email, which was a standing
     authentication-bypass risk.) Any admin who already has a working
     account keeps logging in exactly as before via the normal password
     check below — this block never runs for them since `user` is already set. */
  if (!user && email === "admin@ayicrip.org" && password === "admin123") {
    const adminAlreadyExists = await User.exists({ role: "admin" });
    if (!adminAlreadyExists) {
      await User.create({
        summitId: "ADMIN-AYS",
        role: "admin",
        fullName: "AYS Administrator",
        email,
        passwordHash: await bcrypt.hash(password, BCRYPT_COST),
        status: "Approved",
        notifications: [{ message: "Admin account created successfully." }]
      });
      user = await User.findOne({ email }).select("+passwordHash");
    }
  }

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  /* Checked only after the password is confirmed correct, so a blocked
     status is never revealed to someone who doesn't actually know the
     account's password (avoids a user-enumeration side channel). */
  if (user.status === "Blocked") {
    return res.status(403).json({ message: "Your account has been suspended. Please contact the AYS administration." });
  }

  res.json({
    token: signToken(user),
    user: {
      id: user._id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      summitId: user.summitId
    }
  });
}));

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", requireAuth, asyncHandler(async (req, res) => {
  req.user.tokenVersion += 1;
  await req.user.save();
  res.json({ message: "Logged out" });
}));

/**
 * GET /api/auth/fee-settings
 * Public read-only lookup of the current registration fee configuration.
 * Used by the registration wizard (before a session exists) and the admin
 * dashboard, both of which must reflect the same DB-backed source of truth.
 */
router.get("/fee-settings", asyncHandler(async (_req, res) => {
  const feeSettings = await getFeeSettings();
  res.json({ feeSettings });
}));

module.exports = router;
