module.exports = (overrides) => {
  // some default json. Could be an actual deal; at time of writing we just need 'some json'..
  return {
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
    },
    ...overrides,
  };
};
