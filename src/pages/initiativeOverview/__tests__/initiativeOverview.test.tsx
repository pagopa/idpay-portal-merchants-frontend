import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../../../redux/store';
import InitiativeOverview from '../initiativeOverview';
import * as merchantService from '../../../services/merchantService';
import * as helperFunctions from '../../../helpers';
import type {
  MerchantDetailDTO,
  MerchantStatisticsDTO,
} from '../../../api/generated/merchants/data-contracts';

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
  useParams: () => ({ initiative_id: 'initiative-123' }),
}));

const mockHistory = createMemoryHistory();

const renderComponent = () => {
  mockHistory.push('/overview/initiative-123');
  return render(
    <Provider store={store}>
      <Router history={mockHistory}>
        <InitiativeOverview />
      </Router>
    </Provider>
  );
};

const mockMerchantDetail: MerchantDetailDTO = {
  iban: 'IT60X0542811101000000123456',
  ibanHolder: 'Mario Rossi',
  activationDate: '2023-01-15T10:00:00Z',
};

const mockMerchantStatistics: MerchantStatisticsDTO = {
  amountCents: 50000,
  refundedCents: 15000,
  accruedCents: 0,
};

describe('InitiativeOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(helperFunctions, 'formatDate');
    jest.spyOn(helperFunctions, 'formatIban');
    jest.spyOn(helperFunctions, 'formattedCurrency');
    jest.spyOn(merchantService, 'getMerchantDetail').mockResolvedValue(mockMerchantDetail);
    jest
      .spyOn(merchantService, 'getMerchantInitiativeStatistics')
      .mockResolvedValue(mockMerchantStatistics);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
