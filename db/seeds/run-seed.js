const devData = require("../data/development-data/index.js");
const seed = require("./seed.js");
const db = require("../connection.js");

const runSeed = () => {
  return seed(devData)
    .then(() => {
      console.log("Seeding complete");
    })
    .finally(() => {
      db.end();
    });
};

runSeed().catch((err) => {
  console.error("Seeding failed", err);
});
