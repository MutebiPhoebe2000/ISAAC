/**
 * ISAAC Summit — African Countries Data Module
 * All 55 AU member states with ISO codes, languages, phone codes, and flag emojis.
 */
(function () {
  'use strict';

  /**
   * Each country entry:
   *   name       – English name
   *   code       – ISO 3166-1 alpha-2
   *   flag       – flag emoji
   *   phone      – phone country code
   *   languages  – array of { code, name } ordered by priority
   *   hasNIN     – whether the country commonly issues National ID Numbers
   */
  var AFRICAN_COUNTRIES = [
    { name: 'Algeria',                  code: 'DZ', flag: '🇩🇿', phone: '+213', languages: [{ code: 'ar', name: 'العربية' }, { code: 'fr', name: 'Français' }], hasNIN: true },
    { name: 'Angola',                   code: 'AO', flag: '🇦🇴', phone: '+244', languages: [{ code: 'pt', name: 'Português' }], hasNIN: true },
    { name: 'Benin',                    code: 'BJ', flag: '🇧🇯', phone: '+229', languages: [{ code: 'fr', name: 'Français' }], hasNIN: false },
    { name: 'Botswana',                 code: 'BW', flag: '🇧🇼', phone: '+267', languages: [{ code: 'en', name: 'English' }], hasNIN: true },
    { name: 'Burkina Faso',             code: 'BF', flag: '🇧🇫', phone: '+226', languages: [{ code: 'fr', name: 'Français' }], hasNIN: false },
    { name: 'Burundi',                  code: 'BI', flag: '🇧🇮', phone: '+257', languages: [{ code: 'rn', name: 'Kirundi' }, { code: 'fr', name: 'Français' }, { code: 'en', name: 'English' }], hasNIN: true },
    { name: 'Cabo Verde',               code: 'CV', flag: '🇨🇻', phone: '+238', languages: [{ code: 'pt', name: 'Português' }], hasNIN: false },
    { name: 'Cameroon',                 code: 'CM', flag: '🇨🇲', phone: '+237', languages: [{ code: 'en', name: 'English' }, { code: 'fr', name: 'Français' }], hasNIN: true },
    { name: 'Central African Republic',  code: 'CF', flag: '🇨🇫', phone: '+236', languages: [{ code: 'fr', name: 'Français' }], hasNIN: false },
    { name: 'Chad',                     code: 'TD', flag: '🇹🇩', phone: '+235', languages: [{ code: 'fr', name: 'Français' }, { code: 'ar', name: 'العربية' }], hasNIN: false },
    { name: 'Comoros',                  code: 'KM', flag: '🇰🇲', phone: '+269', languages: [{ code: 'fr', name: 'Français' }, { code: 'ar', name: 'العربية' }], hasNIN: false },
    { name: 'Congo (Brazzaville)',       code: 'CG', flag: '🇨🇬', phone: '+242', languages: [{ code: 'fr', name: 'Français' }], hasNIN: false },
    { name: 'Congo (DRC)',               code: 'CD', flag: '🇨🇩', phone: '+243', languages: [{ code: 'fr', name: 'Français' }, { code: 'sw', name: 'Kiswahili' }], hasNIN: false },
    { name: "Côte d'Ivoire",             code: 'CI', flag: '🇨🇮', phone: '+225', languages: [{ code: 'fr', name: 'Français' }], hasNIN: true },
    { name: 'Djibouti',                 code: 'DJ', flag: '🇩🇯', phone: '+253', languages: [{ code: 'fr', name: 'Français' }, { code: 'ar', name: 'العربية' }], hasNIN: false },
    { name: 'Egypt',                    code: 'EG', flag: '🇪🇬', phone: '+20',  languages: [{ code: 'ar', name: 'العربية' }], hasNIN: true },
    { name: 'Equatorial Guinea',         code: 'GQ', flag: '🇬🇶', phone: '+240', languages: [{ code: 'es', name: 'Español' }, { code: 'fr', name: 'Français' }], hasNIN: false },
    { name: 'Eritrea',                  code: 'ER', flag: '🇪🇷', phone: '+291', languages: [{ code: 'en', name: 'English' }, { code: 'ar', name: 'العربية' }], hasNIN: true },
    { name: 'Eswatini',                 code: 'SZ', flag: '🇸🇿', phone: '+268', languages: [{ code: 'en', name: 'English' }], hasNIN: true },
    { name: 'Ethiopia',                 code: 'ET', flag: '🇪🇹', phone: '+251', languages: [{ code: 'am', name: 'አማርኛ' }, { code: 'en', name: 'English' }], hasNIN: true },
    { name: 'Gabon',                    code: 'GA', flag: '🇬🇦', phone: '+241', languages: [{ code: 'fr', name: 'Français' }], hasNIN: false },
    { name: 'Gambia',                   code: 'GM', flag: '🇬🇲', phone: '+220', languages: [{ code: 'en', name: 'English' }], hasNIN: true },
    { name: 'Ghana',                    code: 'GH', flag: '🇬🇭', phone: '+233', languages: [{ code: 'en', name: 'English' }], hasNIN: true },
    { name: 'Guinea',                   code: 'GN', flag: '🇬🇳', phone: '+224', languages: [{ code: 'fr', name: 'Français' }], hasNIN: false },
    { name: 'Guinea-Bissau',             code: 'GW', flag: '🇬🇼', phone: '+245', languages: [{ code: 'pt', name: 'Português' }], hasNIN: false },
    { name: 'Kenya',                    code: 'KE', flag: '🇰🇪', phone: '+254', languages: [{ code: 'en', name: 'English' }, { code: 'sw', name: 'Kiswahili' }], hasNIN: true },
    { name: 'Lesotho',                  code: 'LS', flag: '🇱🇸', phone: '+266', languages: [{ code: 'en', name: 'English' }], hasNIN: true },
    { name: 'Liberia',                  code: 'LR', flag: '🇱🇷', phone: '+231', languages: [{ code: 'en', name: 'English' }], hasNIN: false },
    { name: 'Libya',                    code: 'LY', flag: '🇱🇾', phone: '+218', languages: [{ code: 'ar', name: 'العربية' }], hasNIN: true },
    { name: 'Madagascar',               code: 'MG', flag: '🇲🇬', phone: '+261', languages: [{ code: 'fr', name: 'Français' }], hasNIN: true },
    { name: 'Malawi',                   code: 'MW', flag: '🇲🇼', phone: '+265', languages: [{ code: 'en', name: 'English' }], hasNIN: true },
    { name: 'Mali',                     code: 'ML', flag: '🇲🇱', phone: '+223', languages: [{ code: 'fr', name: 'Français' }], hasNIN: false },
    { name: 'Mauritania',               code: 'MR', flag: '🇲🇷', phone: '+222', languages: [{ code: 'ar', name: 'العربية' }, { code: 'fr', name: 'Français' }], hasNIN: true },
    { name: 'Mauritius',                code: 'MU', flag: '🇲🇺', phone: '+230', languages: [{ code: 'en', name: 'English' }, { code: 'fr', name: 'Français' }], hasNIN: true },
    { name: 'Morocco',                  code: 'MA', flag: '🇲🇦', phone: '+212', languages: [{ code: 'ar', name: 'العربية' }, { code: 'fr', name: 'Français' }], hasNIN: true },
    { name: 'Mozambique',               code: 'MZ', flag: '🇲🇿', phone: '+258', languages: [{ code: 'pt', name: 'Português' }], hasNIN: true },
    { name: 'Namibia',                  code: 'NA', flag: '🇳🇦', phone: '+264', languages: [{ code: 'en', name: 'English' }], hasNIN: true },
    { name: 'Niger',                    code: 'NE', flag: '🇳🇪', phone: '+227', languages: [{ code: 'fr', name: 'Français' }], hasNIN: false },
    { name: 'Nigeria',                  code: 'NG', flag: '🇳🇬', phone: '+234', languages: [{ code: 'en', name: 'English' }], hasNIN: true },
    { name: 'Rwanda',                   code: 'RW', flag: '🇷🇼', phone: '+250', languages: [{ code: 'rw', name: 'Kinyarwanda' }, { code: 'en', name: 'English' }, { code: 'fr', name: 'Français' }], hasNIN: true },
    { name: 'Sahrawi Republic',          code: 'EH', flag: '🇪🇭', phone: '+212', languages: [{ code: 'ar', name: 'العربية' }], hasNIN: false },
    { name: 'São Tomé and Príncipe',     code: 'ST', flag: '🇸🇹', phone: '+239', languages: [{ code: 'pt', name: 'Português' }], hasNIN: false },
    { name: 'Senegal',                  code: 'SN', flag: '🇸🇳', phone: '+221', languages: [{ code: 'fr', name: 'Français' }], hasNIN: true },
    { name: 'Seychelles',               code: 'SC', flag: '🇸🇨', phone: '+248', languages: [{ code: 'en', name: 'English' }, { code: 'fr', name: 'Français' }], hasNIN: true },
    { name: 'Sierra Leone',             code: 'SL', flag: '🇸🇱', phone: '+232', languages: [{ code: 'en', name: 'English' }], hasNIN: false },
    { name: 'Somalia',                  code: 'SO', flag: '🇸🇴', phone: '+252', languages: [{ code: 'ar', name: 'العربية' }, { code: 'en', name: 'English' }], hasNIN: false },
    { name: 'South Africa',             code: 'ZA', flag: '🇿🇦', phone: '+27',  languages: [{ code: 'en', name: 'English' }, { code: 'zu', name: 'isiZulu' }, { code: 'xh', name: 'isiXhosa' }, { code: 'af', name: 'Afrikaans' }], hasNIN: true },
    { name: 'South Sudan',              code: 'SS', flag: '🇸🇸', phone: '+211', languages: [{ code: 'en', name: 'English' }], hasNIN: false },
    { name: 'Sudan',                    code: 'SD', flag: '🇸🇩', phone: '+249', languages: [{ code: 'ar', name: 'العربية' }, { code: 'en', name: 'English' }], hasNIN: true },
    { name: 'Tanzania',                 code: 'TZ', flag: '🇹🇿', phone: '+255', languages: [{ code: 'sw', name: 'Kiswahili' }, { code: 'en', name: 'English' }], hasNIN: true },
    { name: 'Togo',                     code: 'TG', flag: '🇹🇬', phone: '+228', languages: [{ code: 'fr', name: 'Français' }], hasNIN: false },
    { name: 'Tunisia',                  code: 'TN', flag: '🇹🇳', phone: '+216', languages: [{ code: 'ar', name: 'العربية' }, { code: 'fr', name: 'Français' }], hasNIN: true },
    { name: 'Uganda',                   code: 'UG', flag: '🇺🇬', phone: '+256', languages: [{ code: 'en', name: 'English' }, { code: 'sw', name: 'Kiswahili' }], hasNIN: true },
    { name: 'Zambia',                   code: 'ZM', flag: '🇿🇲', phone: '+260', languages: [{ code: 'en', name: 'English' }], hasNIN: true },
    { name: 'Zimbabwe',                 code: 'ZW', flag: '🇿🇼', phone: '+263', languages: [{ code: 'en', name: 'English' }], hasNIN: true }
  ];

  /** Find a country by code */
  function findByCode(code) {
    code = (code || '').toUpperCase();
    for (var i = 0; i < AFRICAN_COUNTRIES.length; i++) {
      if (AFRICAN_COUNTRIES[i].code === code) return AFRICAN_COUNTRIES[i];
    }
    return null;
  }

  /** Find a country by name (case-insensitive partial match) */
  function search(query) {
    query = (query || '').toLowerCase();
    if (!query) return AFRICAN_COUNTRIES.slice();
    return AFRICAN_COUNTRIES.filter(function (c) {
      return c.name.toLowerCase().indexOf(query) !== -1;
    });
  }

  /** Get the primary country code for Summit ID (2 letters) */
  function getCountryCode(countryName) {
    var name = (countryName || '').toLowerCase();
    for (var i = 0; i < AFRICAN_COUNTRIES.length; i++) {
      if (AFRICAN_COUNTRIES[i].name.toLowerCase() === name) return AFRICAN_COUNTRIES[i].code;
    }
    return 'INT'; /* International fallback */
  }

  /** Get language suggestions for a country */
  function getLanguages(countryCode) {
    var country = findByCode(countryCode);
    if (!country) return [{ code: 'en', name: 'English' }];
    /* Always include English if not already present */
    var langs = country.languages.slice();
    var hasEnglish = langs.some(function (l) { return l.code === 'en'; });
    if (!hasEnglish) langs.push({ code: 'en', name: 'English' });
    /* Always include Swahili option for East African countries */
    var eastAfrica = ['KE', 'TZ', 'UG', 'RW', 'BI', 'CD'];
    if (eastAfrica.indexOf(countryCode) !== -1) {
      var hasSwahili = langs.some(function (l) { return l.code === 'sw'; });
      if (!hasSwahili) langs.push({ code: 'sw', name: 'Kiswahili' });
    }
    return langs;
  }

  /** Check if country typically has NIN system */
  function hasNationalId(countryCode) {
    var country = findByCode(countryCode);
    return country ? country.hasNIN : false;
  }

  /** Determine if country is Kenya (host country) */
  function isHostCountry(countryCode) {
    return (countryCode || '').toUpperCase() === 'KE';
  }

  /* Expose globally */
  window.AfricanCountries = {
    list: AFRICAN_COUNTRIES,
    findByCode: findByCode,
    search: search,
    getCountryCode: getCountryCode,
    getLanguages: getLanguages,
    hasNationalId: hasNationalId,
    isHostCountry: isHostCountry
  };
})();
