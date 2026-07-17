/**
 * Sanitize a string to prevent stored XSS by escaping HTML-significant characters.
 */
function sanitize(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[<>&"']/g, function (c) {
    return { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/**
 * Recursively sanitize all string values in an object or array.
 */
function sanitizeDeep(value) {
  if (typeof value === "string") return sanitize(value);
  if (Array.isArray(value)) return value.map(sanitizeDeep);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const cleaned = {};
    for (const key of Object.keys(value)) {
      cleaned[key] = sanitizeDeep(value[key]);
    }
    return cleaned;
  }
  return value;
}

module.exports = { sanitize, sanitizeDeep };
