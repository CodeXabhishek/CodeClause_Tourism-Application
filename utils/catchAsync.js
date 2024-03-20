/**@description: Global error handler function */
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => next(err));
};
