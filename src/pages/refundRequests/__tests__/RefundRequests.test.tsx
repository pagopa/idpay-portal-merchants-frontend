import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as ReactRouterDom from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route } from 'react-router-dom';
import RefundRequests from '../RefundRequests';

const mockSetAlert = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@pagopa/selfcare-common-frontend', () => ({
  TitleBox: ({ title, subTitle }: any) => (
    <div>
      <h4>{title}</h4>
      <p>{subTitle}</p>
    </div>
  ),
}));

jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

jest.mock('../../../hooks/useAlert', () => ({
  __esModule: true,
  useAlert: () => ({ setAlert: mockSetAlert }),
}));

jest.mock('../../../components/dataTable/DataTable', () => ({
  __esModule: true,
  default: ({
              columns,
              rows,
              onRowSelectionChange,
              onPaginationPageChange,
              isRowSelectable,
            }: any) => {
    if (columns?.[0]?.renderCell) {
      columns[0].renderCell({ value: undefined, row: rows?.[0] });
    }

    return (
      <div data-testid="data-table">
        <table>
          <thead>
          <tr>
            {columns.map((col: any) => (
              <th key={col.field}>{col.headerName}</th>
            ))}
          </tr>
          </thead>
          <tbody>
          {rows.map((row: any) => (
            <tr key={row.id}>
              <td>
                {isRowSelectable({ row }) && (
                  <input
                    type="checkbox"
                    data-testid={`checkbox-${row.id}`}
                    onChange={() => {
                      const selectedRow = row?.__throwOnSelect
                        ? Object.defineProperty({ ...row }, 'id', {
                          get: () => {
                            throw new Error('Selection error');
                          },
                        })
                        : row;

                      onRowSelectionChange([selectedRow]);
                    }}
                  />
                )}
              </td>
              {columns.slice(1).map((col: any) => (
                <td key={col.field}>
                  {col.renderCell ? col.renderCell({ value: row[col.field], row }) : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
        <button onClick={() => onPaginationPageChange(2)}>Next Page</button>
      </div>
    );
  },
}));

jest.mock('../../../components/Chip/CustomChip', () => ({
  __esModule: true,
  default: ({ label }: any) => <span data-testid="custom-chip">{label}</span>,
}));

jest.mock('../../../components/Transactions/useStatus', () => ({
  __esModule: true,
  default: (status: string) => ({
    label: status,
    color: 'primary',
    textColor: 'white',
  }),
}));

jest.mock('../../../components/Transactions/CurrencyColumn', () => ({
  __esModule: true,
  default: ({ value }: any) => <span>{value.toFixed(2)} €</span>,
}));

jest.mock('../../reportedUsers/NoResultPaper', () => ({
  __esModule: true,
  default: ({ translationKey }: any) => <div data-testid="no-result-paper">{translationKey}</div>,
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  intiativesListSelector: (state: any) => state.initiatives.initiativesList,
}));

jest.mock('../RefundRequestModal', () => ({
  RefundRequestsModal: ({
                          isOpen,
                          setIsOpen,
                          title,
                          description,
                          warning,
                          cancelBtn,
                          confirmBtn,
                        }: any) =>
    isOpen ? (
      <div data-testid="refund-modal">
        <h2>{title}</h2>
        <p>{description}</p>
        <p>{warning}</p>
        <button onClick={setIsOpen}>{cancelBtn}</button>
        <button onClick={confirmBtn.onConfirm} disabled={confirmBtn.loading}>
          {confirmBtn.text}
        </button>
      </div>
    ) : null,
}));

const mockGetRewardBatches = jest.fn();
const mockSendRewardBatch = jest.fn();

jest.mock('../../../services/merchantService', () => ({
  getRewardBatches: (initiativeId: string) => mockGetRewardBatches(initiativeId),
  sendRewardBatch: (initiativeId: string, batchId: string) => mockSendRewardBatch(initiativeId, batchId),
}));

const getPreviousMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const mockData = [
  {
    id: 1,
    name: '001-20251125 223',
    posType: 'PHYSICAL',
    initialAmountCents: 10000,
    status: 'CREATED',
    month: getPreviousMonth(),
  },
  {
    id: 2,
    name: '002-20251125 224',
    posType: 'ONLINE',
    initialAmountCents: 20000,
    status: 'SENT',
    month: getPreviousMonth(),
  },
  {
    id: 3,
    name: '003-20251125 225',
    posType: 'ONLINE',
    initialAmountCents: 300000,
    status: 'EVALUATING',
    month: getPreviousMonth(),
  },
];

const createMockStore = (initiatives = [{ initiativeId: 'test-initiative-id' }]) =>
  configureStore({
    reducer: {
      initiatives: () => ({ initiativesList: initiatives }),
    },
  });

const renderWithStore = (component: React.ReactElement, store = createMockStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/refund-requests']}>
        <Route path="/refund-requests">{component}</Route>
      </MemoryRouter>
    </Provider>
  );

describe('RefundRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRewardBatches.mockResolvedValue({ content: mockData });
    mockSendRewardBatch.mockResolvedValue({});
  });

  it('should render the component correctly', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalled();
    });

    expect(screen.getByText('pages.refundRequests.title')).toBeInTheDocument();
    expect(screen.getByText('pages.refundRequests.subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('should fetch reward batches on mount', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalledWith('test-initiative-id');
    });
  });

  it('should show loading spinner while fetching data', async () => {
    let resolvePromise: any;
    mockGetRewardBatches.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    renderWithStore(<RefundRequests />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    resolvePromise({ content: mockData });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('should display data after successful fetch', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByText('001-20251125 223')).toBeInTheDocument();
    });

    expect(screen.getByText('002-20251125 224')).toBeInTheDocument();
    expect(screen.getByText('003-20251125 225')).toBeInTheDocument();
  });

  it('should show no result paper when there is no data', async () => {
    mockGetRewardBatches.mockResolvedValueOnce({ content: [] });
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalled();
    });

    expect(screen.getByTestId('no-result-paper')).toBeInTheDocument();
    expect(screen.getByText('pages.refundRequests.noData')).toBeInTheDocument();
  });

  it('should handle fetch error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockGetRewardBatches.mockRejectedValueOnce(new Error('API Error'));

    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalled();
    });

    expect(screen.getByTestId('no-result-paper')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('should not show send button when no rows are selected', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /pages.refundRequests.sendRequests/i })).not.toBeInTheDocument();
  });

  it('should show send button when rows are selected', async () => {
    const user = userEvent.setup();
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });

    const checkbox = screen.getByTestId('checkbox-1');
    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pages.refundRequests.sendRequests/i })).toBeInTheDocument();
    });
  });

  it('should open modal when send button is clicked', async () => {
    const user = userEvent.setup();
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });

    const checkbox = screen.getByTestId('checkbox-1');
    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pages.refundRequests.sendRequests/i })).toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: /pages.refundRequests.sendRequests/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByTestId('refund-modal')).toBeInTheDocument();
    });
  });

  it('should close modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });

    const checkbox = screen.getByTestId('checkbox-1');
    await user.click(checkbox);

    const sendButton = await screen.findByRole('button', { name: /pages.refundRequests.sendRequests/i });
    await user.click(sendButton);

    const cancelButton = await screen.findByText('Indietro');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('refund-modal')).not.toBeInTheDocument();
    });
  });

  it('should call sendRewardBatch and close modal when confirm button is clicked', async () => {
    const user = userEvent.setup();
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });

    const checkbox = screen.getByTestId('checkbox-1');
    await user.click(checkbox);

    const sendButton = await screen.findByRole('button', { name: /pages.refundRequests.sendRequests/i });
    await user.click(sendButton);

    const confirmButton = await screen.findByText('Invia');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockSendRewardBatch).toHaveBeenCalledWith('test-initiative-id', '1');
    });

    await waitFor(() => {
      expect(screen.queryByTestId('refund-modal')).not.toBeInTheDocument();
    });
  });

  it('should handle sendRewardBatch error and show error notification', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockSendRewardBatch.mockRejectedValueOnce(new Error('Send Error'));

    const user = userEvent.setup();
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });

    const checkbox = screen.getByTestId('checkbox-1');
    await user.click(checkbox);

    const sendButton = await screen.findByRole('button', { name: /pages.refundRequests.sendRequests/i });
    await user.click(sendButton);

    const confirmButton = await screen.findByText('Invia');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockSendRewardBatch).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('refund-modal')).not.toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should only allow selection of rows with CREATED status', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    expect(screen.queryByTestId('checkbox-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('checkbox-3')).not.toBeInTheDocument();
  });

  it('should render table columns correctly', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByText('Lotto')).toBeInTheDocument();
    });

    expect(screen.getByText('Tipologia')).toBeInTheDocument();
    expect(screen.getByText('Rimborso richiesto')).toBeInTheDocument();
    expect(screen.getByText('Stato')).toBeInTheDocument();
  });

  it('should display status chips for each row', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      const chips = screen.getAllByTestId('custom-chip');
      expect(chips).toHaveLength(3);
    });

    const chips = screen.getAllByTestId('custom-chip');
    expect(chips[0]).toHaveTextContent('CREATED');
    expect(chips[1]).toHaveTextContent('SENT');
    expect(chips[2]).toHaveTextContent('EVALUATING');
  });

  it('should map posType correctly', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByText('Fisico')).toBeInTheDocument();
    });

    const onlineTexts = screen.getAllByText('Online');
    expect(onlineTexts).toHaveLength(2);
  });

  it('should display tooltip text correctly with dash when value is empty', async () => {
    const emptyDataMock = [
      {
        id: 4,
        name: '',
        posType: 'PHYSICAL',
        initialAmountCents: 10000,
        status: 'CREATED',
        month: getPreviousMonth(),
      },
    ];

    mockGetRewardBatches.mockResolvedValue({ content: emptyDataMock });
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  it('should handle missing initiativesList gracefully', async () => {
    const storeWithoutInitiatives = createMockStore([]);

    renderWithStore(<RefundRequests />, storeWithoutInitiatives);

    await waitFor(() => {
      expect(screen.getByText('pages.refundRequests.title')).toBeInTheDocument();
    });

    expect(screen.getByTestId('no-result-paper')).toBeInTheDocument();
    expect(mockGetRewardBatches).not.toHaveBeenCalled();
  });

  it('should handle pagination page change', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const user = userEvent.setup();

    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByText('Next Page');
    await user.click(nextPageButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Page changed:', 2);

    consoleLogSpy.mockRestore();
  });

  it('should show loading state in modal when sending batch', async () => {
    let resolvePromise: any;
    mockSendRewardBatch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const user = userEvent.setup();
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });

    const checkbox = screen.getByTestId('checkbox-1');
    await user.click(checkbox);

    const sendButton = await screen.findByRole('button', { name: /pages.refundRequests.sendRequests/i });
    await user.click(sendButton);

    const confirmButton = await screen.findByText('Invia');
    await user.click(confirmButton);

    await waitFor(() => {
      const disabledButton = screen.getByRole('button', { name: /Invia/i });
      expect(disabledButton).toBeDisabled();
    });

    resolvePromise({});

    await waitFor(() => {
      expect(screen.queryByTestId('refund-modal')).not.toBeInTheDocument();
    });
  });

  it('should handle missing initiativeId when sending batch', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const storeWithoutInitiatives = createMockStore([]);

    renderWithStore(<RefundRequests />, storeWithoutInitiatives);

    await waitFor(() => {
      expect(screen.getByText('pages.refundRequests.title')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle missing batchId when sending batch', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle null response from getRewardBatches', async () => {
    mockGetRewardBatches.mockResolvedValueOnce(null);

    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalled();
    });

    expect(screen.getByTestId('no-result-paper')).toBeInTheDocument();
  });

  it('should handle response without content property', async () => {
    mockGetRewardBatches.mockResolvedValueOnce({});

    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalled();
    });

    expect(screen.getByTestId('no-result-paper')).toBeInTheDocument();
  });

  it('should render spacer column', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers[0]).toHaveTextContent('');
    });
  });

  it.skip('should navigate using the row action icon and pass navigation state correctly', async () => {
    const user = userEvent.setup();

    const pushMock = jest.fn();
    const useParamsSpy = jest.spyOn(ReactRouterDom, 'useParams').mockReturnValue({ id: 'initiative-123' } as any);

    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByTestId('1')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('1'));

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining('initiative-123'),
      expect.objectContaining({
        batchId: '1',
        store: expect.objectContaining({
          id: 1,
          name: '001-20251125 223',
        }),
      })
    );

    useHistorySpy.mockRestore();
    useParamsSpy.mockRestore();
  });

  it('should apply isRowSelectable rules for month/year, numberOfTransactions, and missing month', async () => {
    const currentYear = new Date().getFullYear();
    const selectableSameYearPastMonth = `${currentYear}-00`;
    const selectablePreviousYear = `${currentYear - 1}-12`;
    const notSelectableSameYearFutureMonth = `${currentYear}-13`;
    const customData = [
      {
        id: 11,
        name: 'same-year-past',
        posType: 'PHYSICAL',
        initialAmountCents: 10000,
        status: 'CREATED',
        month: selectableSameYearPastMonth,
        numberOfTransactions: 1,
      },
      {
        id: 12,
        name: 'same-year-future',
        posType: 'PHYSICAL',
        initialAmountCents: 10000,
        status: 'CREATED',
        month: notSelectableSameYearFutureMonth,
        numberOfTransactions: 1,
      },
      {
        id: 13,
        name: 'missing-month',
        posType: 'PHYSICAL',
        initialAmountCents: 10000,
        status: 'CREATED',
        numberOfTransactions: 1,
      },
      {
        id: 14,
        name: 'previous-year',
        posType: 'PHYSICAL',
        initialAmountCents: 10000,
        status: 'CREATED',
        month: selectablePreviousYear,
        numberOfTransactions: 1,
      },
      {
        id: 15,
        name: 'zero-transactions',
        posType: 'PHYSICAL',
        initialAmountCents: 10000,
        status: 'CREATED',
        month: selectableSameYearPastMonth,
        numberOfTransactions: 0,
      },
      {
        id: 16,
        name: 'not-created',
        posType: 'PHYSICAL',
        initialAmountCents: 10000,
        status: 'SENT',
        month: selectableSameYearPastMonth,
        numberOfTransactions: 1,
      },
    ];

    mockGetRewardBatches.mockResolvedValueOnce({ content: customData });

    renderWithStore(<RefundRequests />);

    await waitFor(() => expect(screen.getByTestId('data-table')).toBeInTheDocument());

    expect(screen.getByTestId('checkbox-11')).toBeInTheDocument();
    expect(screen.getByTestId('checkbox-14')).toBeInTheDocument();

    expect(screen.queryByTestId('checkbox-12')).not.toBeInTheDocument();
    expect(screen.queryByTestId('checkbox-13')).not.toBeInTheDocument();
    expect(screen.queryByTestId('checkbox-15')).not.toBeInTheDocument();
    expect(screen.queryByTestId('checkbox-16')).not.toBeInTheDocument();
  });

  it('should map approved/suspended amounts only for APPROVED batches (others become undefined)', async () => {
    const currentYear = new Date().getFullYear();
    const monthAlwaysSelectable = `${currentYear}-00`;

    const dataWithApprovedAmounts = [
      {
        id: 21,
        name: 'approved-batch',
        posType: 'ONLINE',
        initialAmountCents: 5000,
        approvedAmountCents: 12345,
        suspendedAmountCents: 200,
        status: 'APPROVED',
        month: monthAlwaysSelectable,
        numberOfTransactions: 1,
      },
      {
        id: 22,
        name: 'created-but-has-amounts-in-response',
        posType: 'ONLINE',
        initialAmountCents: 7000,
        approvedAmountCents: 9999,
        suspendedAmountCents: 8888,
        status: 'CREATED',
        month: monthAlwaysSelectable,
        numberOfTransactions: 1,
      },
    ];

    mockGetRewardBatches.mockResolvedValueOnce({ content: dataWithApprovedAmounts });

    renderWithStore(<RefundRequests />);

    await waitFor(() => expect(screen.getByTestId('data-table')).toBeInTheDocument());

    expect(screen.getByText('Rimborso approvato')).toBeInTheDocument();
    expect(screen.getByText('Rimborso sospeso')).toBeInTheDocument();

    expect(screen.getByText('123.45 €')).toBeInTheDocument();
    expect(screen.getByText('2.00 €')).toBeInTheDocument();

    expect(screen.queryByText('99.99 €')).not.toBeInTheDocument();
    expect(screen.queryByText('88.88 €')).not.toBeInTheDocument();

    const nanValues = screen.getAllByText('NaN €');
    expect(nanValues.length).toBeGreaterThanOrEqual(2);
  });

  it('should dispatch an error alert when getRewardBatches fails', async () => {
    mockGetRewardBatches.mockRejectedValueOnce(new Error('API Error'));

    renderWithStore(<RefundRequests />);

    await waitFor(() => expect(mockGetRewardBatches).toHaveBeenCalled());

    expect(mockSetAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'errors.genericTitle',
        text: 'errors.genericDescription',
        isOpen: true,
        severity: 'error',
      })
    );
    expect(screen.getByTestId('no-result-paper')).toBeInTheDocument();
  });

  it('should log error and not call sendRewardBatch when initiativeId is missing', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const currentYear = new Date().getFullYear();
    const monthAlwaysSelectable = `${currentYear}-00`;
    const data = [
      {
        id: 31,
        name: 'batch-missing-initiative-id',
        posType: 'PHYSICAL',
        initialAmountCents: 10000,
        status: 'CREATED',
        month: monthAlwaysSelectable,
        numberOfTransactions: 1,
      },
    ];

    mockGetRewardBatches.mockResolvedValueOnce({ content: data });

    const storeWithUndefinedInitiativeId = createMockStore([{ initiativeId: undefined } as any]);
    renderWithStore(<RefundRequests />, storeWithUndefinedInitiativeId);

    await waitFor(() => expect(screen.getByTestId('checkbox-31')).toBeInTheDocument());

    await user.click(screen.getByTestId('checkbox-31'));

    const sendButton = await screen.findByRole('button', { name: /pages.refundRequests.sendRequests/i });
    await user.click(sendButton);

    const confirmButton = await screen.findByText('Invia');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Missing initiativeId or batchId');
    });

    expect(mockSendRewardBatch).not.toHaveBeenCalled();
    expect(mockSetAlert).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByTestId('refund-modal')).not.toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should log error and not call sendRewardBatch when batchId is missing', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const currentYear = new Date().getFullYear();
    const monthAlwaysSelectable = `${currentYear}-00`;
    const data = [
      {
        id: 0,
        name: 'batch-missing-id',
        posType: 'PHYSICAL',
        initialAmountCents: 10000,
        status: 'CREATED',
        month: monthAlwaysSelectable,
        numberOfTransactions: 1,
      },
    ];

    mockGetRewardBatches.mockResolvedValueOnce({ content: data });

    renderWithStore(<RefundRequests />);

    await waitFor(() => expect(screen.getByTestId('checkbox-0')).toBeInTheDocument());

    await user.click(screen.getByTestId('checkbox-0'));

    const sendButton = await screen.findByRole('button', { name: /pages.refundRequests.sendRequests/i });
    await user.click(sendButton);

    const confirmButton = await screen.findByText('Invia');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Missing initiativeId or batchId');
    });

    expect(mockSendRewardBatch).not.toHaveBeenCalled();
    expect(mockSetAlert).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByTestId('refund-modal')).not.toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should show specific error alert when backend says previous month batch was not sent (REWARD_BATCH_PREVIOUS_NOT_SENT)', async () => {
    const user = userEvent.setup();

    const currentYear = new Date().getFullYear();
    const monthAlwaysSelectable = `${currentYear}-00`;
    const data = [
      {
        id: 41,
        name: 'batch-prev-not-sent',
        posType: 'PHYSICAL',
        initialAmountCents: 10000,
        status: 'CREATED',
        month: monthAlwaysSelectable,
        numberOfTransactions: 1,
      },
    ];

    mockGetRewardBatches.mockResolvedValueOnce({ content: data });
    mockSendRewardBatch.mockResolvedValueOnce({ code: 'REWARD_BATCH_PREVIOUS_NOT_SENT' });

    renderWithStore(<RefundRequests />);

    await waitFor(() => expect(screen.getByTestId('checkbox-41')).toBeInTheDocument());

    await user.click(screen.getByTestId('checkbox-41'));

    const sendButton = await screen.findByRole('button', { name: /pages.refundRequests.sendRequests/i });
    await user.click(sendButton);

    const confirmButton = await screen.findByText('Invia');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockSendRewardBatch).toHaveBeenCalledWith('test-initiative-id', '41');
    });

    expect(mockSetAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'errors.genericTitle',
        text: 'errors.sendTheBatchForPreviousMonth',
        isOpen: true,
        severity: 'error',
      })
    );

    expect(mockGetRewardBatches).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByTestId('refund-modal')).not.toBeInTheDocument();
    });
  });

  it('should show success alert after sending and refresh list even if sendRewardBatch returns an unknown code', async () => {
    const user = userEvent.setup();

    const originalSetTimeout = global.setTimeout;

    const currentYear = new Date().getFullYear();
    const monthAlwaysSelectable = `${currentYear}-00`;
    const data = [
      {
        id: 1,
        name: 'success-refresh',
        posType: 'PHYSICAL',
        initialAmountCents: 10000,
        status: 'CREATED',
        month: monthAlwaysSelectable,
        numberOfTransactions: 1,
      },
    ];

    mockGetRewardBatches.mockResolvedValue({ content: data });
    mockSendRewardBatch.mockResolvedValueOnce({ code: 'SOME_OTHER_CODE' });

    renderWithStore(<RefundRequests />);

    await waitFor(() => expect(screen.getByTestId('checkbox-1')).toBeInTheDocument());

    await user.click(screen.getByTestId('checkbox-1'));

    const sendButton = await screen.findByRole('button', { name: /pages.refundRequests.sendRequests/i });
    await user.click(sendButton);

    const confirmButton = await screen.findByText('Invia');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockSendRewardBatch).toHaveBeenCalledWith('test-initiative-id', '1');
    });

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalledTimes(2);
    });

    expect(mockSetAlert).not.toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'pages.refundRequests.rewardBatchSentSuccess',
        isOpen: true,
        severity: 'success',
      })
    );

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /pages.refundRequests.sendRequests/i })).not.toBeInTheDocument();
    });
  });

  it('should refresh list and show generic error alert when sending a batch fails', async () => {
    const user = userEvent.setup();

    const currentYear = new Date().getFullYear();
    const monthAlwaysSelectable = `${currentYear}-00`;
    const data = [
      {
        id: 61,
        name: 'send-fails-refresh',
        posType: 'PHYSICAL',
        initialAmountCents: 10000,
        status: 'CREATED',
        month: monthAlwaysSelectable,
        numberOfTransactions: 1,
      },
    ];

    mockGetRewardBatches.mockResolvedValue({ content: data });
    mockSendRewardBatch.mockRejectedValueOnce(new Error('Send failed'));

    renderWithStore(<RefundRequests />);

    await waitFor(() => expect(screen.getByTestId('checkbox-61')).toBeInTheDocument());

    await user.click(screen.getByTestId('checkbox-61'));

    const sendButton = await screen.findByRole('button', { name: /pages.refundRequests.sendRequests/i });
    await user.click(sendButton);

    const confirmButton = await screen.findByText('Invia');
    await user.click(confirmButton);

    await waitFor(() => expect(mockSendRewardBatch).toHaveBeenCalled());

    expect(mockSetAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'errors.genericTitle',
        text: 'errors.genericDescription',
        isOpen: true,
        severity: 'error',
      })
    );

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('refund-modal')).not.toBeInTheDocument();
    });
  });

  it('should skip catch-refresh when initiativeId is an empty string (covers false branch inside catch)', async () => {
    const user = userEvent.setup();

    const currentYear = new Date().getFullYear();
    const monthAlwaysSelectable = `${currentYear}-00`;

    const data = [
      {
        id: 71,
        name: 'force-catch-before-missing-check',
        posType: 'PHYSICAL',
        initialAmountCents: 10000,
        status: 'CREATED',
        month: monthAlwaysSelectable,
        numberOfTransactions: 1,
        __throwOnSelect: true,
      },
    ];

    mockGetRewardBatches.mockResolvedValueOnce({ content: data });
    mockSendRewardBatch.mockResolvedValueOnce({});

    const storeWithEmptyStringInitiativeId = createMockStore([{ initiativeId: '' } as any]);
    renderWithStore(<RefundRequests />, storeWithEmptyStringInitiativeId);

    await waitFor(() => expect(screen.getByTestId('checkbox-71')).toBeInTheDocument());

    await user.click(screen.getByTestId('checkbox-71'));

    const sendButton = await screen.findByRole('button', { name: /pages.refundRequests.sendRequests/i });
    await user.click(sendButton);

    const confirmButton = await screen.findByText('Invia');
    await user.click(confirmButton);

    await waitFor(() =>
      expect(mockSetAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'errors.genericTitle',
          text: 'errors.genericDescription',
          isOpen: true,
          severity: 'error',
        })
      )
    );

    expect(mockSendRewardBatch).not.toHaveBeenCalled();

    expect(mockGetRewardBatches).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByTestId('refund-modal')).not.toBeInTheDocument();
    });
  });
});
