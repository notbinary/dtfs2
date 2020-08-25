import express from 'express';
import multer from 'multer';
import stream from 'stream';
import api from '../../../api';
import {
  getApiData,
  requestParams,
  generateErrorSummary,
  formatCountriesForGDSComponent,
} from '../../../helpers';
import {
  provide, DEAL, COUNTRIES,
} from '../../api-data-provider';
import submittedEligibilityMatchesOriginalData from './submittedEligibilityMatchesOriginalData';
import submittedDocumentationMatchesOriginalData from './submittedDocumentationMatchesOriginalData';

const upload = multer();

const router = express.Router();

const eligibilityErrorHref = (id) => `#criterion-group-${id}`;

const userCanAccessEligibility = (user) => {
  if (!user.roles.includes('maker')) {
    return false;
  }

  return true;
};

router.get('/contract/:_id/eligibility/criteria', provide([DEAL, COUNTRIES]), async (req, res) => {
  const { deal, countries } = req.apiData;

  const { user } = req.session;
  if (!userCanAccessEligibility(user)) {
    return res.redirect('/');
  }

  const validationErrors = generateErrorSummary(deal.eligibility.validationErrors, eligibilityErrorHref);

  return res.render('eligibility/eligibility-criteria.njk',
    {
      _id: deal._id, // eslint-disable-line no-underscore-dangle
      countries: formatCountriesForGDSComponent(
        countries,
        deal.eligibility.agentAddressCountry,
        !deal.eligibility.agentAddressCountry,
      ),
      eligibility: deal.eligibility,
      validationErrors,
      bankSupplyContractName: deal.details.bankSupplyContractName,
      user: req.session.user,
    });
});

router.post('/contract/:_id/eligibility/criteria', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { body } = req;

  await getApiData(
    api.updateEligibilityCriteria(_id, body, userToken),
    res,
  );

  return res.redirect(`/contract/${_id}/eligibility/supporting-documentation`);
});

router.post('/contract/:_id/eligibility/criteria/save-go-back', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { deal } = req.apiData;

  const { body } = req;

  if (!submittedEligibilityMatchesOriginalData(req.body, deal.eligibility)) {
    await getApiData(
      api.updateEligibilityCriteria(_id, body, userToken),
      res,
    );
  }

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/eligibility/supporting-documentation', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;

  const { user } = req.session;
  if (!userCanAccessEligibility(user)) {
    return res.redirect('/');
  }

  const { eligibility, dealFiles = {} } = deal;

  const validationErrors = generateErrorSummary(dealFiles.validationErrors, eligibilityErrorHref);

  return res.render('eligibility/eligibility-supporting-documentation.njk',
    {
      _id: deal._id, // eslint-disable-line no-underscore-dangle
      dealFiles,
      eligibility,
      validationErrors,
      bankSupplyContractName: deal.details.bankSupplyContractName,
      user: req.session.user,
    });
});

router.post('/contract/:_id/eligibility/supporting-documentation', upload.any(), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { body, files } = req;

  const updatedDeal = await getApiData(
    api.updateEligibilityDocumentation(_id, body, files, userToken),
    res,
  );

  const { eligibility, dealFiles = {} } = updatedDeal;

  const validationErrors = generateErrorSummary(dealFiles.validationErrors, eligibilityErrorHref);

  if (validationErrors.count === 0) {
    return res.redirect(`/contract/${_id}/eligibility/preview`);
  }

  return res.render('eligibility/eligibility-supporting-documentation.njk', {
    _id,
    eligibility,
    dealFiles,
    validationErrors,
    bankSupplyContractName: updatedDeal.details.bankSupplyContractName,
  });
});

router.post('/contract/:_id/eligibility/supporting-documentation/save-go-back', provide([DEAL]), upload.any(), async (req, res) => {
  const { deal } = req.apiData;
  const { _id, userToken } = requestParams(req);
  const { body, files } = req;

  if (!submittedDocumentationMatchesOriginalData(req.body, req.files, deal.dealFiles)) {
    const updatedDeal = await getApiData(
      api.updateEligibilityDocumentation(_id, body, files, userToken),
      res,
    );

    const { eligibility, dealFiles } = updatedDeal;

    if (dealFiles && dealFiles.validationErrors && dealFiles.validationErrors.uploadErrorCount) {
      const validationErrors = generateErrorSummary(dealFiles.validationErrors, eligibilityErrorHref);

      return res.render('eligibility/eligibility-supporting-documentation.njk', {
        _id,
        eligibility,
        dealFiles,
        validationErrors,
        bankSupplyContractName: deal.details.bankSupplyContractName,
      });
    }
  }

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/eligibility-documentation/:fieldname/:filename', async (req, res) => {
  const {
    _id, userToken,
  } = requestParams(req);
  const { fieldname, filename } = req.params;

  const fileData = await getApiData(
    api.downloadFile(_id, fieldname, filename, userToken),
    res,
  );


  res.set('Content-disposition', `attachment; filename=${filename}`);
  res.set('Content-Type', fileData.headers['content-type']);

  const readStream = new stream.PassThrough();
  fileData.pipe(readStream).pipe(res);
});


router.get('/contract/:_id/eligibility/preview', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;

  const { user } = req.session;
  if (!userCanAccessEligibility(user)) {
    return res.redirect('/');
  }

  return res.render('eligibility/eligibility-preview.njk', {
    deal,
    user: req.session.user,
  });
});

export default router;