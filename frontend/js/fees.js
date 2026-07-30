(function () {
  "use strict";

  var registrationFee = {
    currency: "USD",
    amount: 30
  };

  function formatMoney(fee) {
    return fee.currency + " " + fee.amount;
  }

  window.ISAACFees = {
    registrationFee: registrationFee,
    formatMoney: formatMoney
  };
})();
