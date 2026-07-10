const User = require("../models/User");

/**
 * Create a summit ID in the format: AYSCDSAP-2026-{CC}-{NNNN}
 * where CC is a 2-letter ISO country code and NNNN is a zero-padded sequence.
 * Queries the database to find the highest existing sequence for the country code
 * and increments by 1.
 *
 * @param {string} [countryCode='INT'] - 2-letter ISO country code
 * @returns {Promise<string>} e.g. "AYSCDSAP-2026-KE-0001"
 */
async function createSummitId(countryCode) {
  countryCode = (countryCode || "INT").toUpperCase().substring(0, 2);

  const prefix = `AYSCDSAP-2026-${countryCode}-`;

  const latest = await User.findOne(
    { summitId: { $regex: `^${prefix}` } },
    { summitId: 1 }
  )
    .sort({ summitId: -1 })
    .lean();

  let nextSeq = 1;

  if (latest && latest.summitId) {
    const parts = latest.summitId.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  const paddedSeq = String(nextSeq).padStart(4, "0");
  return `${prefix}${paddedSeq}`;
}

module.exports = { createSummitId };
