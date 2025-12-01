import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MerchantTransactionsProcessed from '../MerchantTransactionsProcessed';
import * as service from '../../../services/merchantService';
import * as helpers from '../../../helpers';
import * as hooks from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { MerchantTransactionProcessedDTO } from '../../../api/generated/merchants/MerchantTransactionProcessedDTO';
import { getMerchantTransactionsProcessed } from '../../../services/merchantService';
import { formatDate, formattedCurrency } from '../../../helpers';
import * as loadingHook from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import * as errorHook from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import * as tableDataFilteredHook from '../useTableDataFiltered';

window.scrollTo = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../../services/merchantService', () => ({
  getMerchantTransactionsProcessed: jest.fn(),
}));

jest.mock('../../../helpers', () => ({
  formatDate: jest.fn(),
  formattedCurrency: jest.fn(),
}));

jest.mock('../helpers', () => ({
  renderTrasactionProcessedStatus: jest.fn((status: string) => `status-${status}`),
  tableHeadData: [
    { width: '20%', label: 'head.date' },
    { width: '20%', label: 'head.fiscalCode' },
    { width: '20%', label: 'head.effectiveAmount' },
    { width: '20%', label: 'head.rewardAmount' },
    { width: '20%', label: 'head.status' },
  ],
}));

jest.mock('../useTableDataFiltered', () => ({
  useTableDataFiltered: jest.fn(),
}));

jest.mock('../useMemoInitTableData', () => ({
  useMemoInitTableData: jest.fn(),
}));

jest.mock('../../components/EmptyList', () => (props: { message: string }) => (
  <div data-testid="empty-list">{props.message}</div>
));

jest.mock('../TableHeader', () => () => (
  <thead data-testid="table-header-mock">
  <tr>
    <th>mock header</th>
  </tr>
  </thead>
));

jest.mock('../TablePaginator', () => (props: any) => (
  <div data-testid="paginator-mock">
    paginator-page-{props.page}-total-{props.totalElements}-rpp-{props.rowsPerPage}
  </div>
));

jest.mock('../FiltersForm', () => (props: any) => (
  <div data-testid="filters-form-mock">
    <button
      data-testid="submit-filters"
      onClick={() => props.formik.onSubmit(props.formik.values)}
    >
      apply-filters
    </button>
    <span>commons.filterBtn</span>
    <span>commons.removeFiltersBtn</span>
  </div>
));

let lastFormikConfig: any;

jest.mock('formik', () => ({
  useFormik: (config: any) => {
    lastFormikConfig = config;
    return {
      ...config,
      values: config.initialValues,
      handleSubmit: jest.fn(),
      handleChange: jest.fn(),
    };
  },
}));

const useTableDataFilteredMock =
  tableDataFilteredHook.useTableDataFiltered as jest.Mock;

const getMerchantTransactionsProcessedMock =
  getMerchantTransactionsProcessed as jest.Mock;

const formatDateMock = formatDate as jest.Mock;
const formattedCurrencyMock = formattedCurrency as jest.Mock;

describe('MerchantTransactionsProcessed', () => {
  const fakeId = '123';

  const fakeRows: MerchantTransactionProcessedDTO[] = [
    {
      updateDate: new Date('2025-10-06') as any,
      fiscalCode: 'AAAAAA00A00A000A',
      effectiveAmountCents: 1000,
      rewardAmountCents: 500,
      status: 'REWARDED',
    },
  ];

  let setLoadingMock: jest.Mock;
  let addErrorMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    lastFormikConfig = undefined;

    setLoadingMock = jest.fn();

    jest.spyOn(loadingHook, 'default').mockReturnValue(setLoadingMock);
    jest.spyOn(errorHook, 'default').mockReturnValue(addErrorMock);

    formatDateMock.mockReturnValue('formatted-date');
    formattedCurrencyMock.mockImplementation((value: number) => `currency-${value}`);
  });

  it('renderizza EmptyList quando non ci sono righe', () => {
    useTableDataFilteredMock.mockImplementation(() => {
    });

    render(<MerchantTransactionsProcessed id={fakeId} />);

    const empty = screen.getByTestId('empty-list');
    expect(empty).toBeInTheDocument();
    expect(empty).toHaveTextContent('pages.initiativeDiscounts.emptyProcessedList');
  });


  it('renderizza la tabella e il paginator quando ci sono righe', async () => {
    useTableDataFilteredMock.mockImplementation(
      (_id, _page, _fUser, _fStatus, _getTableData, setRows) => {
        setTimeout(() => {
          setRows(fakeRows);
        }, 0);
      }
    );

    render(<MerchantTransactionsProcessed id={fakeId} />);

    await waitFor(() => {
      expect(screen.getByText('formatted-date')).toBeInTheDocument();
    });

    expect(screen.getByText('currency-1000')).toBeInTheDocument();
    expect(screen.getByText('currency-500')).toBeInTheDocument();

    expect(screen.getByTestId('table-header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('paginator-mock')).toBeInTheDocument();
  });

  it('onSubmit con filtri valorizzati chiama il servizio con i parametri corretti (content > 0)', async () => {
    useTableDataFilteredMock.mockImplementation(() => {});

    getMerchantTransactionsProcessedMock.mockResolvedValue({
      pageNo: 2,
      pageSize: 10,
      totalElements: 5,
      content: fakeRows,
    });

    render(<MerchantTransactionsProcessed id={fakeId} />);

    expect(lastFormikConfig).toBeDefined();

    lastFormikConfig.onSubmit({
      searchUser: 'TEST_FISCAL_CODE',
      filterStatus: 'REWARDED',
    });

    await waitFor(() =>
      expect(getMerchantTransactionsProcessedMock).toHaveBeenCalledTimes(1)
    );

    expect(getMerchantTransactionsProcessedMock).toHaveBeenCalledWith({
      initiativeId: fakeId,
      page: 0,
      fiscalCode: 'TEST_FISCAL_CODE',
      status: 'REWARDED',
    });

    expect(setLoadingMock).toHaveBeenCalledWith(true);
    expect(setLoadingMock).toHaveBeenCalledWith(false);
  });

  it('onSubmit con filtri vuoti chiama il servizio con filtri undefined (content vuoto → ramo else)', async () => {
    useTableDataFilteredMock.mockImplementation(() => {});

    getMerchantTransactionsProcessedMock.mockResolvedValue({
      pageNo: 0,
      pageSize: 10,
      totalElements: 0,
      content: [],
    });

    render(<MerchantTransactionsProcessed id={fakeId} />);

    expect(lastFormikConfig).toBeDefined();

    lastFormikConfig.onSubmit({
      searchUser: '',
      filterStatus: '',
    });

    await waitFor(() =>
      expect(getMerchantTransactionsProcessedMock).toHaveBeenCalledTimes(1)
    );

    expect(getMerchantTransactionsProcessedMock).toHaveBeenCalledWith({
      initiativeId: fakeId,
      page: 0,
      fiscalCode: undefined,
      status: undefined,
    });

    expect(setLoadingMock).toHaveBeenCalledWith(true);
    expect(setLoadingMock).toHaveBeenCalledWith(false);
  });

  it('gestisce l\'errore chiamando addError e spegnendo il loading', async () => {
    useTableDataFilteredMock.mockImplementation(() => {});

    const error = new Error('boom');
    getMerchantTransactionsProcessedMock.mockRejectedValue(error);

    render(<MerchantTransactionsProcessed id={fakeId} />);

    expect(lastFormikConfig).toBeDefined();

    lastFormikConfig.onSubmit({
      searchUser: 'ANY',
      filterStatus: 'REWARDED',
    });

    await waitFor(() => expect(addErrorMock).toHaveBeenCalledTimes(1));

    expect(addErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'GET_INITIATIVE_MERCHANT_DISCOUNTS_PROCESSED_LIST_ERROR',
        error,
      })
    );

    expect(setLoadingMock).toHaveBeenCalledWith(true);
    expect(setLoadingMock).toHaveBeenCalledWith(false);
  });

  it('non chiama il servizio se id non è una stringa', async () => {
    useTableDataFilteredMock.mockImplementation(() => {});

    getMerchantTransactionsProcessedMock.mockResolvedValue({
      pageNo: 0,
      pageSize: 10,
      totalElements: 0,
      content: [],
    });

    render(<MerchantTransactionsProcessed id={123 as any} />);

    expect(lastFormikConfig).toBeDefined();

    lastFormikConfig.onSubmit({
      searchUser: 'TEST_FISCAL_CODE',
      filterStatus: 'REWARDED',
    });

    await waitFor(() =>
      expect(getMerchantTransactionsProcessedMock).not.toHaveBeenCalled()
    );
  });

  it('il bottone di FiltersForm mockato invoca onSubmit del formik', async () => {
    useTableDataFilteredMock.mockImplementation(() => {});

    getMerchantTransactionsProcessedMock.mockResolvedValue({
      pageNo: 0,
      pageSize: 10,
      totalElements: 0,
      content: [],
    });

    render(<MerchantTransactionsProcessed id={fakeId} />);

    expect(screen.getByText('commons.filterBtn')).toBeInTheDocument();
    expect(screen.getByText('commons.removeFiltersBtn')).toBeInTheDocument();

    const button = screen.getByTestId('submit-filters');
    fireEvent.click(button);

    await waitFor(() =>
      expect(getMerchantTransactionsProcessedMock).toHaveBeenCalledTimes(1)
    );
  });
});
