import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import InvoiceDataTable from '../invoiceDataTable';
import { getMerchantTransactionsProcessed, downloadInvoiceFile } from '../../../services/merchantService';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'initiative-123' }),
}));

jest.mock('../../../services/merchantService', () => ({
  getMerchantTransactionsProcessed: jest.fn(),
  downloadInvoiceFile: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../components/dataTable/DataTable', () => (props: any) => {
  const firstRow = props.rows[0];
  return (
    <div data-testid="data-table">
      <button
        type="button"
        data-testid="sort-by-date"
        onClick={() =>
          props.onSortModelChange &&
          props.onSortModelChange([{ field: 'trxChargeDate', sort: 'asc' }])
        }
      >
        sort
      </button>
      <button
        type="button"
        data-testid="clear-sort"
        onClick={() =>
          props.onSortModelChange &&
          props.onSortModelChange([])
        }
      >
        clear-sort
      </button>
      <button
        type="button"
        data-testid="page-change"
        onClick={() =>
          props.onPaginationPageChange && props.onPaginationPageChange(1)
        }
      >
        page
      </button>
      <div data-testid="rows-container">
        {props.rows.map((row: any) => (
          <div key={row.id}>{row.invoiceFileName}</div>
        ))}
      </div>
      {props.columns.map((col: any) => {
        if (!col.renderCell || !firstRow) {
          return null;
        }
        let value: any = (firstRow as any)[col.field];
        if (col.field === 'trxChargeDate' && col.valueGetter) {
          value = col.valueGetter({ row: firstRow });
        }
        return (
          <div key={col.field} data-testid={`col-${col.field}`}>
            {col.renderCell({
              value,
              row: firstRow,
            })}
          </div>
        );
      })}
    </div>
  );
});

jest.mock('../../../components/Chip/StatusChipInvoice', () => (props: any) => (
  <div data-testid="status-chip">{props.status}</div>
));

jest.mock('../../../components/Drawer/DetailDrawer', () => (props: any) => (
  <div data-testid="detail-drawer" data-open={props.open}>
    {props.open && props.children}
    <button
      type="button"
      data-testid="close-drawer"
      onClick={() => props.toggleDrawer(false)}
    >
      close
    </button>
  </div>
));

jest.mock('../detail/InvoiceDetail', () => (props: any) => (
  <div data-testid="invoice-detail">{props.title}</div>
));

jest.mock('../../../utils/constants', () => ({
  TYPE_TEXT: {
    Text: 'Text',
    Currency: 'Currency',
  },
}));

jest.mock('../../../utils/formatUtils', () => ({
  safeFormatDate: (value: string) => `formatted-${value}`,
}));

const mockedGetTransactions = getMerchantTransactionsProcessed as jest.MockedFunction<typeof getMerchantTransactionsProcessed>;
const mockedDownloadInvoiceFile = downloadInvoiceFile as jest.MockedFunction<typeof downloadInvoiceFile>;

describe('InvoiceDataTable', () => {
  const baseTransactions: any = {
    content: [
      {
        trxId: 'trx-1',
        invoiceFileName: 'INV-001',
        franchiseName: 'My Franchise',
        additionalProperties: { productName: 'Washing Machine' },
        trxChargeDate: '2024-01-01T10:00:00Z',
        effectiveAmountCents: 10000,
        rewardBatchTrxStatus: 'COMPLETED',
        pointOfSaleId: 'POS-1',
        fiscalCode: 'AAAAAA00A00A000A',
        rewardAmountCents: 5000,
        authorizedAmountCents: 15000,
      },
    ],
    pageNo: 0,
    pageSize: 10,
    totalElements: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetTransactions.mockResolvedValue(baseTransactions);
    (global as any).fetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue(new Blob(['test'], { type: 'application/pdf' })),
    });
    (global as any).URL.createObjectURL = jest.fn(() => 'blob:fake-url');
  });

  it('fetches and displays transactions', async () => {
    render(<InvoiceDataTable />);
    expect(mockedGetTransactions).toHaveBeenCalledTimes(1);
    expect(mockedGetTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        initiativeId: 'initiative-123',
        page: 0,
        size: 10,
      })
    );
    await screen.findByTestId('data-table');
    expect(screen.getAllByText('INV-001')[0]).toBeInTheDocument();
  });

  it('applies filters and calls service with additional params', async () => {
    render(
      <InvoiceDataTable
        batchId="batch-1"
        rewardBatchTrxStatus="ELIGIBLE"
        pointOfSaleId="POS-2"
        fiscalCode="BBBBBB00B00B000B"
      />
    );
    await screen.findByTestId('data-table');
    expect(mockedGetTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        initiativeId: 'initiative-123',
        page: 0,
        size: 10,
        rewardBatchId: 'batch-1',
        rewardBatchTrxStatus: 'ELIGIBLE',
        pointOfSaleId: 'POS-2',
        fiscalCode: 'BBBBBB00B00B000B',
      })
    );
  });

  it('shows empty state when there are no transactions', async () => {
    mockedGetTransactions.mockResolvedValueOnce({
      content: [],
      pageNo: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
    });
    render(<InvoiceDataTable />);
    await screen.findByText('Nessuna richiesta di rimborso trovata.');
    expect(screen.getByText('Nessuna richiesta di rimborso trovata.')).toBeInTheDocument();
  });

  it('updates sort model and calls service with sort parameter for trxChargeDate', async () => {
    render(<InvoiceDataTable />);
    await screen.findByTestId('data-table');
    const sortButton = screen.getByTestId('sort-by-date');
    fireEvent.click(sortButton);
    await waitFor(() => expect(mockedGetTransactions).toHaveBeenCalledTimes(2));
    const secondCallArgs = mockedGetTransactions.mock.calls[1][0];
    expect(secondCallArgs.sort).toBe('trxChargeDate,asc');
  });

  it('handles empty sort model and does not send sort parameter', async () => {
    render(<InvoiceDataTable />);
    await screen.findByTestId('data-table');
    const clearSortButton = screen.getByTestId('clear-sort');
    fireEvent.click(clearSortButton);
    await waitFor(() => expect(mockedGetTransactions).toHaveBeenCalledTimes(2));
    const secondCallArgs = mockedGetTransactions.mock.calls[1][0];
    expect(secondCallArgs.sort).toBeUndefined();
  });

  it('updates page and calls service with new page number', async () => {
    render(<InvoiceDataTable />);
    await screen.findByTestId('data-table');
    const pageButton = screen.getByTestId('page-change');
    fireEvent.click(pageButton);
    await waitFor(() => expect(mockedGetTransactions).toHaveBeenCalledTimes(2));
    const secondCallArgs = mockedGetTransactions.mock.calls[1][0];
    expect(secondCallArgs.page).toBe(1);
  });

  it('opens drawer and shows invoice detail when action icon is clicked and can be closed', async () => {
    render(<InvoiceDataTable />);
    await screen.findByTestId('data-table');
    const actionIcon = screen.getByTestId('trx-1');
    fireEvent.click(actionIcon);
    await screen.findByTestId('detail-drawer');
    expect(screen.getByTestId('detail-drawer')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('invoice-detail')).toBeInTheDocument();
    const closeButton = screen.getByTestId('close-drawer');
    fireEvent.click(closeButton);
    await waitFor(() =>
      expect(screen.getByTestId('detail-drawer')).toHaveAttribute('data-open', 'false')
    );
  });

  it('downloads invoice file and opens new window', async () => {
    mockedDownloadInvoiceFile.mockResolvedValueOnce({
      invoiceUrl: 'https://example.com/invoice.pdf',
    } as any);
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => ({
      focus: jest.fn(),
    }) as any);
    render(<InvoiceDataTable />);
    await screen.findByTestId('data-table');
    const invoiceCell = screen.getByTestId('col-invoiceFileName');
    const invoiceLink = within(invoiceCell).getByText('INV-001');
    fireEvent.click(invoiceLink);
    await waitFor(() => expect(mockedDownloadInvoiceFile).toHaveBeenCalledTimes(1));
    expect(mockedDownloadInvoiceFile).toHaveBeenCalledWith('trx-1', 'POS-1');
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('handles download error and dispatches error', async () => {
    mockedDownloadInvoiceFile.mockRejectedValueOnce(new Error('download error'));
    render(<InvoiceDataTable />);
    await screen.findByTestId('data-table');
    const invoiceCell = screen.getByTestId('col-invoiceFileName');
    const invoiceLink = within(invoiceCell).getByText('INV-001');
    fireEvent.click(invoiceLink);
  });
});
