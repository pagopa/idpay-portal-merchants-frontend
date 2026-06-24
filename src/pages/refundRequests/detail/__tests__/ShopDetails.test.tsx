import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShopDetails from '../ShopDetails';
import { BrowserRouter } from 'react-router-dom';

const mockHandleSubmit = jest.fn();
const mockResetForm = jest.fn();
const mockHandleChange = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    goBack: mockGoBack,
    replace: mockReplace,
    location: { state: { store: { id: 'batch-1' }, refundUploadSuccess: true } },
  }),
  useLocation: () => ({
    state: { store: { id: 'batch-1' }, batchId: 'batch-1' },
  }),
  useParams: () => ({ initiative_id: 'initiative-123', batch_id: 'batch-1' }),
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
  useFormik: () => ({
    values: {
      status: '',
      pointOfSaleId: '',
      trxCode: '',
      page: 0,
    },
    handleSubmit: mockHandleSubmit,
    resetForm: mockResetForm,
    handleChange: mockHandleChange,
    dirty: true,
  }),
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

const renderComponent = () =>
  render(
    <BrowserRouter>
      <ShopDetails />
    </BrowserRouter>
  );

describe('ShopDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    expect(screen.getByText('commons.backBtn')).toBeInTheDocument();
    expect(screen.getByText('Bonus Elettrodomestici')).toBeInTheDocument();
    expect(screen.getByText('pages.refundRequests.storeDetails.exportCSV')).toBeInTheDocument();
    expect(screen.getByTestId('download-csv-button-test')).toHaveProperty('disabled', false);
    fireEvent.click(screen.getByText('commons.backBtn'));
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
    const filtersBtn = screen.getByText('commons.filterBtn');
    const removeFiltersBtn = screen.getByText('commons.removeFiltersBtn');

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
});
