(function () {
  "use strict";

  /* Registration fees are configured on the backend (admin dashboard /
     database) so Kenya, international, and any future tier always resolve
     from one source of truth. Nothing here should hardcode an amount. */
  var settingsCache = null;
  var pendingFetch = null;

  function fetchSettings() {
    if (settingsCache) return Promise.resolve(settingsCache);
    if (pendingFetch) return pendingFetch;

    pendingFetch = window.ISAACApi.request('/api/auth/fee-settings', { method: 'GET' })
      .then(function (res) {
        settingsCache = res.feeSettings;
        pendingFetch = null;
        return settingsCache;
      })
      .catch(function (err) {
        pendingFetch = null;
        throw err;
      });

    return pendingFetch;
  }

  function formatMoney(fee) {
    return fee.currency + " " + fee.amount;
  }

  function formatFee(fee) {
    return formatMoney(fee) + " (Equivalent to KES " + fee.kesEquivalent.toLocaleString() + ")";
  }

  /**
   * Resolve the live fee for a country code from the backend. Returns a
   * Promise since there is no local copy of the fee amounts to fall back on.
   */
  function forCountryCode(countryCode) {
    return fetchSettings().then(function (settings) {
      return String(countryCode || "").toUpperCase() === "KE" ? settings.kenya : settings.international;
    });
  }

  /**
   * Resolve the fee for an already-registered delegate. Prefers the fee
   * amount saved on their record at registration time (so it never changes
   * retroactively if the dashboard rate is later updated); falls back to a
   * live lookup for older/incomplete records.
   */
  function forDelegate(delegate) {
    if (delegate && delegate.registrationFee && delegate.registrationFee.amount) {
      return Promise.resolve(delegate.registrationFee);
    }
    return forCountryCode(delegate && delegate.selectedCountry);
  }

  window.ISAACFees = {
    fetchSettings: fetchSettings,
    forCountryCode: forCountryCode,
    forDelegate: forDelegate,
    formatMoney: formatMoney,
    formatFee: formatFee
  };
})();
