(function () {
  "use strict";

  var registrationFees = {
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

  function formatMoney(fee) {
    return fee.currency + " " + fee.amount;
  }

  function formatFee(fee) {
    return formatMoney(fee) + " (Equivalent to KES " + fee.kesEquivalent.toLocaleString() + ")";
  }

  function forCountryCode(countryCode) {
    return String(countryCode || "").toUpperCase() === "KE"
      ? registrationFees.kenya
      : registrationFees.international;
  }

  function forDelegate(delegate) {
    if (delegate && delegate.registrationFee && delegate.registrationFee.amount) {
      return delegate.registrationFee;
    }
    return forCountryCode(delegate && delegate.selectedCountry);
  }

  window.ISAACFees = {
    registrationFees: registrationFees,
    forCountryCode: forCountryCode,
    forDelegate: forDelegate,
    formatMoney: formatMoney,
    formatFee: formatFee
  };
})();
