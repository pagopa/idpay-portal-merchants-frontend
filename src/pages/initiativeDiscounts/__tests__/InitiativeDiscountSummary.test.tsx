import React from 'react';
import { MerchantsApiMocked } from '../../../api/__mocks__/MerchantsApiClient';
import { MerchantDetailDTO } from '../../../api/generated/merchants/MerchantDetailDTO';
import { MerchantStatisticsDTO } from '../../../api/generated/merchants/MerchantStatisticsDTO';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import InitiativeDiscountSummary from '../InitiativeDiscountsSummary';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for InitiativeDiscountSummary component', () => {
  window.scrollTo = jest.fn();
  test('Render component', () => {
    renderWithContext(
      <InitiativeDiscountSummary id={'initativeTestId321'} setInitiativeName={jest.fn()} />
    );
  });

  test('render component with undefined id as prop ', () => {
    renderWithContext(
      // @ts-expect-error need to pass undefined to cover  condition if id is not a string
      <InitiativeDiscountSummary id={undefined} setInitiativeName={jest.fn()} />
    );
  });

  test('catch in case of error from api getMerchantDetail and getMerchantInitiativeStatistics', () => {
    MerchantsApiMocked.getMerchantDetail = async (): Promise<MerchantDetailDTO> =>
      Promise.reject('mocked error response for tests');

    MerchantsApiMocked.getMerchantInitiativeStatistics = async (
      _initiativeId: string
    ): Promise<MerchantStatisticsDTO> => Promise.reject('mocked error response for tests');

    renderWithContext(
      <InitiativeDiscountSummary id={'initativeTestId321'} setInitiativeName={jest.fn()} />
    );
  });
});
