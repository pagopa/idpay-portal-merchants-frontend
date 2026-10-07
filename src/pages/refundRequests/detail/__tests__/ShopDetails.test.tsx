import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShopDetails from '../ShopDetails';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { useAppSelector } from '../../../../redux/hooks';

const mockHandleSubmit = jest.fn();
const mockResetForm = jest.fn();
const mockHandleChange = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();
let mockFormikOnSubmit: (() => void) | undefined;
let mockFormikValues = {
  status: '',
  pointOfSaleId: '',
  trxCode: '',
  page: 0,
};
let mockHistoryLocation: any = {
  key: 'history-key',
  state: { store: { id: 'batch-1' }, refundUploadSuccess: true },
};
let mockRouteParams = { initiative_id: 'initiative-123', batch_id: 'batch-1' };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    goBack: mockGoBack,
    replace: mockReplace,
    location: mockHistoryLocation,
  }),
  useLocation: () => ({
    state: mockHistoryLocation.state,
  }),
  useParams: () => mockRouteParams,
}));

jest.mock('../../../../utils/constants', () => {
  const actual = jest.requireActual('../../../../utils/constants');
  return {
    ...actual,
    MOCK_USER: true,
  };
});

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormik: (config: { onSubmit: () => void }) => {
    mockFormikOnSubmit = config.onSubmit;
    return {
      values: mockFormikValues,
      handleSubmit: mockHandleSubmit,
      resetForm: mockResetForm,
      handleChange: mockHandleChange,
      dirty: true,
    };
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  withTranslation: () => (Component: any) => Component,
}));

jest.mock('../../../../services/merchantService', () => ({
  getRewardBatchById: jest.fn(),
  getMerchantPointOfSalesWithTransactions: jest.fn(),
  getMerchantDetail: jest.fn(),
  getMerchantTransactionsProcessed: jest.fn(),
  downloadBatchCsv: jest.fn(),
}));

const mockSetAlert = jest.fn();
jest.mock('../../../../hooks/useAlert', () => ({
  useAlert: () => ({
    setAlert: mockSetAlert,
  }),
}));

jest.mock('../../../../services/analyticsService', () => ({
  trackAnalyticsInputChange: jest.fn(),
}));

jest.mock('../../../initiativeDiscounts/FiltersForm', () => (props: any) => (
  <div>
    {props.children}
    <button onClick={props.onFiltersApplied}>actions.filterBtn</button>
    <button onClick={props.onFiltersReset}>actions.removeFiltersBtn</button>
  </div>
));

jest.mock('../../invoiceDataTable', () => (props: any) => (
  <div>
    <button data-testid="drawer-close-button" onClick={props.onDrawerClosed}>
      Close drawer
    </button>
    <span data-testid="invoice-filters">
      {`${props.rewardBatchTrxStatus}|${props.pointOfSaleId}|${props.trxCode}`}
    </span>
  </div>
));

jest.mock('../ShopCard', () => ({
  ShopCard: ({ store }: any) => <div data-testid="shop-card">{store.dateRange}</div>,
}));

let mockJWT: string | undefined = 'merchant-1';
jest.mock('../../../../utils/jwt-utils', () => ({
  parseJwt: () => ({ merchant_id: mockJWT }),
}));

const {
  getRewardBatchById,
  getMerchantPointOfSalesWithTransactions,
  getMerchantDetail,
  getMerchantTransactionsProcessed,
  downloadBatchCsv,
} = jest.requireMock('../../../../services/merchantService');

const { trackAnalyticsInputChange: mockTrackAnalyticsInputChange } = jest.requireMock(
  '../../../../services/analyticsService'
);

jest.mock('../../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: () => ({}),
}));

jest.mock('../../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

const createMockStore = (initialState?: any) => {
  return configureStore({
    reducer: () => initialState,
  });
};

const store = createMockStore();

const renderComponent = () =>
  render(
    <Provider store={store}>
      <BrowserRouter>
        <ShopDetails />
      </BrowserRouter>
    </Provider>
  );

const setupSuccessfulBaseMocks = () => {
  getMerchantDetail.mockResolvedValue({
    iban: 'IT60X0542811101000000123456',
    ibanHolder: 'Mario Rossi',
  });
  getRewardBatchById.mockResolvedValue({
    id: 'batch-1',
    name: 'Batch 1',
    status: 'APPROVED',
  });
  getMerchantPointOfSalesWithTransactions.mockResolvedValue([
    { franchiseName: 'Shop 1', pointOfSaleId: 'shop-1' },
  ]);
};

describe('ShopDetails', () => {
  (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }]);
  beforeEach(() => {
    jest.clearAllMocks();
    mockJWT = 'merchant-1';
    mockFormikValues = {
      status: '',
      pointOfSaleId: '',
      trxCode: '',
      page: 0,
    };
    mockHistoryLocation = {
      key: 'history-key',
      state: { store: { id: 'batch-1' }, refundUploadSuccess: true },
    };
    mockRouteParams = { initiative_id: 'initiative-123', batch_id: 'batch-1' };
    setupSuccessfulBaseMocks();
  });

  act(() => {
    getMerchantTransactionsProcessed.mockResolvedValue({
      content: [],
      totalPages: 0,
    });
  });
  it('should render component', async () => {
    act(() => {
      getMerchantDetail.mockResolvedValue({
        iban: 'IT60X0542811101000000123456',
        ibanHolder: 'Mario Rossi',
      });
      getRewardBatchById.mockResolvedValue({ id: 'batch-1', name: 'Batch 1', status: 'APPROVED' });
      getMerchantPointOfSalesWithTransactions.mockResolvedValue([
        { franchiseName: 'Shop 1', pointOfSaleId: 'shop-1' },
      ]);
    });

    renderComponent();

    await waitFor(() => expect(getRewardBatchById).toHaveBeenCalled());

    expect(mockReplace).toHaveBeenCalled();

    expect(screen.getByText('actions.back')).toBeInTheDocument();
    expect(screen.getByText('actions.back')).toBeInTheDocument();
    expect(screen.getByText('Bonus Elettrodomestici')).toBeInTheDocument();
    expect(screen.getByText('pages.refundRequests.storeDetails.exportCSV')).toBeInTheDocument();
    expect(screen.getByTestId('download-csv-button-test')).toHaveProperty('disabled', false);
    fireEvent.click(screen.getByText('actions.back'));
    fireEvent.click(screen.getByText('actions.back'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should handle getMerchantPointOfSalesWithTransactions error', async () => {
    const mockError = new Error('fail');
    act(() => {
      getMerchantDetail.mockResolvedValue({
        iban: 'IT60X0542811101000000123456',
        ibanHolder: 'Mario Rossi',
      });
      getRewardBatchById.mockResolvedValue({ id: 'batch-1', name: 'Batch 1', status: 'APPROVED' });
      getMerchantPointOfSalesWithTransactions.mockRejectedValue(mockError);
    });

    renderComponent();

    await waitFor(() => expect(getRewardBatchById).toHaveBeenCalled());

    expect(mockSetAlert).toHaveBeenCalledWith({
      title: 'errors.genericTitle',
      text: 'errors.genericDescription',
      isOpen: true,
      severity: 'error',
    });
  });

  it('should not call getMerchantPointOfSalesWithTransactions if merchantId does not exist', async () => {
    mockJWT = undefined;
    act(() => {
      getMerchantDetail.mockResolvedValue({
        iban: 'IT60X0542811101000000123456',
        ibanHolder: 'Mario Rossi',
      });
      getRewardBatchById.mockResolvedValue({ id: 'batch-1', name: 'Batch 1', status: 'APPROVED' });
      getMerchantPointOfSalesWithTransactions.mockResolvedValue([
        { franchiseName: 'Shop 1', pointOfSaleId: 'shop-1' },
      ]);
    });

    renderComponent();

    await waitFor(() => expect(getMerchantPointOfSalesWithTransactions).not.toHaveBeenCalled());
  });

  it('should handle getAllRewardBatches error', async () => {
    const mockError = new Error('fail');
    act(() => {
      getMerchantDetail.mockResolvedValue({
        iban: 'IT60X0542811101000000123456',
        ibanHolder: 'Mario Rossi',
      });
      getRewardBatchById.mockRejectedValue(mockError);
    });

    renderComponent();

    await waitFor(() => expect(getRewardBatchById).toHaveBeenCalled());

    expect(mockSetAlert).toHaveBeenCalledWith({
      title: 'errors.genericTitle',
      text: 'errors.genericDescription',
      isOpen: true,
      severity: 'error',
    });
  });

  it('should handle getMerchantDetail error', async () => {
    const mockError = new Error('fail');
    act(() => {
      getMerchantDetail.mockRejectedValue(mockError);
      getRewardBatchById.mockResolvedValue({ id: 'batch-1', name: 'Batch 1', status: 'APPROVED' });
    });

    renderComponent();

    await waitFor(() => expect(getMerchantDetail).toHaveBeenCalled());

    expect(mockSetAlert).toHaveBeenCalledWith({
      title: 'errors.genericTitle',
      text: 'errors.genericDescription',
      isOpen: true,
      severity: 'error',
    });
  });

  it('should show approving alert', async () => {
    getRewardBatchById.mockResolvedValue({ id: 'batch-1', name: 'Batch 1', status: 'APPROVING' });

    renderComponent();

    expect(
      await screen.findByText('pages.refundRequests.storeDetails.csv.alert')
    ).toBeInTheDocument();
    expect(screen.getByTestId('download-csv-button-test')).toHaveProperty('disabled', true);
  });

  it('should disable download button when status is not in ENABLED_DOWNLOAD_STATUSES', async () => {
    getRewardBatchById.mockResolvedValue({
      id: 'batch-1',
      name: 'Batch 1',
      status: 'TO_EVALUATE',
    });

    renderComponent();

    const btn = await screen.findByTestId('download-csv-button-test');
    expect(btn).toHaveProperty('disabled', true);
  });

  it.each(['PENDING_REFUND', 'REFUNDED', 'NOT_REFUNDED'])(
    'should enable download button when status is %s',
    async (status: string) => {
      getRewardBatchById.mockResolvedValue({ id: 'batch-1', name: 'Batch 1', status });

      renderComponent();

      const btn = await screen.findByTestId('download-csv-button-test');
      expect(btn).toHaveProperty('disabled', false);
    }
  );

  it('should call handleDownloadCsv', async () => {
    getRewardBatchById.mockResolvedValue({ id: 'batch-1', name: 'Batch 1', status: 'APPROVED' });

    downloadBatchCsv.mockResolvedValue({
      approvedBatchUrl: 'http://csv',
    });

    renderComponent();

    const btn = await screen.findByTestId('download-csv-button-test');
    fireEvent.click(btn);

    await waitFor(() => expect(downloadBatchCsv).toHaveBeenCalled());
  });

  it('should handle handleDownloadCsv error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('fail');
    getRewardBatchById.mockResolvedValue({ id: 'batch-1', name: 'Batch 1', status: 'APPROVED' });

    downloadBatchCsv.mockRejectedValue(mockError);

    renderComponent();

    const btn = await screen.findByTestId('download-csv-button-test');
    fireEvent.click(btn);

    await waitFor(() => expect(downloadBatchCsv).toHaveBeenCalled());
    await waitFor(() => expect(mockSetAlert).toHaveBeenCalled());

    expect(consoleSpy).toHaveBeenCalled();
    expect(mockSetAlert).toHaveBeenCalledWith({
      title: 'errors.genericTitle',
      text: 'errors.genericDescription',
      isOpen: true,
      severity: 'error',
    });
    consoleSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should handle trxCode input change', async () => {
    act(() => {
      getMerchantDetail.mockResolvedValue({
        iban: 'IT60X0542811101000000123456',
        ibanHolder: 'Mario Rossi',
      });
      getRewardBatchById.mockResolvedValue({ id: 'batch-1', name: 'Batch 1', status: 'APPROVED' });
      getMerchantPointOfSalesWithTransactions.mockResolvedValue([
        { franchiseName: 'Shop 1', pointOfSaleId: 'shop-1' },
      ]);
    });
    renderComponent();
    const wrapper = screen.getByTestId('trxCodeFilter');
    const input = wrapper.querySelector('input');
    const posSelect = screen.getByTestId('point-of-sale-test');
    const statusSelect = screen.getByTestId('status-test');
    const filtersBtn = screen.getByText('actions.filterBtn');
    const removeFiltersBtn = screen.getByText('actions.removeFiltersBtn');

    await act(() => userEvent.type(input!, ' '));
    await waitFor(() => expect(mockHandleChange).not.toHaveBeenCalled());

    await act(() => userEvent.type(input!, 'test#'));
    expect(
      screen.getByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')
    ).toBeInTheDocument();
    fireEvent.blur(input!);
    expect(
      screen.queryByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')
    ).not.toBeInTheDocument();

    await act(() => userEvent.type(input!, 'test'));
    act(() => {
      fireEvent.select(posSelect, { franchiseName: 'Shop 1', pointOfSaleId: 'shop-1' });
      fireEvent.select(statusSelect, 'CONSULTABLE');
    });

    await waitFor(() => expect(mockHandleChange).toHaveBeenCalled());
    fireEvent.click(filtersBtn);
    await waitFor(() => expect(mockHandleSubmit).toHaveBeenCalled());
    fireEvent.click(removeFiltersBtn);
    await waitFor(() => expect(mockResetForm).toHaveBeenCalled());
  });

  it('should clear refundUploadSuccess from history state', async () => {
    renderComponent();

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({
        ...mockHistoryLocation,
        state: {
          ...mockHistoryLocation.state,
          refundUploadSuccess: undefined,
        },
      })
    );
  });

  it('should not clear refundUploadSuccess when state flag is absent', async () => {
    mockHistoryLocation = {
      key: 'history-key',
      state: { store: { id: 'batch-1' } },
    };

    renderComponent();

    await waitFor(() => expect(getRewardBatchById).toHaveBeenCalled());
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith({
      ...mockHistoryLocation,
      state: {
        store: expect.objectContaining({ id: 'batch-1', name: 'Batch 1', status: 'APPROVED' }),
      },
    });
  });

  it('should map store dates and render fallback tooltip label', async () => {
    getRewardBatchById.mockResolvedValue({
      id: 'batch-1',
      name: 'Batch 1',
      status: 'APPROVED',
      startDate: '2024-01-10T00:00:00.000Z',
      endDate: '2024-01-20T00:00:00.000Z',
    });
    getMerchantPointOfSalesWithTransactions.mockResolvedValue([{ pointOfSaleId: 'shop-1' }]);

    renderComponent();

    expect(await screen.findByTestId('shop-card')).toHaveTextContent('10/01/2024 - 20/01/2024');
    expect(screen.getByText('pages.initiativeStores.pointOfSale')).toBeInTheDocument();
  });

  it('should keep empty date range when store dates are missing', async () => {
    renderComponent();

    expect(await screen.findByTestId('shop-card')).toHaveTextContent('-');
  });

  it('should apply submitted filters to invoice table props', async () => {
    mockFormikValues = {
      status: 'AUTHORIZED',
      pointOfSaleId: 'shop-1',
      trxCode: 'ABC123',
      page: 0,
    };

    renderComponent();

    await waitFor(() => expect(mockFormikOnSubmit).toBeDefined());

    act(() => {
      mockFormikOnSubmit?.();
    });

    await waitFor(() =>
      expect(screen.getByTestId('invoice-filters')).toHaveTextContent('AUTHORIZED|shop-1|ABC123')
    );
  });

  it('should reset filters passed to invoice table', async () => {
    mockFormikValues = {
      status: 'AUTHORIZED',
      pointOfSaleId: 'shop-1',
      trxCode: 'ABC123',
      page: 0,
    };

    renderComponent();

    await waitFor(() => expect(mockFormikOnSubmit).toBeDefined());

    act(() => {
      mockFormikOnSubmit?.();
    });

    await waitFor(() =>
      expect(screen.getByTestId('invoice-filters')).toHaveTextContent('AUTHORIZED|shop-1|ABC123')
    );

    fireEvent.click(screen.getByText('actions.removeFiltersBtn'));

    await waitFor(() => expect(screen.getByTestId('invoice-filters')).toHaveTextContent('||'));
  });

  it('should set stores to an empty array when merchant POS response is undefined', async () => {
    getMerchantPointOfSalesWithTransactions.mockResolvedValue(undefined);

    renderComponent();

    await waitFor(() => expect(getMerchantPointOfSalesWithTransactions).toHaveBeenCalled());
    expect(screen.getByRole('combobox', { name: /Punto vendita/i })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes[1]).toHaveAttribute('aria-disabled', 'true');
  });

  it('should track analytics when point of sale filter changes', async () => {
    renderComponent();

    await waitFor(() =>
      expect(getMerchantPointOfSalesWithTransactions).toHaveBeenCalled()
    );

    const pointOfSaleSelect = screen.getByRole('combobox', {
      name: /Punto vendita/i,
    });

    fireEvent.mouseDown(pointOfSaleSelect);

    const option = await screen.findByRole('option', {
      name: 'Shop 1',
    });

    fireEvent.click(option);

    expect(mockHandleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: 'shop-1',
        }),
      })
    );

    expect(mockTrackAnalyticsInputChange).toHaveBeenCalledWith(
      'pointOfSaleId',
      'shop-1'
    );
  });

  it('should track analytics when status filter changes', async () => {
    renderComponent();

    await waitFor(() =>
      expect(getMerchantPointOfSalesWithTransactions).toHaveBeenCalled()
    );

    const statusSelect = screen.getByTestId('status-test');
    const combobox = statusSelect.querySelector('[role="combobox"]');

    expect(combobox).toBeInTheDocument();

    fireEvent.mouseDown(combobox!);

    const options = await screen.findAllByRole('option');
    const option = options.find((item) => item.getAttribute('data-value') === 'CONSULTABLE');

    expect(option).toBeDefined();
    fireEvent.click(option!);

    expect(mockHandleChange).toHaveBeenCalled();
    expect(mockTrackAnalyticsInputChange).toHaveBeenCalledWith(
      'status',
      'CONSULTABLE'
    );
  });

  it('should render empty status value when no status is selected', async () => {
    mockFormikValues = {
      status: '',
      pointOfSaleId: '',
      trxCode: '',
      page: 0,
    };

    renderComponent();

    const statusSelect = await screen.findByTestId('status-test');
    const combobox = statusSelect.querySelector('[role="combobox"]');

    expect(combobox).toBeInTheDocument();
    expect(statusSelect).not.toHaveTextContent('AUTHORIZED');
  });

  it('should handle undefined history state', async () => {
    mockHistoryLocation = {
      key: 'history-key',
      state: undefined,
    };

    renderComponent();

    await waitFor(() =>
      expect(getRewardBatchById).toHaveBeenCalled()
    );

    expect(getRewardBatchById).toHaveBeenCalledWith(
      'initiative-123',
      'batch-1'
    );

    expect(mockReplace).toHaveBeenCalledTimes(1);

    expect(mockReplace).toHaveBeenCalledWith(
      expect.objectContaining({
        state: {
          store: expect.objectContaining({
            id: 'batch-1',
          }),
        },
      })
    );
  });

  it('should render selected status chip in status select', async () => {
    mockFormikValues = {
      status: 'AUTHORIZED',
      pointOfSaleId: '',
      trxCode: '',
      page: 0,
    };

    renderComponent();

    expect(await screen.findByTestId('status-test')).toHaveTextContent('AUTHORIZED');
  });

  it('should refresh batch data when invoice drawer is closed', async () => {
    renderComponent();

    await waitFor(() => expect(getRewardBatchById).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByTestId('drawer-close-button'));

    await waitFor(() => expect(getRewardBatchById).toHaveBeenCalledTimes(2));
  });

  it('should skip download when route params are missing', async () => {
    mockRouteParams = { initiative_id: '', batch_id: '' };

    renderComponent();

    const btn = await screen.findByTestId('download-csv-button-test');
    fireEvent.click(btn);

    await waitFor(() => expect(getRewardBatchById).toHaveBeenCalled());
    expect(downloadBatchCsv).not.toHaveBeenCalled();
  });
});
