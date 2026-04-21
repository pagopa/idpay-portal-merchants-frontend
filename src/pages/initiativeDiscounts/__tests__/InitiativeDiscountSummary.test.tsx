import React from 'react';
import { waitFor } from '@testing-library/react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import InitiativeDiscountSummary from '../InitiativeDiscountsSummary';

const mockGetMerchantDetail = jest.fn();
const mockGetMerchantInitiativeStatistics = jest.fn();

jest.mock('../../../services/merchantService', () => ({
  __esModule: true,
  getMerchantDetail: (id: string) => mockGetMerchantDetail(id),
  getMerchantInitiativeStatistics: (id: string) => mockGetMerchantInitiativeStatistics(id),
}));

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for InitiativeDiscountSummary component', () => {
  window.scrollTo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMerchantDetail.mockResolvedValue({ iban: 'IT60X0542811101000000123456' });
    mockGetMerchantInitiativeStatistics.mockResolvedValue({
      amountCents: 1000,
      refundedCents: 200,
    });
  });

  test('Render component', async () => {
    renderWithContext(<InitiativeDiscountSummary id={'initativeTestId321'} />);

    await waitFor(() => {
      expect(mockGetMerchantDetail).toHaveBeenCalledWith('initativeTestId321');
      expect(mockGetMerchantInitiativeStatistics).toHaveBeenCalledWith('initativeTestId321');
    });
  });

  test('render component with undefined id as prop ', async () => {
    renderWithContext(
      // @ts-expect-error need to pass undefined to cover  condition if id is not a string
      <InitiativeDiscountSummary id={undefined} />
    );

    await waitFor(() => {
      expect(mockGetMerchantDetail).not.toHaveBeenCalled();
      expect(mockGetMerchantInitiativeStatistics).not.toHaveBeenCalled();
    });
  });

  test('catch in case of error from getMerchantDetail (covers setIban(undefined) + catch alert branch)', async () => {
    mockGetMerchantDetail.mockRejectedValueOnce('mocked error response for tests');

    renderWithContext(<InitiativeDiscountSummary id={'initativeTestId321'} />);

    await waitFor(() => {
      expect(mockGetMerchantDetail).toHaveBeenCalledWith('initativeTestId321');
    });
  });

  test('catch in case of error from getMerchantInitiativeStatistics (covers catch setAmount/setRefunded to undefined)', async () => {
    mockGetMerchantInitiativeStatistics.mockRejectedValueOnce('mocked error response for tests');

    renderWithContext(<InitiativeDiscountSummary id={'initativeTestId321'} />);

    await waitFor(() => {
      expect(mockGetMerchantInitiativeStatistics).toHaveBeenCalledWith('initativeTestId321');
    });
  });
});
