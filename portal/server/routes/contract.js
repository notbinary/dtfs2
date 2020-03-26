import express from 'express';
import api from '../api';

const router = express.Router();

router.get('/contract/:_id', async (req, res) => {
  const contract = await api.contract(req.params._id, req.session.userToken);
  res.render('contract/contract-view.njk', contract);
});

router.get('/contract/:id/comments', async (req, res) => res.render('contract/contract-view-comments.njk', await api.contract(req.params.id, req.session.userToken)));

router.get('/contract/:id/submission-details', async (req, res) => res.render('contract/contract-submission-details.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  mandatoryCriteria: await api.mandatoryCriteria(req.session.userToken),
}));

router.get('/contract/:id/delete', async (req, res) => res.render('contract/contract-delete.njk', await api.contract(req.params.id, req.session.userToken)));

router.get('/contract/:id/about/supplier', async (req, res) => res.render('about/about-supplier.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  countries: await api.countries(req.session.userToken),
  industrySectors: await api.industrySectors(req.session.userToken),
}));

router.get('/contract/:id/about/financial', async (req, res) => res.render('about/about-supply-financial.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  currencies: await api.bondCurrencies(req.session.userToken),
}));

router.get('/contract/:id/about/buyer', async (req, res) => res.render('about/about-supply-buyer.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  countries: await api.countries(req.session.userToken),
}));

router.get('/contract/:id/about/preview', async (req, res) => res.render('about/about-supply-preview.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
}));

router.get('/contract/:id/eligibility/criteria', async (req, res) => res.render('eligibility/eligibility-criteria.njk', await api.contract(req.params.id, req.session.userToken)));

router.get('/contract/:id/eligibility/supporting-documentation', async (req, res) => res.render('eligibility/eligibility-supporting-documentation.njk', await api.contract(req.params.id, req.session.userToken)));

router.get('/contract/:id/eligibility/preview', async (req, res) => res.render('eligibility/eligibility-preview.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  mandatoryCriteria: await api.mandatoryCriteria(req.session.userToken),
}));

router.get('/contract/:id/bond/:bondId/details', async (req, res) => res.render('bond/bond-details.njk',
  await api.contractBond(req.params.id, req.params.bondId, req.session.userToken)));

router.get('/contract/:id/bond/:bondId/financial-details', async (req, res) => res.render('bond/bond-financial-details.njk', {
  ...await api.contractBond(req.params.id, req.params.bondId, req.session.userToken),
  currencies: await api.bondCurrencies(req.session.userToken),
}));

router.get('/contract/:id/bond/:bondId/fee-details', async (req, res) => res.render('bond/bond-fee-details.njk',
  await api.contractBond(req.params.id, req.params.bondId, req.session.userToken)));

router.get('/contract/:id/bond/:bondId/preview', async (req, res) => res.render('bond/bond-preview.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  bond: api.contractBond(req.params.id, req.params.bondId, req.session.userToken),
}));

router.get('/contract/:id/bond/:bondId/delete', async (req, res) => res.render('bond/bond-delete.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  bond: api.contractBond(req.params.id, req.params.bondId, req.session.userToken),
}));

export default router;
