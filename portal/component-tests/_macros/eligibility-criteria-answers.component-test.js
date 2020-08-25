const componentRenderer = require('../componentRenderer');
const deal = require('../fixtures/deal-fully-completed');

const component = '_macros/eligibility-criteria-answers.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(deal.eligibility);
  });

  it('should render a heading, answer and description for each criterion', () => {
    for (const criterion of deal.eligibility.criteria) { // eslint-disable-line no-restricted-syntax
      const criterionIdSelector = `criterion-${criterion.id}`;
      wrapper.expectText(`[data-cy="${criterionIdSelector}-heading"]`).toRead(`Eligibility criterion ${criterion.id}`);

      const expectedAnwser = criterion.answer.toString().charAt(0).toUpperCase() + criterion.answer.toString().slice(1);
      wrapper.expectText(`[data-cy="${criterionIdSelector}-answer"]`).toRead(expectedAnwser);

      wrapper.expectText(`[data-cy="${criterionIdSelector}-description"]`).toRead(criterion.description);
    }
  });

  // TODO
  // describe('criterion 11', () => {
  //   it('should render agent name and address')
  // });
});