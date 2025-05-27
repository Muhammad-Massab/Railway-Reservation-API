const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const berthController = require("../controllers/berthController");

router.post("/tickets/book", ticketController.bookTicket);
router.post("/tickets/cancel/:ticketId", ticketController.cancelTicket);
router.get("/tickets/booked", ticketController.getBookedTickets);

router.get("/tickets/available", berthController.getAvailableTickets);

module.exports = router;
