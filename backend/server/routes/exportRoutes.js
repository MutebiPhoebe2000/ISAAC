const express = require("express");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users.csv", asyncHandler(async (_req, res) => {
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
  res.setHeader("Content-Disposition", "attachment; filename=ayicrip_users.csv");
  res.send(lines.join("\n"));
}));

/* ── Brand palette (mirrors frontend/css/style.css) ─────────────── */
const NAVY = "#0B3D91";
const NAVY_DARK = "#072B66";
const TURQUOISE = "#00A99D";
const GOLD = "#D4A017";
const GOLD_LIGHT = "#F4C542";
const INK = "#1F2937";
const MUTED = "#6B7280";
const ROW_ALT = "#F1F5F9";
const BORDER = "#E2E8F0";

const STATUS_COLORS = {
  Approved: "#0F9D58",
  Pending: "#B7791F",
  Rejected: "#D93025"
};

const LOGO_PATH = path.join(__dirname, "..", "..", "..", "frontend", "imgs", "ayicrip.jpeg");

const COLUMNS = [
  { key: "fullName", label: "Full Name", width: 128 },
  { key: "gender", label: "Gender", width: 52 },
  { key: "country", label: "Country", width: 78 },
  { key: "organization", label: "Organization", width: 118 },
  { key: "email", label: "Email", width: 162 },
  { key: "phone", label: "Phone", width: 82 },
  { key: "status", label: "Reg. Status", width: 68 },
  { key: "payment", label: "Payment", width: 68 }
];

router.get("/summary.pdf", asyncHandler(async (_req, res) => {
  const delegates = await User.find({ role: "delegate" }).sort({ fullName: 1 }).lean();

  /* Group by country (mirrors the grouping used by /api/admin/reports-data) */
  const groups = {};
  delegates.forEach((delegate) => {
    const key = (delegate.country || delegate.nationality || "Unspecified").trim() || "Unspecified";
    if (!groups[key]) groups[key] = [];
    groups[key].push(delegate);
  });

  const countries = Object.keys(groups).sort((a, b) => {
    if (a === "Unspecified") return 1;
    if (b === "Unspecified") return -1;
    return a.localeCompare(b);
  });

  const statusCounts = { Approved: 0, Pending: 0, Rejected: 0 };
  delegates.forEach((delegate) => {
    statusCounts[delegate.status] = (statusCounts[delegate.status] || 0) + 1;
  });

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40, bufferPages: true });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=ayicrip_delegate_directory.pdf");
  doc.pipe(res);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const contentWidth = right - left;
  const contentBottom = doc.page.height - doc.page.margins.bottom - 34;

  const generatedLabel = new Date().toLocaleString("en-GB", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  function drawLogo(x, y, size) {
    try {
      if (fs.existsSync(LOGO_PATH)) {
        doc.image(LOGO_PATH, x, y, { width: size, height: size });
      }
    } catch (err) {
      /* logo is a nice-to-have; never let it break PDF generation */
    }
  }

  function drawMainHeader() {
    let cursorY = doc.page.margins.top;
    drawLogo(left, cursorY, 54);

    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(19)
      .text("AYICRIP AFRICA YOUTH SUMMIT 2026", left + 66, cursorY + 2, { width: contentWidth - 66 });
    doc.fillColor(TURQUOISE).font("Helvetica-Bold").fontSize(12)
      .text("OFFICIAL DELEGATE DIRECTORY", left + 66, cursorY + 25, { width: contentWidth - 66, characterSpacing: 1 });
    doc.fillColor(MUTED).font("Helvetica").fontSize(9)
      .text(`Generated ${generatedLabel}`, left + 66, cursorY + 42, { width: contentWidth - 66 });

    cursorY += 62;
    doc.moveTo(left, cursorY).lineTo(right, cursorY).lineWidth(2).strokeColor(GOLD).stroke();
    cursorY += 4;
    doc.moveTo(left, cursorY).lineTo(right, cursorY).lineWidth(0.5).strokeColor(NAVY).stroke();
    cursorY += 14;

    const summary = `Total Delegates: ${delegates.length}   |   Countries Represented: ${countries.length}   |   `
      + `Approved: ${statusCounts.Approved || 0}    Pending: ${statusCounts.Pending || 0}    Rejected: ${statusCounts.Rejected || 0}`;
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(9.5).text(summary, left, cursorY, { width: contentWidth });
    cursorY += 20;
    return cursorY;
  }

  function drawRunningHeader() {
    let cursorY = doc.page.margins.top;
    drawLogo(left, cursorY, 26);
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11)
      .text("AYICRIP Africa Youth Summit 2026 — Delegate Directory", left + 34, cursorY + 7, { width: contentWidth - 34 });
    cursorY += 30;
    doc.moveTo(left, cursorY).lineTo(right, cursorY).lineWidth(1).strokeColor(GOLD).stroke();
    cursorY += 12;
    return cursorY;
  }

  function drawCountryHeader(countryName, count, yPos) {
    const rowH = 24;
    doc.roundedRect(left, yPos, contentWidth, rowH, 3).fill(NAVY);
    doc.rect(left, yPos, 5, rowH).fill(GOLD);
    doc.font("Helvetica-Bold").fontSize(11.5).fillColor("#FFFFFF")
      .text(countryName.toUpperCase(), left + 14, yPos + 6, { width: contentWidth - 160, lineBreak: false, ellipsis: true });
    doc.font("Helvetica").fontSize(9).fillColor(GOLD_LIGHT)
      .text(`${count} Delegate${count === 1 ? "" : "s"}`, right - 130, yPos + 7, { width: 120, align: "right" });
    return yPos + rowH + 6;
  }

  function drawTableHeaderRow(yPos) {
    const rowH = 20;
    doc.rect(left, yPos, contentWidth, rowH).fill(NAVY_DARK);
    let cx = left;
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#FFFFFF");
    COLUMNS.forEach((col) => {
      doc.text(col.label, cx + 6, yPos + 6, { width: col.width - 10, lineBreak: false, ellipsis: true });
      cx += col.width;
    });
    return yPos + rowH;
  }

  function drawDelegateRow(delegate, index, yPos) {
    const rowH = 20;
    if (index % 2 === 1) {
      doc.rect(left, yPos, contentWidth, rowH).fill(ROW_ALT);
    }

    const organization = delegate.organization && delegate.organization.name ? delegate.organization.name : "—";
    const paymentStatus = delegate.stageTwo && delegate.stageTwo.paymentMethod ? "Paid" : "Pending";
    const values = {
      fullName: delegate.fullName || "—",
      gender: delegate.gender || "—",
      country: delegate.country || delegate.nationality || "—",
      organization,
      email: delegate.email || "—",
      phone: delegate.phone || "—",
      status: delegate.status || "—",
      payment: paymentStatus
    };

    let cx = left;
    COLUMNS.forEach((col) => {
      if (col.key === "status") {
        doc.font("Helvetica-Bold").fillColor(STATUS_COLORS[values.status] || INK);
      } else if (col.key === "payment") {
        doc.font("Helvetica-Bold").fillColor(values.payment === "Paid" ? STATUS_COLORS.Approved : STATUS_COLORS.Pending);
      } else if (col.key === "fullName") {
        doc.font("Helvetica-Bold").fillColor(NAVY_DARK);
      } else {
        doc.font("Helvetica").fillColor(INK);
      }
      doc.fontSize(8).text(String(values[col.key]), cx + 6, yPos + 6, {
        width: col.width - 10, lineBreak: false, ellipsis: true
      });
      cx += col.width;
    });

    doc.moveTo(left, yPos + rowH).lineTo(right, yPos + rowH).lineWidth(0.4).strokeColor(BORDER).stroke();
    return yPos + rowH;
  }

  let y = drawMainHeader();

  if (!delegates.length) {
    doc.font("Helvetica-Oblique").fontSize(11).fillColor(MUTED)
      .text("No delegates have registered yet.", left, y + 10);
  }

  countries.forEach((countryName) => {
    const list = groups[countryName];

    if (y + 24 + 20 + 20 > contentBottom) {
      doc.addPage();
      y = drawRunningHeader();
    }
    y = drawCountryHeader(countryName, list.length, y);
    y = drawTableHeaderRow(y);

    list.forEach((delegate, idx) => {
      if (y + 20 > contentBottom) {
        doc.addPage();
        y = drawRunningHeader();
      }
      y = drawDelegateRow(delegate, idx, y);
    });

    y += 14;
  });

  if (delegates.length) {
    if (y + 60 > contentBottom) {
      doc.addPage();
      y = drawRunningHeader();
    }
    y += 6;
    doc.roundedRect(left, y, contentWidth, 46, 4).fillAndStroke(GOLD_LIGHT, GOLD);
    doc.font("Helvetica-Bold").fontSize(13).fillColor(NAVY_DARK)
      .text(
        `GRAND TOTAL: ${delegates.length} DELEGATE${delegates.length === 1 ? "" : "S"} ACROSS ${countries.length} COUNTR${countries.length === 1 ? "Y" : "IES"}`,
        left + 16, y + 10, { width: contentWidth - 32 }
      );
    doc.font("Helvetica").fontSize(9).fillColor(NAVY_DARK)
      .text(
        `Approved: ${statusCounts.Approved || 0}    Pending: ${statusCounts.Pending || 0}    Rejected: ${statusCounts.Rejected || 0}`,
        left + 16, y + 28, { width: contentWidth - 32 }
      );
  }

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const pageNum = i - range.start + 1;
    const footerY = doc.page.height - doc.page.margins.bottom - 22;
    doc.moveTo(left, footerY).lineTo(right, footerY).lineWidth(0.6).strokeColor(GOLD).stroke();
    doc.font("Helvetica").fontSize(8).fillColor(MUTED)
      .text("AYICRIP Africa Youth Summit 2026  •  Confidential Delegate Directory", left, footerY + 6, { width: contentWidth - 100 });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED)
      .text(`Page ${pageNum} of ${range.count}`, right - 100, footerY + 6, { width: 100, align: "right" });
  }

  doc.end();
}));

module.exports = router;
