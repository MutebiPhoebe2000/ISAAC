const registrationFees = {
  kenya: {
    currency: "USD",
    amount: 19,
    kesEquivalent: 2500
  },
  international: {
    currency: "USD",
    amount: 15,
    kesEquivalent: 2000
  }
};

function getRegistrationFeeForCountry(countryCode) {
  return String(countryCode || "").toUpperCase() === "KE"
    ? registrationFees.kenya
    : registrationFees.international;
}

module.exports = {
  registrationFees,
  getRegistrationFeeForCountry
};
