// TEMPORARY diagnostic route — safe to delete once SMTP connectivity is confirmed.
// Reports DNS/TCP reachability to the mail host only. Never touches SMTP auth or secrets.
const express = require("express");
const dns = require("dns");
const net = require("net");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const DIAG_KEY = "ays-smtp-diag-temp-2026";

router.get("/smtp-check", asyncHandler(async (req, res) => {
  if (req.query.key !== DIAG_KEY) {
    return res.status(404).json({ message: "Not found" });
  }

  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const ports = [587, 465];

  const result = { host, dns: null, checks: null };

  try {
    const addresses = await dns.promises.resolve4(host);
    result.dns = { ok: true, addresses };
  } catch (error) {
    result.dns = { ok: false, code: error.code || null, message: error.message };
    return res.json(result);
  }

  const tcpCheck = (targetPort) => new Promise((resolve) => {
    const start = Date.now();
    const socket = net.createConnection({ host, port: targetPort, family: 4 });
    const timeoutMs = 8000;

    const finish = (data) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve({ durationMs: Date.now() - start, ...data });
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish({ ok: true }));
    socket.once("timeout", () => finish({ ok: false, code: "ETIMEDOUT" }));
    socket.once("error", (error) => finish({ ok: false, code: error.code || null, message: error.message }));
  });

  result.checks = [];
  for (const targetPort of ports) {
    result.checks.push({ port: targetPort, tcp: await tcpCheck(targetPort) });
  }

  res.json(result);
}));

module.exports = router;
