const express = require("express");
const PDFDocument = require("pdfkit");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users.csv", async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  const headers = ["summitId", "role", "fullName", "email", "country", "applicantType", "status"];
  const lines = [
    headers.join(","),
    ...users.map((user) =>
      headers
        .map((key) => `"${String(user[key] || "").replace(/"/g, '""')}"`)
        .join(",")
    )
  ];

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=isaac_users.csv");
  res.send(lines.join("\n"));
});

router.get("/summary.pdf", async (_req, res) => {
  const users = await User.find({ role: "delegate" });
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=isaac_summary_report.pdf");
  doc.pipe(res);
  doc.fontSize(20).text("ISAAC Africa Youth Summit 2026", { align: "center" });
  doc.fontSize(15).text("Administrative Summary Report", { align: "center" });
  doc.moveDown(2);
  doc.fontSize(12).text(`Total delegates: ${users.length}`);
  doc.text(`Approved: ${users.filter((user) => user.status === "Approved").length}`);
  doc.text(`Pending: ${users.filter((user) => user.status === "Pending").length}`);
  doc.text(`Rejected: ${users.filter((user) => user.status === "Rejected").length}`);
  doc.moveDown();
  users.slice(0, 25).forEach((user) => {
    doc.text(`${user.summitId} - ${user.fullName} - ${user.country || "Africa-wide"} - ${user.status}`);
  });
  doc.end();
});

module.exports = router;
