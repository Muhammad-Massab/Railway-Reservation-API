const ticketService = require("../services/ticketService");
const { ApiError } = require("../utils/errors");

async function bookTicket(req, res, next) {
  try {
    const { name, age, gender } = req.body;

    if (!name || !age || !gender) {
      throw new ApiError(400, "Name, age and gender are required");
    }

    const result = await ticketService.bookTicket({ name, age, gender });

    res.status(201).json({
      message: "Ticket booked successfully",
      pnr: result.ticket.pnr,
      status: result.ticket.status,
      passenger: result.passenger,
    });
  } catch (err) {
    next(err);
  }
}

async function cancelTicket(req, res, next) {
  try {
    const ticketId = parseInt(req.params.ticketId);
    if (isNaN(ticketId)) throw new ApiError(400, "Invalid ticket ID");

    await ticketService.cancelTicket(ticketId);

    res.json({ message: "Ticket cancelled successfully" });
  } catch (err) {
    next(err);
  }
}

async function getBookedTickets(req, res, next) {
  try {
    const result = await ticketService.getBookedTickets();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  bookTicket,
  cancelTicket,
  getBookedTickets,
};
