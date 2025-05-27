const express = require("express");
const cors = require("cors");
const db = require("./config/database");
const apiRouter = require("./routes/api");
const { errorHandler } = require("./utils/errors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", apiRouter);

app.use(errorHandler);

db.initDb();

module.exports = app;
