const { fetchUsers } = require("../models/usersModel");
function getUsers(req, res, next) {
  fetchUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
}

module.exports = { getUsers };
