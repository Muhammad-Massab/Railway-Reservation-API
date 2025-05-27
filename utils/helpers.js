const { v4: uuidv4 } = require("uuid");

function generatePnr() {
  return uuidv4().substring(0, 10).toUpperCase();
}

module.exports = {
  generatePnr,
};
