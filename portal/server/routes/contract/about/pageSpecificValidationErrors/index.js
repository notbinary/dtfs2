import { pageSpecificValidationErrors } from '../../../../helpers';
import FIELDS from '../pageFields';

export const supplierValidationErrors = (validationErrors, submittedValues) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.SUPPLIER, submittedValues);

export const buyerValidationErrors = (validationErrors, submittedValues) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.BUYER, submittedValues);

export const financialPageValidationErrors = (validationErrors, submittedValues) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.FINANCIAL, submittedValues);

// TODO: make reusable
// preview pages display all required field validation errors.
// because each field/validation error originates from  a different page,
// for each validation error, we need to add a hrefRoot to the page in question.
export const aboutSupplyContractPreviewValidationErrors = (validationErrors, dealId) => {
  const mappedValidationErrors = validationErrors;

  if (mappedValidationErrors && mappedValidationErrors.errorList) {
    Object.keys(mappedValidationErrors.errorList).forEach((fieldName) => {
      if (FIELDS.SUPPLIER.REQUIRED_FIELDS.includes(fieldName)
        || FIELDS.SUPPLIER.CONDITIONALLY_REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/about/supplier`;
      }

      if (FIELDS.BUYER.REQUIRED_FIELDS.includes(fieldName)
        || FIELDS.BUYER.CONDITIONALLY_REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/about/buyer`;
      }

      if (FIELDS.FINANCIAL.REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/about/financial`;
      }
    });
  }

  return mappedValidationErrors;
};
