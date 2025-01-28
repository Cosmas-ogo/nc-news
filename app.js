const express = require("express");

const app = express();
const { getTopics } = require("./controllers/topicsController");
const { getEndpoints } = require("./controllers/apiController");

app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.all("*", (req, res) => {
  res.status(404).send({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502") {
    res.status(400).send({ error: "Bad Request" });
  } else {
    next();
  }
});

app.use((err, req, res, next) => {
  if (err.message === "topic not found") {
    res.status(404).send({ error: "NOT found" });
  } else {
    next(err);
  }
});
app.use((err, req, res, next) => {
  res.status(500).send({ error: "Internal Server Error" });
});

module.exports = app;
