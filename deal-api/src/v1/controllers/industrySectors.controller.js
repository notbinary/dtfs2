const assert = require('assert');
const db = require('../../drivers/db-client');
const utils = require('../../utils/array');

const sortIndustrySectors = (industrySectors) => utils.sortArrayAlphabetically(industrySectors, 'name').map((sector) => ({
  ...sector,
  classes: utils.sortArrayAlphabetically(sector.classes, 'name'),
}));

const findIndustrySectors = async (callback) => {
  const collection = await db.getCollection('industrySectors');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneIndustrySector = async (code, callback) => {
  const collection = await db.getCollection('industrySectors');

  collection.findOne({ code }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('industrySectors');
  const industrySector = await collection.insertOne(req.body);

  res.status(200).send(industrySector);
};

exports.findAll = (req, res) => (
  findIndustrySectors((industrySectors) => res.status(200).send({
    count: industrySectors.length,
    industrySectors: sortIndustrySectors(industrySectors),
  }))
);

exports.findOne = (req, res) => (
  findOneIndustrySector(req.params.code, (industrySector) => res.status(200).send(industrySector))
);

exports.update = async (req, res) => {
  const collection = await db.getCollection('industrySectors');
  const status = await collection.updateOne({ code: { $eq: req.params.code } }, { $set: req.body }, {});
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('industrySectors');
  const status = await collection.deleteOne({ code: req.params.code });
  res.status(200).send(status);
};