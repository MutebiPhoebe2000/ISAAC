/**
 * Wraps an async Express route handler so a rejected promise is forwarded to
 * next(err) instead of becoming an unhandled rejection. Express 4 does not
 * catch async errors on its own, so without this a failed await inside a
 * route (a DB error, a validation error, a transient Atlas blip) leaves the
 * request hanging with no response, and can crash the whole process under
 * Node's default unhandled-rejection behavior.
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
