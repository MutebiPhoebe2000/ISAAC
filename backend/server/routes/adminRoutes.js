const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const User = require("../models/User");
const FeeSettings = require("../models/FeeSettings");
const Activity = require("../models/Activity");
const { requireAuth, requireRole } = require("../middleware/auth");
const { createSummitId } = require("../utils/ids");
const asyncHandler = require("../utils/asyncHandler");
const { getFeeSettings, resolveFee } = require("../config/fees");
const {
  sendApprovalEmail,
  sendInvitationLetterEmail,
  sendActivityEmail
} = require("../services/email");
const router = express.Router();

/**
 * Strip HTML tags from admin-entered free text before it goes into an email
 * body. Emails are sent as plain text (no HTML rendering), so this is a
 * defense-in-depth measure against tag-injection rather than an XSS fix.
 */
function stripHtmlTags(str) {
  return String(str || "").replace(/<[^>]*>/g, "");
}

/**
 * The activity email/notification already auto-generates its own "Dear
 * {name}," greeting and "Regards, African Youth Summit 2026 Committee"
 * sign-off (see sendActivityEmail). If an admin also types a "Dear," opener
 * or a "Regards, ..." closer into the message body out of habit, this
 * removes those redundant lines so the final message only has one greeting
 * and one signature.
 */
function stripRedundantGreetingAndSignOff(str) {
  return String(str || "")
    .replace(/^\s*dear[\s,]*\n+/i, "")
    .replace(/\n*regards,?\s*\n+\s*african youth summit 2026(\s+(committee|secretariat))?\.?\s*$/i, "")
    .trim();
}

router.use(requireAuth, requireRole("admin"));

/**
 * Escape RegExp special characters to prevent ReDoS attacks.
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get("/users", asyncHandler(async (req, res) => {
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
}));

router.get("/stats", asyncHandler(async (_req, res) => {
  const [users, feeSettings] = await Promise.all([
    User.find({ role: "delegate" }).lean(),
    getFeeSettings()
  ]);
  const total = users.length;
  const approved = users.filter((user) => user.status === "Approved").length;
  const pending = users.filter((user) => user.status === "Pending").length;
  const rejected = users.filter((user) => user.status === "Rejected").length;
  const countries = new Set(users.map((user) => user.country || user.nationality).filter(Boolean));
  const checkedIn = users.filter((user) => user.stageTwo && user.stageTwo.checkedInAt).length;
  const flights = users.filter((user) => user.stageTwo && user.stageTwo.flightNo).length;
  const revenue = users.reduce((total, user) => total + feeForUser(user, feeSettings).amount, 0);
  /* Accommodation payments are not yet collected — always report as unpaid
     until real accommodation payment tracking exists (paymentStatus only
     reflects the registration fee). */
  const accommodationUnpaid = users.filter((user) => user.stageTwo && user.stageTwo.hotelSelection).length;
  const accommodationPaid = 0;

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
}));

/**
 * GET /api/admin/fee-settings
 * PUT /api/admin/fee-settings
 * Admin-managed registration fee configuration. This is the single source
 * of truth read by registration, the participant dashboard, and reports —
 * updating it here keeps every surface in sync.
 */
router.get("/fee-settings", asyncHandler(async (_req, res) => {
  const feeSettings = await getFeeSettings();
  res.json({ feeSettings });
}));

router.put("/fee-settings", asyncHandler(async (req, res) => {
  const { amount, currency, kesEquivalent } = req.body;

  if (!Number.isFinite(Number(amount))) {
    return res.status(400).json({ message: "Provide a valid registration fee amount." });
  }

  const updates = {
    currency: currency || "USD",
    amount: Number(amount),
    kesEquivalent: Number(kesEquivalent) || 0
  };

  await getFeeSettings(); // ensure the singleton document exists before updating it
  const feeSettings = await FeeSettings.findOneAndUpdate(
    { key: "registrationFees" },
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.json({ feeSettings });
}));

router.post("/users", asyncHandler(async (req, res) => {
  const password = req.body.password || "delegate123";
  const countryCode = req.body.country ? req.body.country.substring(0, 2) : undefined;
  const feeSettings = await getFeeSettings();
  const user = await User.create({
    summitId: req.body.summitId || await createSummitId(countryCode),
    role: req.body.role || "delegate",
    fullName: req.body.fullName,
    email: String(req.body.email || "").toLowerCase().trim(),
    passwordHash: await bcrypt.hash(password, 4),
    country: req.body.country,
    nationality: req.body.nationality,
    applicantType: req.body.applicantType,
    selectedCountry: countryCode,
    registrationFee: resolveFee(feeSettings, countryCode),
    status: req.body.status || "Pending"
  });
  res.status(201).json({ user });
}));

router.get("/users/:id", asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
}));

router.patch("/users/:id", asyncHandler(async (req, res) => {
  const allowed = [
    "fullName",
    "email",
    "phone",
    "country",
    "nationality",
    "applicantType",
    "participantCategory",
    "status",
    "paymentStatus",
    "role"
  ];
  const updates = {};
  allowed.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
  });

  if (updates.email) updates.email = String(updates.email).toLowerCase().trim();

  const existing = await User.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "User not found" });

  if (updates.status === "Approved") {
    const resultingPaymentStatus = updates.paymentStatus || existing.paymentStatus;
    if (resultingPaymentStatus !== "Paid") {
      return res.status(400).json({ message: "This delegate must be marked Paid before they can be approved." });
    }
  }

  const isNewlyApproved = updates.status === "Approved" && existing.status !== "Approved";

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (isNewlyApproved) await sendApprovalEmail(user);

  res.json({ user });
}));

router.delete("/users/:id", asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    return res.status(400).json({ message: "Admins cannot delete their own active account." });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User removed" });
}));

router.post("/import", asyncHandler(async (req, res) => {
  const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
  let imported = 0;
  const feeSettings = await getFeeSettings();

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
      selectedCountry: countryCode,
      registrationFee: resolveFee(feeSettings, countryCode),
      status: row.status || "Pending"
    });
    imported += 1;
  }

  res.json({ imported });
}));

/**
 * POST /api/admin/bulk-approve
 * Bulk-approve multiple users by their IDs.
 * Body: { ids: ["id1", "id2", ...] }
 */
router.post("/bulk-approve", asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  if (ids.length === 0) {
    return res.status(400).json({ message: "No user IDs provided." });
  }

  const eligible = await User.find({ _id: { $in: ids }, paymentStatus: "Paid" }, { _id: 1, status: 1, fullName: 1, email: 1 }).lean();
  const eligibleIds = eligible.map((u) => u._id);
  const newlyApprovedIds = eligible.filter((u) => u.status !== "Approved").map((u) => u._id);
  const skipped = ids.length - eligibleIds.length;

  const result = eligibleIds.length
    ? await User.updateMany(
      { _id: { $in: eligibleIds } },
      {
        $set: { status: "Approved" },
        $push: { notifications: { message: "Your application has been approved.", read: false, createdAt: new Date() } }
      }
    )
    : { modifiedCount: 0 };

  if (newlyApprovedIds.length) {
    const newlyApprovedUsers = await User.find({ _id: { $in: newlyApprovedIds } });
    await Promise.all(newlyApprovedUsers.map((user) => sendApprovalEmail(user)));
  }

  res.json({
    message: skipped > 0
      ? `Bulk approval complete. ${skipped} delegate(s) were skipped because they are not yet marked Paid.`
      : "Bulk approval complete",
    modifiedCount: result.modifiedCount,
    skipped
  });
}));

/**
 * POST /api/admin/bulk-notify
 * Send a notification message to multiple users by their IDs.
 * Body: { ids: ["id1", "id2", ...], message: "..." }
 */
router.post("/bulk-notify", asyncHandler(async (req, res) => {
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
}));


/**
 * POST /api/admin/activity-email
 * Admin broadcasts an activity/announcement to all delegates or to delegates
 * from one country. The message is stored as an Activity, pushed into each
 * matching delegate's notifications (shown on their dashboard), and emailed
 * through Brevo — one API call per recipient so no delegate ever sees another
 * delegate's email address.
 * Body: { title, message, recipientType: "all" } OR
 *       { title, message, recipientType: "country", country: "Kenya" }
 */
router.post("/activity-email", asyncHandler(async (req, res) => {
  const title = String(req.body.title || "").trim();
  const message = String(req.body.message || "").trim();
  const recipientType = String(req.body.recipientType || "").trim();
  const country = String(req.body.country || "").trim();

  if (!title) {
    return res.status(400).json({ message: "Activity title is required." });
  }
  if (!message) {
    return res.status(400).json({ message: "Activity message is required." });
  }
  if (recipientType !== "all" && recipientType !== "country") {
    return res.status(400).json({ message: "Recipient type must be 'all' or 'country'." });
  }
  if (recipientType === "country" && !country) {
    return res.status(400).json({ message: "Country is required when sending by country." });
  }

  const query = { role: "delegate", email: { $exists: true, $nin: [null, ""] } };
  if (recipientType === "country") {
    query.country = new RegExp(`^${escapeRegExp(country)}$`, "i");
  }

  const delegates = await User.find(query).select("fullName email");

  if (delegates.length === 0) {
    return res.status(404).json({
      message: "No delegates with valid email addresses were found for this selection."
    });
  }

  const cleanTitle = stripHtmlTags(title);
  const cleanMessage = stripRedundantGreetingAndSignOff(stripHtmlTags(message));

  const notification = `${cleanTitle}: ${cleanMessage}`;
  await User.updateMany(
    { _id: { $in: delegates.map((d) => d._id) } },
    { $push: { notifications: { message: notification, read: false, createdAt: new Date() } } }
  );

  const results = await Promise.all(
    delegates.map((delegate) => sendActivityEmail(delegate, cleanTitle, cleanMessage))
  );
  const sentCount = results.filter((result) => result.ok).length;

  await Activity.create({
    title,
    message,
    recipientType,
    country: recipientType === "country" ? country : undefined,
    recipientCount: sentCount,
    createdBy: req.user._id
  });

  if (sentCount === 0) {
    return res.status(502).json({
      message: "The activity was posted to delegate dashboards, but the email could not be sent via Brevo. Check the server logs for details."
    });
  }

  res.json({
    message: sentCount < delegates.length
      ? `Activity email sent successfully to ${sentCount} delegate(s). ${delegates.length - sentCount} could not be emailed — check server logs.`
      : `Activity email sent successfully to ${sentCount} delegate(s).`,
    recipientCount: sentCount
  });
}));

/**
 * GET /api/admin/reports-data
 * Aggregate and return comprehensive reports data:
 * - All registered delegates
 * - Registered by country with totals
 * - Approved by country with totals
 */
router.get("/reports-data", asyncHandler(async (_req, res) => {
  const [users, feeSettings] = await Promise.all([
    User.find({ role: "delegate" }).sort({ createdAt: -1 }).lean(),
    getFeeSettings()
  ]);

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
    paymentStatus: u.paymentStatus === "Paid" ? "Paid" : "Not Paid",
    expectedPaymentAmount: feeForUser(u, feeSettings).amount,
    expectedPaymentCurrency: feeForUser(u, feeSettings).currency,
    expectedPaymentKesEquivalent: feeForUser(u, feeSettings).kesEquivalent,
    createdAt: u.createdAt
  }));

  const kenyanDelegates = allDelegates.filter((u) => String(u.country).toLowerCase() === "kenya");
  const internationalDelegates = allDelegates.filter((u) => String(u.country).toLowerCase() !== "kenya");
  /* Accommodation payments are not yet collected — every hotel selection is
     unpaid until real accommodation payment tracking exists (paymentStatus
     only reflects the registration fee). */
  const accommodation = users
    .filter((u) => u.stageTwo && u.stageTwo.hotelSelection)
    .map((u) => ({
      summitId: u.summitId,
      fullName: u.fullName,
      country: u.country || u.nationality || "",
      hotelSelection: u.stageTwo.hotelSelection,
      roomPreference: u.stageTwo.roomPreference || "",
      nights: u.stageTwo.nights || "",
      paid: false
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
}));

/**
 * Invitation letters — 100% admin-managed. Participants can only download
 * (see GET /api/participant/invitation-letter); they have no upload/generate/edit path.
 */
const INVITATION_LETTER_MIMETYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];
const invitationLetterUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!INVITATION_LETTER_MIMETYPES.includes(file.mimetype)) {
      const error = new Error("Only PDF or DOCX files are allowed.");
      error.status = 400;
      return cb(error);
    }
    cb(null, true);
  }
});

function generateInvitationLetterPdf(user) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).font("Helvetica-Bold").text("African Youth Summit 2026", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(14).font("Helvetica").fillColor("#00A99D").text("Official Invitation Letter", { align: "center" });
    doc.moveDown(2);

    doc.fillColor("#1F2937").fontSize(11).font("Helvetica");
    doc.text(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }));
    doc.moveDown();
    doc.text(`Dear ${user.fullName},`);
    doc.moveDown();
    doc.text(
      "On behalf of the Organizing Committee, we are pleased to formally invite you to attend the "
      + "African Youth Summit 2026, taking place in Mombasa, Kenya. Your registration and confirmed "
      + "attendance are recorded under the details below.",
      { align: "justify" }
    );
    doc.moveDown();
    doc.font("Helvetica-Bold").text(`Delegate Name: `, { continued: true }).font("Helvetica").text(user.fullName || "—");
    doc.font("Helvetica-Bold").text(`Summit ID: `, { continued: true }).font("Helvetica").text(user.summitId || "—");
    doc.font("Helvetica-Bold").text(`Country: `, { continued: true }).font("Helvetica").text(user.country || user.nationality || "—");
    doc.moveDown();
    doc.text(
      "This letter may be used to support visa applications or organizational travel authorization. "
      + "Please contact the organizing team should you require any additional documentation.",
      { align: "justify" }
    );
    doc.moveDown(2);
    doc.text("Warm regards,");
    doc.text("AYS Organizing Team");

    doc.end();
  });
}

router.post("/users/:id/invitation-letter/upload", invitationLetterUpload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.invitationLetter = {
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    data: req.file.buffer,
    uploadedAt: new Date()
  };
  await user.save();
  await sendInvitationLetterEmail(user, req.file.buffer, req.file.originalname, req.file.mimetype);

  res.json({
    message: "Invitation letter uploaded and emailed to the delegate.",
    invitationLetter: { fileName: user.invitationLetter.fileName, uploadedAt: user.invitationLetter.uploadedAt }
  });
}));

router.post("/users/:id/invitation-letter/generate", asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const buffer = await generateInvitationLetterPdf(user);
  const fileName = `Invitation_Letter_${user.summitId || user._id}.pdf`;

  user.invitationLetter = {
    fileName,
    mimeType: "application/pdf",
    data: buffer,
    uploadedAt: new Date()
  };
  await user.save();
  await sendInvitationLetterEmail(user, buffer, fileName, "application/pdf");

  res.json({
    message: "Invitation letter generated and emailed to the delegate.",
    invitationLetter: { fileName, uploadedAt: user.invitationLetter.uploadedAt }
  });
}));

router.get("/users/:id/invitation-letter", asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("+invitationLetter.data");
  if (!user || !user.invitationLetter || !user.invitationLetter.data) {
    return res.status(404).json({ message: "No invitation letter has been issued for this delegate yet." });
  }
  res.setHeader("Content-Type", user.invitationLetter.mimeType || "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${user.invitationLetter.fileName}"`);
  res.send(user.invitationLetter.data);
}));

module.exports = router;

function feeForUser(user, feeSettings) {
  return resolveFee(feeSettings);
}
