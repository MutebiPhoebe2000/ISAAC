const express = require("express");
const PDFDocument = require("pdfkit");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireRole("delegate"));

// Profile photo upload placeholder:
// const multer = require("multer");
// const upload = multer({ dest: "uploads/profile-photos/", limits: { fileSize: 8 * 1024 * 1024 } });
// router.post("/profile-photo", upload.single("photo"), async (req, res) => {
//   req.user.profilePhotoUrl = `/uploads/profile-photos/${req.file.filename}`;
//   await req.user.save();
//   res.json({ profilePhotoUrl: req.user.profilePhotoUrl });
// });

router.patch("/profile", async (req, res) => {
  const allowed = ["fullName", "phone", "whatsapp", "address", "city", "country", "nationality"];
  allowed.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) req.user[key] = req.body[key];
  });
  await req.user.save();
  res.json({ user: req.user });
});

router.post("/stage-two", async (req, res) => {
  req.user.stageTwo = {
    ...req.user.stageTwo,
    packageSelection: req.body.packageSelection,
    hotelSelection: req.body.hotelSelection,
    roomPreference: req.body.roomPreference,
    nights: req.body.nights,
    checkIn: req.body.checkIn,
    checkOut: req.body.checkOut,
    airportTransfer: req.body.airportTransfer,
    flightNo: req.body.flightNo,
    pickupDate: req.body.pickupDate,
    pickupTime: req.body.pickupTime,
    paymentMethod: req.body.paymentMethod,
    paymentProofName: req.body.paymentProofName,
    apparelSize: req.body.apparelSize,
    language: req.body.language,
    travelHasPassport: req.body.travelHasPassport,
    departureAirport: req.body.departureAirport,
    arrivalDate: req.body.arrivalDate,
    departureDate: req.body.departureDate,
    medicalConditions: req.body.medicalConditions,
    allergies: req.body.allergies,
    dietaryPreference: req.body.dietaryPreference,
    emergencyName: req.body.emergencyName,
    emergencyPhone: req.body.emergencyPhone,
    emergencyRelationship: req.body.emergencyRelationship
  };

  if (req.body.travel) {
    req.user.travel = {
      hasPassport: req.body.travel.hasPassport,
      departureAirport: req.body.travel.departureAirport,
      arrivalDate: req.body.travel.arrivalDate,
      departureDate: req.body.travel.departureDate
    };
  }

  if (req.body.medical) {
    req.user.medical = {
      conditions: req.body.medical.conditions,
      allergies: req.body.medical.allergies,
      dietaryPreference: req.body.medical.dietaryPreference,
      emergencyName: req.body.medical.emergencyName,
      emergencyPhone: req.body.medical.emergencyPhone,
      emergencyRelationship: req.body.medical.emergencyRelationship
    };
  }

  req.user.notifications.push({ message: "Stage 2 package submitted and is awaiting verification." });
  await req.user.save();
  res.json({ user: req.user });
});

router.post("/check-in", async (req, res) => {
  req.user.stageTwo = { ...req.user.stageTwo, checkedInAt: new Date() };
  req.user.notifications.push({ message: "Delegate check-in confirmed." });
  await req.user.save();
  res.json({ user: req.user });
});

router.post("/check-out", async (req, res) => {
  req.user.stageTwo = { ...req.user.stageTwo, checkedOutAt: new Date() };
  req.user.notifications.push({ message: "Delegate check-out confirmed." });
  await req.user.save();
  res.json({ user: req.user });
});

router.get("/notifications", async (req, res) => {
  res.json({ notifications: req.user.notifications.slice(-10).reverse() });
});

router.get("/documents/:type", (req, res) => {
  const type = req.params.type === "certificate" ? "Participation Certificate" : "Official Invitation Letter";
  const doc = new PDFDocument({ margin: 50 });
  const filename = `${type.replace(/\s+/g, "_")}_${req.user.summitId}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);
  doc.fontSize(20).text("ISAAC Africa Youth Summit 2026", { align: "center" });
  doc.moveDown();
  doc.fontSize(16).text(type, { align: "center" });
  doc.moveDown(2);
  doc.fontSize(12).text(`Delegate: ${req.user.fullName}`);
  doc.text(`Summit ID: ${req.user.summitId}`);
  doc.text(`Country: ${req.user.country || req.user.nationality || "Africa-wide delegate"}`);
  doc.text(`Status: ${req.user.status}`);
  doc.moveDown();
  doc.text("This document is generated from the ISAAC summit registration platform.");
  doc.end();
});

module.exports = router;
