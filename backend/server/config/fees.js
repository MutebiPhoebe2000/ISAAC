const FeeSettings = require("../models/FeeSettings");

/* Used only to seed the database the first time it's read — the DB document
   created from this is the single source of truth from then on. */
const DEFAULT_FEES = {
  kenya: { currency: "USD", amount: 20, kesEquivalent: 2632 },
  international: { currency: "USD", amount: 15, kesEquivalent: 2000 }
};

async function getFeeSettings() {
  let settings = await FeeSettings.findOne({ key: "registrationFees" }).lean();
  if (!settings) {
    const created = await FeeSettings.create({ key: "registrationFees", ...DEFAULT_FEES });
    settings = created.toObject();
  }
  return settings;
}

function resolveFee(settings, countryCode) {
  return String(countryCode || "").toUpperCase() === "KE" ? settings.kenya : settings.international;
}

async function getRegistrationFeeForCountry(countryCode) {
  const settings = await getFeeSettings();
  return resolveFee(settings, countryCode);
}

module.exports = {
  DEFAULT_FEES,
  getFeeSettings,
  resolveFee,
  getRegistrationFeeForCountry
};
