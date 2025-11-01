const express = require("express");
const cors = require("cors");
const routes = require("./routes/index");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", routes);

app.get("/", (req, res) => {
  res.send("Career Coders Server is Running 🚀");
});

module.exports = app;
