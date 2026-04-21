/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, useHistory } from 'react-router-dom';
import RefundRequests from '../RefundRequests';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

const mockSetAlert = jest.fn();
jest.mock('../../../hooks/useAlert', () => ({
  __esModule: true,
  useAlert: () => ({ setAlert: mockSetAlert }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

const mockGetRewardBatches = jest.fn();
const mockSendRewardBatch = jest.fn();

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  __esModule: true,
  useCurrentInitiativeId: () => ({ initiativeId: 'test-initiative-id' }),
}));

jest.mock('../../../services/merchantService', () => ({
  getRewardBatches: (initiativeId: string, pageNo: number, pageSize: number) =>
    mockGetRewardBatches(initiativeId, pageNo, pageSize),
  sendRewardBatch: (initiativeId: string, batchId: string) =>
    mockSendRewardBatch(initiativeId, batchId),
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
    numberOfTransactions: 1,
  },
  {
    id: 2,
    name: '002-20251125 224',
    posType: 'ONLINE',
    initialAmountCents: 20000,
    status: 'SENT',
    month: getPreviousMonth(),
    numberOfTransactions: 1,
  },
  {
    id: 3,
    name: '003-20251125 225',
    posType: 'ONLINE',
    initialAmountCents: 300000,
    status: 'EVALUATING',
    month: getPreviousMonth(),
    numberOfTransactions: 1,
  },
  {
    id: 4,
    name: '004-20251125 226',
    posType: 'ONLINE',
    initialAmountCents: 300000,
    status: 'CREATED',
    month: getPreviousMonth(),
    numberOfTransactions: 0,
  },
];

jest.mock('../../../components/dataTable/DataTable', () => ({
  __esModule: true,
  default: ({
    columns,
    rows,
    onPaginationPageChange,
  }: // onSelectionModelChange,
  // isRowSelectable,
  any) => (
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
          {rows.map((row: any, index: number) => (
            <tr key={row.id ?? index}>
              {/* <td>
                <button
                  data-testid={`select-row-${row.id ?? index}`}
                  onClick={() => onSelectionModelChange?.([row.id])}
                  disabled={isRowSelectable ? !isRowSelectable({ row }) : false}
                >
                  Select
                </button>
              </td> */}
              {columns.map((col: any) => (
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
  ),
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
        <button onClick={setIsOpen}>{cancelBtn.text}</button>
        <button
          onClick={confirmBtn ? confirmBtn.onConfirm : undefined}
          disabled={confirmBtn?.loading}
        >
          {confirmBtn?.text}
        </button>
      </div>
    ) : null,
}));

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
    mockGetRewardBatches.mockResolvedValue({
      content: mockData,
      pageNo: 0,
      pageSize: 10,
      totalElements: mockData.length,
    });
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

  it('should call history.push', async () => {
    const pushMock = jest.fn();

    (useHistory as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalled();
    });

    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[0]);

    expect(pushMock).toHaveBeenCalled();
  });

  it('should fetch reward batches on mount', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalledWith('test-initiative-id', 0, 10);
    });
  });

  it('should show loading spinner while fetching data', async () => {
    mockGetRewardBatches.mockReturnValueOnce(new Promise(() => {}));

    renderWithStore(<RefundRequests />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display data after successful fetch', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByText('001-20251125 223')).toBeInTheDocument();
    });

    expect(screen.getByText('002-20251125 224')).toBeInTheDocument();
    expect(screen.getByText('003-20251125 225')).toBeInTheDocument();
    expect(screen.getByText('004-20251125 226')).toBeInTheDocument();
  });

  it('should show no result paper when there is no data', async () => {
    mockGetRewardBatches.mockResolvedValue({
      content: [],
      pageNo: 0,
      pageSize: 10,
      totalElements: 0,
    });
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalled();
    });

    expect(screen.getByText('pages.refundRequests.noData')).toBeInTheDocument();
    expect(screen.getByText('pages.refundRequests.noData')).toBeInTheDocument();
  });

  it('should handle fetch error gracefully', async () => {
    mockGetRewardBatches.mockRejectedValue(new Error('API Error'));

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

    expect(await screen.findByText('pages.refundRequests.noData')).toBeInTheDocument();
  });

  it('should not show send button when no rows are selected', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('button', { name: /pages.refundRequests.sendRequests/i })
    ).not.toBeInTheDocument();
  });

  it('should render table columns correctly', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => expect(screen.getByText('Lotto')).toBeInTheDocument());

    expect(screen.getByText('Tipologia')).toBeInTheDocument();
    expect(screen.getByText('Rimborso richiesto')).toBeInTheDocument();
    expect(screen.getByText('Stato')).toBeInTheDocument();
  });

  it('should map posType correctly', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(screen.getByText('Fisico')).toBeInTheDocument();
    });

    const onlineTexts = screen.getAllByText('Online');
    expect(onlineTexts).toHaveLength(3);
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
      expect(screen.getAllByText('-')).toHaveLength(3);
    });
  });

  it('should handle pagination page change', async () => {
    const user = userEvent.setup();
    renderWithStore(<RefundRequests />);

    await waitFor(() => expect(screen.getByTestId('data-table')).toBeInTheDocument());

    await user.click(screen.getByText('Next Page'));

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalledWith('test-initiative-id', 2, 10);
    });
  });

  it('should open modal and send batch successfully', async () => {
    jest.useFakeTimers();
    renderWithStore(<RefundRequests />);

    await waitFor(() => expect(screen.getByTestId('data-table')).toBeInTheDocument());

    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[0]);

    await waitFor(() =>
      expect(screen.getByText('pages.refundRequests.sendRequests')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText('pages.refundRequests.sendRequests'));

    await waitFor(() => expect(screen.getByTestId('refund-modal')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Invia/i }));

    await waitFor(() => {
      expect(mockSendRewardBatch).toHaveBeenCalledWith('test-initiative-id', 1);
    });

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'pages.refundRequests.rewardBatchSentSuccess',
          isOpen: true,
          severity: 'success',
        })
      );
    });

    jest.useRealTimers();
  });

  it('should show error message on empty batch select', async () => {
    jest.useFakeTimers();
    renderWithStore(<RefundRequests />);

    await waitFor(() => expect(screen.getByTestId('data-table')).toBeInTheDocument());

    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[3]);

    await waitFor(() => {
      expect(screen.getByTestId('refund-modal')).toBeInTheDocument();
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

  it('should handle null response from getRewardBatches', async () => {
    mockGetRewardBatches.mockResolvedValue({
      content: [],
      pageNo: 0,
      pageSize: 10,
      totalElements: 0,
    });

    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalled();
    });

    expect(screen.getByText('pages.refundRequests.noData')).toBeInTheDocument();
  });

  it('should handle response without content property', async () => {
    mockGetRewardBatches.mockResolvedValue({
      content: [],
      pageNo: 0,
      pageSize: 10,
      totalElements: 0,
    });

    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      expect(mockGetRewardBatches).toHaveBeenCalled();
    });

    expect(screen.getByText('pages.refundRequests.noData')).toBeInTheDocument();
  });

  it('should render spacer column', async () => {
    renderWithStore(<RefundRequests />);

    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers[0]).toHaveTextContent('');
    });
  });

  it('should show specific error alert when backend says previous month batch was not sent (REWARD_BATCH_PREVIOUS_NOT_SENT)', async () => {
    mockSendRewardBatch.mockResolvedValueOnce({ code: 'REWARD_BATCH_PREVIOUS_NOT_SENT' });
    mockGetRewardBatches.mockResolvedValue({
      content: mockData,
      pageNo: 0,
      pageSize: 10,
      totalElements: mockData.length,
    });

    renderWithStore(<RefundRequests />);

    await waitFor(() => expect(screen.getByTestId('data-table')).toBeInTheDocument());

    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[0]);

    await waitFor(() =>
      expect(screen.getByText('pages.refundRequests.sendRequests')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText('pages.refundRequests.sendRequests'));

    fireEvent.click(screen.getByRole('button', { name: /Invia/i }));

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'errors.genericTitle',
          text: 'errors.sendTheBatchForPreviousMonth',
          isOpen: true,
          severity: 'error',
        })
      );
    });
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

    mockGetRewardBatches.mockResolvedValue({
      content: dataWithApprovedAmounts,
      pageNo: 0,
      pageSize: 10,
      totalElements: dataWithApprovedAmounts.length,
    });

    renderWithStore(<RefundRequests />);

    await waitFor(() => expect(mockGetRewardBatches).toHaveBeenCalled());

    expect(screen.getAllByText('Rimborso approvato')).toHaveLength(2);
    expect(screen.getByText('Rimborso sospeso')).toBeInTheDocument();

    expect(screen.getByText(/123.45\s€/)).toBeInTheDocument();
    expect(screen.getByText(/2.00\s€/)).toBeInTheDocument();

    expect(screen.queryByText(/99.99\s€/)).not.toBeInTheDocument();
    expect(screen.queryByText(/88.88\s€/)).not.toBeInTheDocument();
  });

  it('should dispatch an error alert when getRewardBatches fails', async () => {
    mockGetRewardBatches.mockRejectedValueOnce(new Error('API Error'));
    mockGetRewardBatches.mockResolvedValueOnce({
      content: [],
      pageNo: 0,
      pageSize: 10,
      totalElements: 0,
    });
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
    expect(screen.getByText('pages.refundRequests.noData')).toBeInTheDocument();
  });
});
