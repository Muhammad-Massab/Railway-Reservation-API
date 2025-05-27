const { v4: uuidv4 } = require("uuid");
const Passenger = require("../models/Passenger");
const Berth = require("../models/Berth");
const Ticket = require("../models/Ticket");
const TicketQueue = require("../models/TicketQueue");
const {
  BERTH_TYPES,
  TICKET_STATUS,
  MAX_WAITING_LIST,
} = require("../config/constants");

class TicketService {
  async bookTicket(passengerData) {
    const { name, age, gender } = passengerData;
    const isChild = age < 5;

    const passenger = await Passenger.create({
      name,
      age,
      gender,
      isChildWithParent: isChild,
    });

    const pnr = uuidv4().substring(0, 10).toUpperCase();

    let status = TICKET_STATUS.WAITING;
    let berthId = null;

    if (!isChild) {
      if (age >= 60 || (gender === "female" && passengerData.with_child)) {
        const lowerBerth = await Berth.findAvailableByType(BERTH_TYPES.LOWER);
        if (lowerBerth) {
          berthId = lowerBerth.id;
          status = TICKET_STATUS.CONFIRMED;
          await Berth.updateAvailability(berthId, false);
        }
      }

      if (!berthId && status !== TICKET_STATUS.CONFIRMED) {
        const confirmedBerth = await Berth.findAvailableConfirmed();
        if (confirmedBerth) {
          berthId = confirmedBerth.id;
          status = TICKET_STATUS.CONFIRMED;
          await Berth.updateAvailability(berthId, false);
        }
      }

      if (!berthId && status !== TICKET_STATUS.CONFIRMED) {
        const racBerth = await Berth.findAvailableByType(
          BERTH_TYPES.SIDE_LOWER
        );
        if (racBerth) {
          berthId = racBerth.id;
          status = TICKET_STATUS.RAC;
          await Berth.updateAvailability(berthId, false);
        }
      }

      if (!berthId && status !== TICKET_STATUS.CONFIRMED) {
        const waitingCount = await TicketQueue.countWaiting();
        if (waitingCount >= MAX_WAITING_LIST) {
          throw new Error("No tickets available");
        }
      }
    }

    const ticket = await Ticket.create({
      pnr,
      passengerId: passenger.id,
      status,
      berthId,
    });

    if (status === TICKET_STATUS.WAITING) {
      await TicketQueue.add(ticket.id);
    }

    return { ticket, passenger };
  }

  async cancelTicket(ticketId) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new Error("Ticket not found");
    if (ticket.status === TICKET_STATUS.CANCELLED)
      throw new Error("Ticket already cancelled");

    let promotedTicket = null;

    await Ticket.updateStatus(ticket.id, TICKET_STATUS.CANCELLED);

    if (ticket.berth_id) {
      await Berth.updateAvailability(ticket.berth_id, true);

      if (ticket.status === TICKET_STATUS.CONFIRMED) {
        promotedTicket = await this._promoteRacToConfirmed(ticket.berth_id);
      } else if (ticket.status === TICKET_STATUS.RAC) {
        promotedTicket = await this._promoteWaitingToRac(ticket.berth_id);
      }
    } else if (ticket.status === TICKET_STATUS.WAITING) {
      await TicketQueue.remove(ticket.id);
    }

    return { cancelledTicket: ticket, promotedTicket };
  }

  async _promoteRacToConfirmed(freedBerthId) {
    const racTicket = await Ticket.findFirstRac();
    if (!racTicket) return null;

    const confirmedBerth = await Berth.findAvailableConfirmed();
    if (!confirmedBerth) return null;

    await Ticket.updateStatus(racTicket.id, TICKET_STATUS.CONFIRMED);
    await Berth.updateAvailability(confirmedBerth.id, false);

    await Berth.updateAvailability(racTicket.berth_id, true);

    await this._promoteWaitingToRac(racTicket.berth_id);

    return racTicket;
  }

  async _promoteWaitingToRac(racBerthId) {
    const waitingTicket = await Ticket.findFirstWaiting();
    if (!waitingTicket) return null;

    await Ticket.updateStatus(waitingTicket.id, TICKET_STATUS.RAC);
    await Berth.updateAvailability(racBerthId, false);
    await TicketQueue.remove(waitingTicket.id);

    return waitingTicket;
  }

  async getBookedTickets() {
    const tickets = await Ticket.listBooked();
    const summary = await Ticket.countByStatus();

    return {
      tickets,
      summary: summary.reduce(
        (acc, row) => {
          acc[row.status] = row.count;
          return acc;
        },
        { confirmed: 0, rac: 0 }
      ),
    };
  }
}

module.exports = new TicketService();
