import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import InitiativeOverview from '../initiativeOverview';
import * as merchantService from '../../../services/merchantService';
import * as errorUtils from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import * as helperFunctions from '../../../helpers';
import { MerchantDetailDTO } from '../../../api/generated/merchants/MerchantDetailDTO';
import { MerchantStatisticsDTO } from '../../../api/generated/merchants/MerchantStatisticsDTO';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...Component.defaultProps, t: (key: string) => key };
    return Component;
  },
}));

jest.mock('../../../services/merchantService');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'initiative-123' }),
}));

jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher');
const mockedUseErrorDispatcher = errorUtils.default as jest.Mock;

const mockHistory = createMemoryHistory();

const renderComponent = () => {
  mockHistory.push('/overview/initiative-123');
  return render(
    <Router history={mockHistory}>
      <InitiativeOverview />
    </Router>
  );
};

const mockMerchantDetail: MerchantDetailDTO = {
  iban: 'IT60X0542811101000000123456',
  ibanHolder: 'Mario Rossi',
  activationDate: new Date('2023-01-15T10:00:00Z'),
};

const mockMerchantStatistics: MerchantStatisticsDTO = {
  amountCents: 50000,
  refundedCents: 15000,
  accruedCents: 0,
};

describe('InitiativeOverview', () => {
  const addErrorMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseErrorDispatcher.mockReturnValue(addErrorMock);
    jest.spyOn(helperFunctions, 'formatDate');
    jest.spyOn(helperFunctions, 'formatIban');
    jest.spyOn(helperFunctions, 'formattedCurrency');
    jest.spyOn(merchantService, 'getMerchantDetail').mockResolvedValue(mockMerchantDetail);
    jest
      .spyOn(merchantService, 'getMerchantInitiativeStatistics')
      .mockResolvedValue(mockMerchantStatistics);
  });

  it('should render the main titles and cards', async () => {
    renderComponent();

    expect(screen.getByText('pages.initiativeOverview.title')).toBeInTheDocument();
    expect(screen.getByText('pages.initiativeOverview.subtitle')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('pages.initiativeOverview.information')).toBeInTheDocument();
      expect(screen.getByText('pages.initiativeOverview.stores')).toBeInTheDocument();
    });
  });

  it('should handle API error for getMerchantDetail', async () => {
    const error = new Error('API Error Detail');
    jest.spyOn(merchantService, 'getMerchantDetail').mockRejectedValue(error);

    renderComponent();

    await waitFor(() => {
      expect(addErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'GET_MERCHANT_DETAIL',
          error,
        })
      );
    });
  });

  // it('should handle API error for getMerchantInitiativeStatistics', async () => {
  //   const error = new Error('API Error Stats');
  //   jest.spyOn(merchantService, 'getMerchantInitiativeStatistics').mockRejectedValue(error);

  //   renderComponent();

  //   await waitFor(() => {
  //     expect(addErrorMock).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         id: 'GET_MERCHANT_STATISTICS',
  //         error,
  //       })
  //     );
  //   });

  //   await waitFor(() => {
  //     expect(helperFunctions.formattedCurrency).toHaveBeenCalledWith(
  //       undefined,
  //       expect.any(String),
  //       true
  //     );
  //   });
  // });
});
