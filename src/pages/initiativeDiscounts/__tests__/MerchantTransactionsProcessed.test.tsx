import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MerchantTransactionsProcessed from '../MerchantTransactionsProcessed';
import * as service from '../../../services/merchantService';
import * as helpers from '../../../helpers';
import * as hooks from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import * as errorHooks from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { MerchantTransactionProcessedDTO } from '../../../api/generated/merchants/MerchantTransactionProcessedDTO';
import { useFormik } from 'formik';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../../helpers', () => ({
  formatDate: jest.fn((date) => `formatted-${date}`),
  formattedCurrency: jest.fn((value) => `$${value}`),
  renderTrasactionProcessedStatus: jest.fn((status) => `status-${status}`),
}));

jest.mock('../../../services/merchantService', () => ({
  getMerchantTransactionsProcessed: jest.fn(),
}));

jest.mock('formik', () => ({
  useFormik: jest.fn(),
}));

describe('MerchantTransactionsProcessed', () => {
  let setLoadingMock: jest.Mock;
  let addErrorMock: jest.Mock;
  const fakeId = '123';

  const fakeRows: MerchantTransactionProcessedDTO[] = [
    {
      updateDate: new Date('2025-10-06'),
      fiscalCode: 'AAAAAA00A00A000A',
      effectiveAmountCents: 1000,
      rewardAmountCents: 500,
      status: 'REWARDED',
    },
  ];

  beforeEach(() => {
    setLoadingMock = jest.fn();
    addErrorMock = jest.fn();

    jest.spyOn(hooks, 'default').mockReturnValue(setLoadingMock);
    jest.spyOn(errorHooks, 'default').mockReturnValue(addErrorMock);
    (useFormik as jest.Mock).mockReturnValue({
      values: { searchUser: '', filterStatus: '' },
      handleChange: jest.fn(),
      handleSubmit: jest.fn(),
    });
    jest.spyOn(helpers, 'formatDate').mockImplementation(() => '06/10/2025');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders EmptyList if no rows', () => {
    (service.getMerchantTransactionsProcessed as jest.Mock).mockResolvedValue({
      pageNo: 0,
      pageSize: 10,
      totalElements: 0,
      content: [],
    });

    render(<MerchantTransactionsProcessed id={fakeId} />);

    expect(screen.getByText('pages.initiativeDiscounts.emptyProcessedList')).toBeInTheDocument();
  });

  it.skip('renders table with data', async () => {
    render(<MerchantTransactionsProcessed id={fakeId} />);

    await waitFor(() => {
      expect(screen.getByText('AAAAAA00A00A000A')).toBeInTheDocument();
    });

    expect(screen.getByText('06/10/2025')).toBeInTheDocument();

    expect(screen.getByText('$10.00')).toBeInTheDocument(); // se formattedCurrency trasforma 1000 cent in $10.00
    expect(screen.getByText('$5.00')).toBeInTheDocument();
  });

  it('calls addError if getMerchantTransactionsProcessed fails', async () => {
    const error = new Error('fail');
    (service.getMerchantTransactionsProcessed as jest.Mock).mockRejectedValue(error);

    render(<MerchantTransactionsProcessed id={fakeId} />);

    await waitFor(() => {
      expect(addErrorMock).toHaveBeenCalledWith(expect.objectContaining({ error }));
    });
  });

  it('calls getTableData when form is submitted', async () => {
    const getTableDataSpy = jest
      .spyOn(service, 'getMerchantTransactionsProcessed')
      .mockResolvedValue({
        pageNo: 0,
        pageSize: 10,
        totalElements: 1,
        content: fakeRows,
      });

    render(<MerchantTransactionsProcessed id={fakeId} />);

    const submitButton = screen.getByTestId('apply-filters-test');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getTableDataSpy).toHaveBeenCalled();
    });
  });

  it('renders TablePaginator with correct props', async () => {
    const fakeRows = [
      {
        updateDate: new Date('2025-10-06'),
        fiscalCode: 'AAAAAA00A00A000A',
        effectiveAmountCents: 1000,
        rewardAmountCents: 500,
        status: 'REWARDED',
      },
    ];

    jest.spyOn(service, 'getMerchantTransactionsProcessed').mockResolvedValue({
      pageNo: 0,
      pageSize: 10,
      totalElements: 1,
      content: fakeRows,
    });

    render(<MerchantTransactionsProcessed id={fakeId} />);

    await waitFor(() => {
      expect(screen.getByText('AAAAAA00A00A000A')).toBeInTheDocument();
    });

    expect(screen.getByText(/1–1 di 1/i)).toBeInTheDocument();
  });
});
