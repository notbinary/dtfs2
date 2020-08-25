const requestParams = (req) => {
  const {
    _id,
    bondId,
    loanId,
  } = req.params;
  const { userToken } = req.session;

  return {
    _id,
    bondId,
    loanId,
    userToken,
  };
};

export default requestParams;