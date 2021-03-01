import api from '../../api';

const getLogin = (req, res) => res.render('login.njk');

const postLogin = async (req, res) => {
  const user = await api.login(req.body.email);

  console.log({ user });
  res.redirect('/case/deal/1000676');
};

export default {
  getLogin,
  postLogin,
};
