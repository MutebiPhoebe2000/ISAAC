const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/*
 * JWT_SECRET must come from the environment in production — a hardcoded
 * fallback would be a publicly-known value (visible to anyone with the
 * source) that could be used to forge admin tokens. If it's ever missing,
 * generate a random secret for this process instead of using a known
 * constant. This intentionally does NOT crash the server (a missing env
 * var shouldn't take the whole site down), but every existing session is
 * invalidated on restart until JWT_SECRET is actually configured — set it
 * in Render's environment variables to avoid that.
 */
let ephemeralSecret = null;
function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (!ephemeralSecret) {
    console.error(
      "[SECURITY WARNING] JWT_SECRET is not set. Using a random secret generated for this process only — " +
      "all logged-in sessions will be invalidated on the next restart. Set JWT_SECRET in your environment."
    );
    ephemeralSecret = crypto.randomBytes(48).toString("hex");
  }
  return ephemeralSecret;
}

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Authentication required" });

    const payload = jwt.verify(token, getJwtSecret());
    const user = await User.findById(payload.id);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Session expired" });
    }

    req.user = user;
    next();
  } catch (_error) {
    res.status(401).json({ message: "Invalid or expired session" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, signToken };
