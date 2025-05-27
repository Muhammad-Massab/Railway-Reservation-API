const berthService = require("../services/berthService");
const { ApiError } = require("../utils/errors");

async function getAvailableTickets(req, res, next) {
  try {
    const result = await berthService.getAvailableTickets();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAvailableTickets,
};
