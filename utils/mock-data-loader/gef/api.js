const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;

const createApplication = async (data, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/application`,
    data
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const deleteApplication = async (data, token) => {
  console.log("DELETE", data._id);
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/application/${data._id}`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const listApplication = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/application?page=null&pageSize=null`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data.data;
};

const createMandatoryCriteriaVersioned = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/mandatory-criteria-versioned`,
    data: mandatoryCriteria,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const deleteMandatoryCriteriaVersioned = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/mandatory-criteria-versioned/${mandatoryCriteria.id}`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const listMandatoryCriteriaVersioned = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/mandatory-criteria-versioned`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data.mandatoryCriteria;
};


module.exports = {
  createApplication,
  deleteApplication,
  listApplication,
  createMandatoryCriteriaVersioned,
  deleteMandatoryCriteriaVersioned,
  listMandatoryCriteriaVersioned,
};