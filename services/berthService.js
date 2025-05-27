const Berth = require("../models/Berth");
const TicketQueue = require("../models/TicketQueue");
const { MAX_WAITING_LIST } = require("../config/constants");

class BerthService {
  async getAvailableTickets() {
    const availableBerths = await Berth.listAvailable();
    const counts = await Berth.countAvailableByType();
    const waitingCount = await TicketQueue.countWaiting();

    return {
      available_berths: availableBerths,
      counts: counts.reduce((acc, row) => {
        acc[row.type] = row.count;
        return acc;
      }, {}),
      waiting_list_available: MAX_WAITING_LIST - waitingCount,
    };
  }
}

module.exports = new BerthService();
