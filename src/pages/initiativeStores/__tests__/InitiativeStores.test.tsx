import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { getMerchantPointOfSales } from '../../../services/merchantService';
import { parseJwt } from '../../../utils/jwt-utils';
import InitiativeStores from '../InitiativeStores';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useHistory: jest.fn(),
  useLocation: jest.fn(),
}));
jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher');
jest.mock('../../../services/merchantService', () => ({
  getMerchantPointOfSales: jest.fn(),
}));
jest.mock('../../../utils/jwt-utils');
jest.mock('@pagopa/selfcare-common-frontend/utils/storage');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  withTranslation: () => (Component: React.ComponentType<any>) => (props: any) =>
    <Component {...props} />,
}));

jest.mock('../../../components/dataTable/DataTable', () => ({ handleRowAction, rows }: any) => (
  <div data-testid="data-table-mock">
    {rows.map((r: any) => (
      <div key={r.id} onClick={() => handleRowAction(r)} data-testid={`row-${r.id}`}>
        {r.franchiseName}
      </div>
    ))}
  </div>
));
jest.mock('../../initiativeDiscounts/FiltersForm', () => ({ onFiltersApplied, children }: any) => (
  <div>
    {children}
    <button onClick={() => onFiltersApplied({})}>Apply Filters</button>
  </div>
));

const mockedUseParams = useParams as jest.Mock;
const mockedUseHistory = useHistory as jest.Mock;
const mockedUseLocation = useLocation as jest.Mock;
const mockedUseErrorDispatcher = useErrorDispatcher as jest.Mock;
const mockedGetMerchantPointOfSales = getMerchantPointOfSales as jest.Mock;
const mockedParseJwt = parseJwt as jest.Mock;
const mockedStorageTokenOps = storageTokenOps as jest.Mocked<typeof storageTokenOps>;

const mockStores = [
  { id: '1', franchiseName: 'Store A', type: 'PHYSICAL', city: 'Rome' },
  { id: '2', franchiseName: 'Store B', type: 'ONLINE', city: 'Milan' },
];

describe('InitiativeStores', () => {
  const mockHistoryPush = jest.fn();
  const mockAddError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ id: 'initiative-1' });
    mockedUseHistory.mockReturnValue({ push: mockHistoryPush });
    mockedUseLocation.mockReturnValue({ state: {} });
    mockedUseErrorDispatcher.mockReturnValue(mockAddError);
    mockedParseJwt.mockReturnValue({ merchant_id: 'merchant-1' });
    mockedStorageTokenOps.read.mockReturnValue('fake-token');
  });

  test('should show loading state and then display stores', async () => {
    mockedGetMerchantPointOfSales.mockResolvedValue({ content: mockStores, ...{} });
    render(<InitiativeStores />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(mockedGetMerchantPointOfSales).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('data-table-mock')).toBeInTheDocument();
    expect(screen.getByText('Store A')).toBeInTheDocument();
  });

  test('should show empty state if no stores are found', async () => {
    mockedGetMerchantPointOfSales.mockResolvedValue({ content: [], ...{} });
    render(<InitiativeStores />);

    expect(await screen.findByText('pages.initiativeStores.noStores')).toBeInTheDocument();
    expect(screen.queryByTestId('data-table-mock')).not.toBeInTheDocument();
  });

  test('should call API with filters when filters are applied', async () => {
    mockedGetMerchantPointOfSales.mockResolvedValue({ content: mockStores, ...{} });
    render(<InitiativeStores />);
    await waitFor(() => expect(mockedGetMerchantPointOfSales).toHaveBeenCalledTimes(1));

    const cityInput = screen.getByLabelText('pages.initiativeStores.city');
    await userEvent.type(cityInput, 'Test City');

    const applyButton = screen.getByRole('button', { name: /Apply Filters/i });
    await userEvent.click(applyButton);

    await waitFor(() => {
      expect(mockedGetMerchantPointOfSales).toHaveBeenCalledTimes(2);
    });
  });

  test('should navigate to add store page when button is clicked', async () => {
    mockedGetMerchantPointOfSales.mockResolvedValue({ content: mockStores, ...{} });
    render(<InitiativeStores />);

    const addButton = await screen.findByRole('button', {
      name: 'pages.initiativeStores.addStoreList',
    });
    await userEvent.click(addButton);

    expect(mockHistoryPush).toHaveBeenCalledWith(
      '/portale-esercenti/initiative-1/punti-vendita/censisci/'
    );
  });

  test('should navigate to store detail page when a row is clicked', async () => {
    mockedGetMerchantPointOfSales.mockResolvedValue({ content: mockStores, ...{} });
    render(<InitiativeStores />);

    const row = await screen.findByTestId('row-1');
    await userEvent.click(row);

    expect(mockHistoryPush).toHaveBeenCalledWith(
      '/portale-esercenti/initiative-1/punti-vendita/1/'
    );
  });

  test('should display success alert if navigated with correct state', async () => {
    jest.useFakeTimers();
    mockedUseLocation.mockReturnValue({ state: { showSuccessAlert: true } });
    mockedGetMerchantPointOfSales.mockResolvedValue({ content: [], ...{} });
    render(<InitiativeStores />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText('pages.initiativeStores.pointOfSalesUploadSuccess')
    ).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    jest.useRealTimers();
  });
});
