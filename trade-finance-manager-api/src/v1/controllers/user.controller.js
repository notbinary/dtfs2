const api = require('../api');

const findUser = async (username) => api.findUser(username);

exports.findUser = findUser;

const findUserGET = async (req, res) => {
  const { username } = req.params;
  const user = await findUser(username);

  if (!user) {
    return res.status(404).send();
  }

  return res.status(200).send({ user });
};
exports.findUserGET = findUserGET;
