(function () {
  "use strict";

  /* The registration fee is fixed and configured on the backend (admin
     dashboard / database) so every surface reads from one source of truth.
     It is the same for every delegate regardless of country. Nothing here
     should hardcode an amount. */
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
    return "$" + fee.amount;
  }

  function formatFee(fee) {
    return formatMoney(fee) + " (KSh " + fee.kesEquivalent.toLocaleString() + ")";
  }

  /**
   * Resolve the live registration fee. The fee is identical for every
   * delegate — countryCode is accepted only for backward compatibility
   * with existing callers and no longer affects the result.
   */
  function forCountryCode(countryCode) {
    return fetchSettings();
  }

  /**
   * Resolve the fee for a delegate. Always reflects the current fixed fee
   * so every delegate — new or previously registered — sees the same
   * amount everywhere.
   */
  function forDelegate(delegate) {
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
