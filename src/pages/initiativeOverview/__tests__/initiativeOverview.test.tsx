import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { createMemoryHistory, History } from 'history';
import { MemoryRouter, Route } from 'react-router-dom';
import InitiativeOverview from '../initiativeOverview';
import {
  getMerchantDetail,
  getMerchantInitiativeStatistics,
} from '../../../services/merchantService';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { MISSING_DATA_PLACEHOLDER, MISSING_EURO_PLACEHOLDER } from '../../../utils/constants';
import ROUTES from '../../../routes';

jest.mock('../../../services/merchantService', () => ({
  getMerchantDetail: jest.fn(),
  getMerchantInitiativeStatistics: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher');
jest.mock('react-i18next', () => ({
  // La parte che avevi già
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  withTranslation: () => (Component: React.ComponentType<any>) => (props: any) =>
    <Component {...props} />,
}));

const mockedGetMerchantDetail = getMerchantDetail as jest.Mock;
const mockedGetMerchantInitiativeStatistics = getMerchantInitiativeStatistics as jest.Mock;
const mockedUseErrorDispatcher = useErrorDispatcher as jest.Mock;

const renderComponent = (initiativeId: string, history?: any) => {
  const path = ROUTES.OVERVIEW.replace(':id', initiativeId);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Route path={ROUTES.OVERVIEW}>
        <InitiativeOverview />
      </Route>
    </MemoryRouter>
  );
};

describe('InitiativeOverview', () => {
  const mockAddError = jest.fn();
  const initiativeId = 'test-initiative-id';

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseErrorDispatcher.mockReturnValue(mockAddError);
  });

  test('should render component with fetched data on success', async () => {
    const detailData = {
      iban: 'IT60X0542811101000000123456',
      ibanHolder: 'Test Holder',
      activationDate: new Date('2023-01-01'),
    };
    const statsData = { amountCents: 10000, refundedCents: 2500 };
    mockedGetMerchantDetail.mockResolvedValue(detailData);
    mockedGetMerchantInitiativeStatistics.mockResolvedValue(statsData);

    const history = createMemoryHistory();
    renderComponent(initiativeId, history);

    await waitFor(() => {
      expect(screen.getByText('01/01/2023')).toBeInTheDocument();
      expect(screen.getByText('Test Holder')).toBeInTheDocument();
      expect(screen.getByText('IT 60 X 05428 11101 000000123456')).toBeInTheDocument();
      expect(screen.getByText('100,00 €')).toBeInTheDocument();
      expect(screen.getByText('25,00 €')).toBeInTheDocument();
    });
  });

  test('should render placeholders for missing data', async () => {
    const detailData = {
      iban: null,
      ibanHolder: undefined,
      activationDate: null,
    };
    const statsData = {
      amountCents: undefined,
      refundedCents: null,
    };
    mockedGetMerchantDetail.mockResolvedValue(detailData);
    mockedGetMerchantInitiativeStatistics.mockResolvedValue(statsData);

    renderComponent(initiativeId);

    await waitFor(() => {
      const placeholders = screen.getAllByText(MISSING_DATA_PLACEHOLDER);
      expect(placeholders).toHaveLength(3);
      expect(screen.getAllByText(MISSING_EURO_PLACEHOLDER)).toHaveLength(2);
    });
  });

  test('should call addError if getMerchantDetail fails', async () => {
    const error = new Error('Failed to fetch detail');
    mockedGetMerchantDetail.mockRejectedValue(error);
    mockedGetMerchantInitiativeStatistics.mockResolvedValue({});

    renderComponent(initiativeId);

    await waitFor(() => {
      expect(mockAddError).toHaveBeenCalledTimes(1);
      expect(mockAddError).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'GET_MERCHANT_DETAIL',
          error,
        })
      );
    });
  });

  test('should call addError and show placeholders if getMerchantInitiativeStatistics fails', async () => {
    const error = new Error('Failed to fetch stats');
    mockedGetMerchantDetail.mockResolvedValue({ ibanHolder: 'Test Holder' });
    mockedGetMerchantInitiativeStatistics.mockRejectedValue(error);

    renderComponent(initiativeId);

    await waitFor(() => {
      expect(mockAddError).toHaveBeenCalledTimes(1);
      expect(mockAddError).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'GET_MERCHANT_STATISTICS',
          error,
        })
      );
      expect(screen.getByText('Test Holder')).toBeInTheDocument();
      expect(screen.getAllByText(MISSING_EURO_PLACEHOLDER)).toHaveLength(2);
    });
  });
});
