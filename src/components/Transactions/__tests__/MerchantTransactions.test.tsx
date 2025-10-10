import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MerchantTransactions from '../MerchantTransactions';
import { PointOfSaleTransactionProcessedDTO } from '../../../api/generated/merchants/PointOfSaleTransactionProcessedDTO';
import getStatus from '../useStatus';

// --- Mocks ---

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// FIX #1: Define the mock as a jest.fn()
jest.mock('../useStatus', () => jest.fn());
jest.mock('../useDetailList', () => () => []);
jest.mock('../../Chip/CustomChip', () => (props: any) => <div>{props.label}</div>);
jest.mock('../CurrencyColumn', () => (props: any) => <div>{props.value}</div>);
jest.mock('../../../pages/components/EmptyList', () => (props: any) => (
  <div data-testid="empty-list">{props.message}</div>
));
jest.mock('../TransactionDetail', () => (props: any) => (
  <div data-testid="transaction-detail">{props.title}</div>
));
jest.mock(
  '../TransactionDataTable',
  () =>
    ({ handleRowAction, onSortModelChange, onPaginationPageChange, rows }: any) =>
      (
        <div data-testid="transaction-data-table">
          <button onClick={() => handleRowAction(rows[0])}>Row Action</button>
          <button onClick={() => onSortModelChange([{ field: 'updateDate', sort: 'desc' }])}>
            Sort Action
          </button>
          <button onClick={() => onPaginationPageChange(2)}>Pagination Action</button>
        </div>
      )
);
jest.mock(
  '../../Drawer/DetailDrawer',
  () =>
    ({ open, toggleDrawer, children }: any) =>
      open ? (
        <div data-testid="detail-drawer">
          {children}
          <button onClick={() => toggleDrawer(false)}>Close Drawer</button>
        </div>
      ) : null
);

const mockedGetStatus = getStatus as jest.Mock;

const mockTransactions: Array<PointOfSaleTransactionProcessedDTO> = [
  {
    trxId: '1',
    updateDate: '2025-10-06T10:00:00Z',
    fiscalCode: 'AAAAAA00A00A000A',
    effectiveAmountCents: 5000,
    rewardAmountCents: 500,
    status: 'REWARDED',
    additionalProperties: { productName: 'Frigorifero' },
  },
];

describe('MerchantTransactions', () => {
  const handleFiltersApplied = jest.fn();
  const handleFiltersReset = jest.fn();
  const handleSortChange = jest.fn();
  const handlePaginationPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetStatus.mockImplementation((status) => ({ label: status }));
  });

  describe('when all props are provided', () => {
    test('renders data table when transactions exist', () => {
      render(
        <MerchantTransactions
          transactions={mockTransactions}
          handleFiltersApplied={handleFiltersApplied}
          handleFiltersReset={handleFiltersReset}
        />
      );
      expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
      expect(screen.queryByTestId('empty-list')).not.toBeInTheDocument();
    });

    test('renders empty list when no transactions exist', () => {
      render(
        <MerchantTransactions
          transactions={[]}
          handleFiltersApplied={handleFiltersApplied}
          handleFiltersReset={handleFiltersReset}
        />
      );
      expect(screen.getByTestId('empty-list')).toBeInTheDocument();
      expect(screen.queryByTestId('transaction-data-table')).not.toBeInTheDocument();
    });

    test('handles filter application and reset', async () => {
      render(
        <MerchantTransactions
          transactions={mockTransactions}
          handleFiltersApplied={handleFiltersApplied}
          handleFiltersReset={handleFiltersReset}
        />
      );

      const applyButton = screen.getByRole('button', { name: 'commons.filterBtn' });
      await userEvent.type(
        screen.getByLabelText('pages.pointOfSaleTransactions.searchByFiscalCode'),
        'test'
      );
      await userEvent.click(applyButton);
      expect(handleFiltersApplied).toHaveBeenCalled();

      const resetButton = screen.getByRole('button', { name: 'commons.removeFiltersBtn' });
      await userEvent.click(resetButton);
      expect(handleFiltersReset).toHaveBeenCalled();
    });

    test('handles data table interactions (sort, pagination, row click)', async () => {
      render(
        <MerchantTransactions
          transactions={mockTransactions}
          handleFiltersApplied={handleFiltersApplied}
          handleFiltersReset={handleFiltersReset}
          handleSortChange={handleSortChange}
          handlePaginationPageChange={handlePaginationPageChange}
        />
      );

      const sortButton = screen.getByRole('button', { name: 'Sort Action' });
      await userEvent.click(sortButton);
      expect(handleSortChange).toHaveBeenCalledWith([{ field: 'updateDate', sort: 'desc' }]);

      const paginationButton = screen.getByRole('button', { name: 'Pagination Action' });
      await userEvent.click(paginationButton);
      expect(handlePaginationPageChange).toHaveBeenCalledWith(2);

      const rowButton = screen.getByRole('button', { name: 'Row Action' });
      await userEvent.click(rowButton);
      expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();

      const closeDrawerButton = screen.getByRole('button', { name: 'Close Drawer' });
      await userEvent.click(closeDrawerButton);
      expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument();
    });
  });

  describe('when optional props are omitted', () => {
    test('does not throw error when sort and pagination are triggered', async () => {
      render(
        <MerchantTransactions
          transactions={mockTransactions}
          handleFiltersApplied={handleFiltersApplied}
          handleFiltersReset={handleFiltersReset}
        />
      );

      const sortButton = screen.getByRole('button', { name: 'Sort Action' });
      await userEvent.click(sortButton);
      expect(handleSortChange).not.toHaveBeenCalled();

      const paginationButton = screen.getByRole('button', { name: 'Pagination Action' });
      await userEvent.click(paginationButton);
      expect(handlePaginationPageChange).not.toHaveBeenCalled();
    });
  });

  test('should update form values on user input', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const fiscalCodeInput = screen.getByLabelText(
      'pages.pointOfSaleTransactions.searchByFiscalCode'
    );
    await userEvent.type(fiscalCodeInput, 'TESTCF');
    expect(fiscalCodeInput).toHaveValue('TESTCF');

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    await userEvent.type(gtinInput, '12345');
    expect(gtinInput).toHaveValue('12345');
  });

  describe('column render functions', () => {
    const StatusChip = ({ status }: any) => <div>{status}</div>;
    const CurrencyColumn = ({ value }: any) => <div>{value}</div>;
    const columns: any[] = [
      { valueGetter: (p: any) => p.row?.additionalProperties?.productName },
      {},
      {},
      { renderCell: (p: any) => <CurrencyColumn value={p.value / 100} /> },
      { renderCell: (p: any) => <CurrencyColumn value={p.value / 100} /> },
      { renderCell: (p: any) => <StatusChip status={getStatus(p.value)?.label} /> },
    ];

    test('valueGetter for "elettrodomestico" should return productName', () => {
      const valueGetter = columns[0].valueGetter;
      const params = { row: { additionalProperties: { productName: 'Test Product' } } };
      expect(valueGetter(params)).toBe('Test Product');
    });

    test('valueGetter for "elettrodomestico" should handle missing properties', () => {
      const valueGetter = columns[0].valueGetter;
      expect(valueGetter({ row: {} })).toBeUndefined();
      expect(valueGetter({ row: { additionalProperties: {} } })).toBeUndefined();
    });

    test('renderCell for currency columns should render correctly', () => {
      const effectiveAmountRender = columns[3].renderCell;
      const { getByText, rerender } = render(effectiveAmountRender({ value: 12345 }));
      expect(getByText('123.45')).toBeInTheDocument();

      const rewardAmountRender = columns[4].renderCell;
      rerender(rewardAmountRender({ value: 6789 }));
      expect(getByText('67.89')).toBeInTheDocument();
    });

    test('renderCell for status column should render StatusChip', () => {
      const statusRender = columns[5].renderCell;
      render(statusRender({ value: 'REWARDED' }));
      expect(screen.getByText('REWARDED')).toBeInTheDocument();
    });

    test('renderCell for status column should handle undefined status item', () => {
      mockedGetStatus.mockReturnValue(undefined);
      const statusRender = columns[5].renderCell;
      const { container } = render(statusRender({ value: 'UNKNOWN_STATUS' }));
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });
});
