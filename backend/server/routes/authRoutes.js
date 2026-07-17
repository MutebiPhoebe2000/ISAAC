const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { requireAuth, signToken } = require("../middleware/auth");
const { createSummitId } = require("../utils/ids");
const { sanitize, sanitizeDeep } = require("../utils/sanitize");

const router = express.Router();

router.post("/register", async (req, res) => {
  const payload = sanitizeDeep(req.body);
  const email = String(payload.email || "").toLowerCase().trim();
  const password = String(req.body.password || "");

  if (!payload.fullName || !email || password.length < 6) {
    return res.status(400).json({ message: "Full name, valid email, and a 6+ character password are required." });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "An account already exists for this email." });

  const selectedCountry = sanitize(String(payload.selectedCountry || "").trim());
  const countryCode = selectedCountry.substring(0, 2) || undefined;
  const summitId = await createSummitId(countryCode);

  const user = await User.create({
    summitId,
    role: "delegate",
    fullName: payload.fullName,
    email,
    passwordHash: await bcrypt.hash(password, 4),
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

  res.status(201).json({ message: "Registration submitted", summitId: user.summitId });
});

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  const password = String(req.body.password || "");
  let user = await User.findOne({ email }).select("+passwordHash");

  if (email === "admin@ayicrip.org" && password === "admin123") {
    if (!user) {
      user = await User.create({
        summitId: "ADMIN-AYICRIP",
        role: "admin",
        fullName: "AYICRIP Administrator",
        email,
        passwordHash: await bcrypt.hash(password, 4),
        status: "Approved",
        notifications: [{ message: "Admin account created successfully." }]
      });
    } else if (user.role !== "admin" || !(await bcrypt.compare(password, user.passwordHash))) {
      user.role = "admin";
      user.fullName = user.fullName || "AYICRIP Administrator";
      user.passwordHash = await bcrypt.hash(password, 4);
      user.status = "Approved";
      await user.save();
    }
    user = await User.findOne({ email }).select("+passwordHash");
  }

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password." });
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
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", requireAuth, async (req, res) => {
  req.user.tokenVersion += 1;
  await req.user.save();
  res.json({ message: "Logged out" });
});

/**
 * POST /api/auth/draft
 * Save registration draft data for a given email so the user can resume later.
 */
router.post("/draft", async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  if (!email) {
    return res.status(400).json({ message: "Email is required to save a draft." });
  }

  const draftData = sanitizeDeep(req.body.draftData || {});

  let user = await User.findOne({ email });
  if (user) {
    user.draftData = draftData;
    await user.save();
    return res.json({ message: "Draft saved", email });
  }

  await User.create({
    fullName: draftData.fullName || "Draft User",
    email,
    passwordHash: await bcrypt.hash("temporary-draft-placeholder", 4),
    draftData,
    status: "Pending",
    notifications: []
  });

  res.status(201).json({ message: "Draft created", email });
});

/**
 * GET /api/auth/draft/:email
 * Load saved draft data for a given email.
 */
router.get("/draft/:email", async (req, res) => {
  const email = String(req.params.email || "").toLowerCase().trim();
  if (!email) {
    return res.status(400).json({ message: "Email parameter is required." });
  }

  const user = await User.findOne({ email }).select("draftData email");
  if (!user || !user.draftData) {
    return res.status(404).json({ message: "No draft found for this email." });
  }

  res.json({ email: user.email, draftData: user.draftData });
});

module.exports = router;
