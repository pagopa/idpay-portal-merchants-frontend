import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RefundRequests from './RefundRequests';
import * as merchantService from '../../services/merchantService';

// Mock delle dipendenze
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

jest.mock('../../components/dataTable/DataTable', () => ({
  __esModule: true,
  default: ({ 
    columns, 
    rows, 
    onRowSelectionChange,
    onSortModelChange,
    onPaginationPageChange,
    isRowSelectable 
  }: any) => (
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
                    onChange={() => onRowSelectionChange([row.id])}
                  />
                )}
              </td>
              {columns.slice(1).map((col: any) => (
                <td key={col.field}>
                  {col.renderCell 
                    ? col.renderCell({ value: row[col.field], row }) 
                    : row[col.field]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => onSortModelChange([{ field: 'name', sort: 'asc' }])}>
        Sort
      </button>
      <button onClick={() => onPaginationPageChange(2)}>
        Next Page
      </button>
    </div>
  ),
}));

jest.mock('../../components/Chip/CustomChip', () => ({
  __esModule: true,
  default: ({ label }: any) => <span data-testid="custom-chip">{label}</span>,
}));

jest.mock('../../components/Transactions/useStatus', () => ({
  __esModule: true,
  default: (status: string) => ({
    label: status,
    color: 'primary',
    textColor: 'white',
  }),
}));

jest.mock('../../components/Transactions/CurrencyColumn', () => ({
  __esModule: true,
  default: ({ value }: any) => <span>{value.toFixed(2)} €</span>,
}));

jest.mock('../reportedUsers/NoResultPaper', () => ({
  __esModule: true,
  default: ({ translationKey }: any) => (
    <div data-testid="no-result-paper">{translationKey}</div>
  ),
}));

jest.mock('./RefundRequestModal', () => ({
  RefundRequestsModal: ({ isOpen, setIsOpen, title, description, warning, cancelBtn, confirmBtn }: any) => (
    isOpen ? (
      <div data-testid="refund-modal">
        <h2>{title}</h2>
        <p>{description}</p>
        <p>{warning}</p>
        <button onClick={setIsOpen}>{cancelBtn}</button>
        <button onClick={confirmBtn.onConfirm}>{confirmBtn.text}</button>
      </div>
    ) : null
  ),
}));

const mockGetRewardBatches = jest.fn();

jest.mock('../../services/merchantService', () => ({
  getRewardBatches: (initiativeId: string) => mockGetRewardBatches(initiativeId),
}));

const mockData = [
  {
    id: 1,
    name: '001-20251125 223',
    posType: 'PHYSICAL',
    totalAmountCents: 10000,
    status: 'CREATED',
  },
  {
    id: 2,
    name: '002-20251125 224',
    posType: 'ONLINE',
    totalAmountCents: 20000,
    status: 'APPROVED',
  },
  {
    id: 3,
    name: '003-20251125 225',
    posType: 'ONLINE',
    totalAmountCents: 300000,
    status: 'EVALUATING',
  },
];

const createMockStore = (initiatives = [{ initiativeId: 'test-initiative-id' }]) => {
  return configureStore({
    reducer: {
      initiatives: (state = { initiativesList: initiatives }) => state,
    },
  });
};

const renderWithStore = (component: React.ReactElement, store = createMockStore()) => {
  return render(<Provider store={store}>{component}</Provider>);
};

describe('RefundRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRewardBatches.mockResolvedValue({ content: mockData });
  });

  it('should render the component correctly', async () => {
    renderWithStore(<RefundRequests />);
    
    await waitFor(() => {
      expect(screen.getByText('pages.refundRequests.title')).toBeInTheDocument();
    });
    
    expect(screen.getByText('pages.refundRequests.subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });


  it('should show loading spinner while fetching data', () => {
    mockGetRewardBatches.mockImplementation(() => new Promise(() => {}));
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
  });

  it('should show no result paper when there is no data', async () => {
    mockGetRewardBatches.mockResolvedValue({ content: [] });
    renderWithStore(<RefundRequests />);
    
    await waitFor(() => {
      expect(screen.getByTestId('no-result-paper')).toBeInTheDocument();
    });
    
    expect(screen.getByText('pages.refundRequests.noData')).toBeInTheDocument();
  });

  it('should handle fetch error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockGetRewardBatches.mockRejectedValue(new Error('API Error'));
    
    renderWithStore(<RefundRequests />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching reward batches:', expect.any(Error));
    });
    
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
      expect(screen.getByRole('button', { name: /pages.refundRequests.sendRequests \(1\)/i })).toBeInTheDocument();
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

  it('should close modal when confirm button is clicked', async () => {
    const user = userEvent.setup();
    renderWithStore(<RefundRequests />);
    
    await waitFor(() => {
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });
    
    const checkbox = screen.getByTestId('checkbox-1');
    await user.click(checkbox);
    
    const sendButton = await screen.findByRole('button', { name: /pages.refundRequests.sendRequests/i });
    await user.click(sendButton);
    
    const confirmButton = await screen.findByText(/Invia \(1\)/);
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('refund-modal')).not.toBeInTheDocument();
    });
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
    expect(screen.getByText('Importo')).toBeInTheDocument();
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
    expect(chips[1]).toHaveTextContent('APPROVED');
    expect(chips[2]).toHaveTextContent('EVALUATING');
  });

  it('should display formatted currency amounts', async () => {
    renderWithStore(<RefundRequests />);
    
    await waitFor(() => {
      expect(screen.getByText('100.00 €')).toBeInTheDocument();
    });
    
    expect(screen.getByText('200.00 €')).toBeInTheDocument();
    expect(screen.getByText('3000.00 €')).toBeInTheDocument();
  });

  it('should map posType correctly', async () => {
    renderWithStore(<RefundRequests />);
    
    await waitFor(() => {
      expect(screen.getByText('Fisico')).toBeInTheDocument();
    });
    
    const onlineTexts = screen.getAllByText('Online');
    expect(onlineTexts).toHaveLength(2);
  });

  it('should handle sort model change', async () => {
    const user = userEvent.setup();
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    renderWithStore(<RefundRequests />);
    
    await waitFor(() => {
      expect(screen.getByText('Sort')).toBeInTheDocument();
    });
    
    const sortButton = screen.getByText('Sort');
    await user.click(sortButton);
    
    expect(consoleLogSpy).toHaveBeenCalledWith([{ field: 'name', sort: 'asc' }]);
    consoleLogSpy.mockRestore();
  });

  it('should handle pagination page change', async () => {
    const user = userEvent.setup();
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    renderWithStore(<RefundRequests />);
    
    await waitFor(() => {
      expect(screen.getByText('Next Page')).toBeInTheDocument();
    });
    
    const nextPageButton = screen.getByText('Next Page');
    await user.click(nextPageButton);
    
    expect(consoleLogSpy).toHaveBeenCalledWith(2);
    consoleLogSpy.mockRestore();
  });

  it('should display tooltip text correctly with dash when value is empty', async () => {
    const emptyDataMock = [{
      id: 4,
      name: '',
      posType: 'PHYSICAL',
      totalAmountCents: 10000,
      status: 'CREATED',
    }];
    
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
      expect(mockGetRewardBatches).toHaveBeenCalled();
    });
  });

  it('should update modal content with selected rows count', async () => {
    const user = userEvent.setup();
    renderWithStore(<RefundRequests />);
    
    await waitFor(() => {
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });
    
    const checkbox = screen.getByTestId('checkbox-1');
    await user.click(checkbox);
    
    const sendButton = await screen.findByRole('button', { name: /pages.refundRequests.sendRequests \(1\)/i });
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invia \(1\)/)).toBeInTheDocument();
    });
  });

  it('should render SendIcon in the button', async () => {
    const user = userEvent.setup();
    renderWithStore(<RefundRequests />);
    
    await waitFor(() => {
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });
    
    const checkbox = screen.getByTestId('checkbox-1');
    await user.click(checkbox);
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /pages.refundRequests.sendRequests/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });
});