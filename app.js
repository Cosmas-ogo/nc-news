const express = require("express");
const app = express();
const endpoints = require("./endpoints.json");

app.get("/api", (request, response) => {
  response.status(200).send({ endpoints });
});

module.exports = app;
