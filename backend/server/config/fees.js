const FeeSettings = require("../models/FeeSettings");

/* Single fixed registration fee for every delegate, regardless of country.
   Used to seed the database the first time it's read, and to migrate an
   older per-country ("kenya"/"international") document shape if one exists
   from before pricing was unified — the DB document is the single source
   of truth for the fee amount from then on. */
const DEFAULT_FEE = { currency: "USD", amount: 20, kesEquivalent: 2500 };

async function getFeeSettings() {
  let settings = await FeeSettings.findOne({ key: "registrationFees" }).lean();
  if (!settings || typeof settings.amount !== "number") {
    settings = await FeeSettings.findOneAndUpdate(
      { key: "registrationFees" },
      { $set: DEFAULT_FEE, $unset: { kenya: "", international: "" } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
  }
  return settings;
}

/* The fee is fixed and identical for every delegate — country no longer
   affects the amount. Accepts a countryCode argument only so existing
   callers don't need to change. */
function resolveFee(settings) {
  return { currency: settings.currency, amount: settings.amount, kesEquivalent: settings.kesEquivalent };
}

async function getRegistrationFeeForCountry(countryCode) {
  const settings = await getFeeSettings();
  return resolveFee(settings);
}

module.exports = {
  DEFAULT_FEE,
  getFeeSettings,
  resolveFee,
  getRegistrationFeeForCountry
};
