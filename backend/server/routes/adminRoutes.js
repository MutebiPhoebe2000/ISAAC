const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");
const { createSummitId } = require("../utils/ids");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

/**
 * Escape RegExp special characters to prevent ReDoS attacks.
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get("/users", async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "8", 10), 1), 50);
  const search = String(req.query.search || "").trim();
  const status = String(req.query.status || "").trim();
  const role = String(req.query.role || "").trim();

  const query = {};
  if (status) query.status = status;
  if (role) query.role = role;
  if (search) {
    const escaped = escapeRegExp(search);
    query.$or = [
      { fullName: new RegExp(escaped, "i") },
      { email: new RegExp(escaped, "i") },
      { summitId: new RegExp(escaped, "i") },
      { country: new RegExp(escaped, "i") },
      { applicantType: new RegExp(escaped, "i") }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(query)
  ]);

  res.json({ users, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
});

router.get("/stats", async (_req, res) => {
  const users = await User.find({ role: "delegate" }).lean();
  const total = users.length;
  const approved = users.filter((user) => user.status === "Approved").length;
  const pending = users.filter((user) => user.status === "Pending").length;
  const rejected = users.filter((user) => user.status === "Rejected").length;
  const countries = new Set(users.map((user) => user.country || user.nationality).filter(Boolean));
  const checkedIn = users.filter((user) => user.stageTwo && user.stageTwo.checkedInAt).length;
  const flights = users.filter((user) => user.stageTwo && user.stageTwo.flightNo).length;
  const revenue = users.length * 30;
  const accommodationUnpaid = users.filter((user) => user.stageTwo && user.stageTwo.hotelSelection && !user.stageTwo.paymentMethod).length;
  const accommodationPaid = users.filter((user) => user.stageTwo && user.stageTwo.hotelSelection && user.stageTwo.paymentMethod).length;

  const countryCounts = {};
  users.forEach((user) => {
    const key = user.country || user.nationality || "Unspecified";
    countryCounts[key] = (countryCounts[key] || 0) + 1;
  });

  const genderCounts = {};
  users.forEach((user) => {
    const key = user.gender || "Unspecified";
    genderCounts[key] = (genderCounts[key] || 0) + 1;
  });

  const categoryCounts = {};
  users.forEach((user) => {
    const key = user.participantCategory || "Unspecified";
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  });

  res.json({
    total,
    approved,
    pending,
    rejected,
    countries: countries.size,
    checkedIn,
    flights: 0,
    revenue,
    accommodationPaid,
    accommodationUnpaid,
    countryCounts: Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count, percent: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    genderCounts: Object.entries(genderCounts)
      .map(([gender, count]) => ({ gender, count, percent: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count),
    categoryCounts: Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count, percent: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
  });
});

router.post("/users", async (req, res) => {
  const password = req.body.password || "delegate123";
  const countryCode = req.body.country ? req.body.country.substring(0, 2) : undefined;
  const user = await User.create({
    summitId: req.body.summitId || await createSummitId(countryCode),
    role: req.body.role || "delegate",
    fullName: req.body.fullName,
    email: String(req.body.email || "").toLowerCase().trim(),
    passwordHash: await bcrypt.hash(password, 4),
    country: req.body.country,
    nationality: req.body.nationality,
    applicantType: req.body.applicantType,
    status: req.body.status || "Pending"
  });
  res.status(201).json({ user });
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

router.patch("/users/:id", async (req, res) => {
  const allowed = [
    "fullName",
    "email",
    "phone",
    "country",
    "nationality",
    "applicantType",
    "participantCategory",
    "status",
    "role"
  ];
  const updates = {};
  allowed.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
  });

  if (updates.email) updates.email = String(updates.email).toLowerCase().trim();
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});

router.delete("/users/:id", async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    return res.status(400).json({ message: "Admins cannot delete their own active account." });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User removed" });
});

router.post("/import", async (req, res) => {
  const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
  let imported = 0;

  for (const row of rows) {
    if (!row.email || !row.fullName) continue;
    const exists = await User.findOne({ email: String(row.email).toLowerCase().trim() });
    if (exists) continue;
    const countryCode = row.country ? row.country.substring(0, 2) : undefined;
    await User.create({
      summitId: row.summitId || await createSummitId(countryCode),
      role: row.role || "delegate",
      fullName: row.fullName,
      email: String(row.email).toLowerCase().trim(),
      passwordHash: await bcrypt.hash(row.password || "delegate123", 4),
      country: row.country,
      nationality: row.nationality,
      applicantType: row.applicantType,
      status: row.status || "Pending"
    });
    imported += 1;
  }

  res.json({ imported });
});

/**
 * POST /api/admin/bulk-approve
 * Bulk-approve multiple users by their IDs.
 * Body: { ids: ["id1", "id2", ...] }
 */
router.post("/bulk-approve", async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  if (ids.length === 0) {
    return res.status(400).json({ message: "No user IDs provided." });
  }

  const result = await User.updateMany(
    { _id: { $in: ids } },
    {
      $set: { status: "Approved" },
      $push: { notifications: { message: "Your application has been approved.", read: false, createdAt: new Date() } }
    }
  );

  res.json({ message: "Bulk approval complete", modifiedCount: result.modifiedCount });
});

/**
 * POST /api/admin/bulk-notify
 * Send a notification message to multiple users by their IDs.
 * Body: { ids: ["id1", "id2", ...], message: "..." }
 */
router.post("/bulk-notify", async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  const message = String(req.body.message || "").trim();

  if (ids.length === 0) {
    return res.status(400).json({ message: "No user IDs provided." });
  }
  if (!message) {
    return res.status(400).json({ message: "Notification message is required." });
  }

  const result = await User.updateMany(
    { _id: { $in: ids } },
    { $push: { notifications: { message, read: false, createdAt: new Date() } } }
  );

  res.json({ message: "Notifications sent", modifiedCount: result.modifiedCount });
});

/**
 * GET /api/admin/reports-data
 * Aggregate and return comprehensive reports data:
 * - All registered delegates
 * - Registered by country with totals
 * - Approved by country with totals
 */
router.get("/reports-data", async (_req, res) => {
  const users = await User.find({ role: "delegate" }).sort({ createdAt: -1 }).lean();

  const totalRegistered = users.length;
  const totalApproved = users.filter((u) => u.status === "Approved").length;
  const countries = new Set(
    users.map((u) => u.country || u.nationality).filter(Boolean)
  );

  /* Registered by country */
  const regByCountry = {};
  users.forEach((u) => {
    const key = u.country || u.nationality || "Unspecified";
    regByCountry[key] = (regByCountry[key] || 0) + 1;
  });

  /* Approved by country */
  const appByCountry = {};
  users
    .filter((u) => u.status === "Approved")
    .forEach((u) => {
      const key = u.country || u.nationality || "Unspecified";
      appByCountry[key] = (appByCountry[key] || 0) + 1;
    });

  const allDelegates = users.map((u) => ({
    summitId: u.summitId,
    fullName: u.fullName,
    email: u.email,
    country: u.country || u.nationality || "",
    status: u.status,
    category: u.participantCategory || u.applicantType || "",
    paymentMethod: u.stageTwo && u.stageTwo.paymentMethod,
    createdAt: u.createdAt
  }));

  const kenyanDelegates = allDelegates.filter((u) => String(u.country).toLowerCase() === "kenya");
  const internationalDelegates = allDelegates.filter((u) => String(u.country).toLowerCase() !== "kenya");
  const accommodation = users
    .filter((u) => u.stageTwo && u.stageTwo.hotelSelection)
    .map((u) => ({
      summitId: u.summitId,
      fullName: u.fullName,
      country: u.country || u.nationality || "",
      hotelSelection: u.stageTwo.hotelSelection,
      roomPreference: u.stageTwo.roomPreference || "",
      nights: u.stageTwo.nights || "",
      paid: Boolean(u.stageTwo.paymentMethod)
    }));

  res.json({
    totalRegistered,
    totalApproved,
    totalCountries: countries.size,
    registeredByCountry: Object.entries(regByCountry)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count),
    approvedByCountry: Object.entries(appByCountry)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count),
    kenyanDelegates,
    internationalDelegates,
    allDelegates,
    speakers: allDelegates.filter((u) => u.category === "speaker"),
    sponsors: allDelegates.filter((u) => u.category === "sponsor"),
    accommodationPaid: accommodation.filter((item) => item.paid),
    accommodationUnpaid: accommodation.filter((item) => !item.paid)
  });
});

module.exports = router;
