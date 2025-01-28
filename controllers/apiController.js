const endpoints = require("../endpoints.json");

function getEndpoints(req, res) {
  res.status(200).send({ endpoints });
}

module.exports = { getEndpoints };
