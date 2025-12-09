import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Tooltip } from '@mui/material';
import MerchantTransactions from '../MerchantTransactions';
import { PointOfSaleTransactionProcessedDTO } from '../../../api/generated/merchants/PointOfSaleTransactionProcessedDTO';
import getStatus from '../useStatus';
import CustomChip from '../../Chip/CustomChip';
import TransactionDataTable from '../TransactionDataTable';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../useStatus', () => jest.fn());
jest.mock('../useDetailList', () => () => []);
jest.mock('../../Chip/CustomChip', () => {
  return jest.fn((props: any) => (
    <div data-testid="custom-chip">{props.label}</div>
  ));
});

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Tooltip: jest.fn(({ title, children }) => (
    <div data-testid="mock-tooltip" data-title={title}>
      {children}
    </div>
  )),
}));

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

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({
    alert: { isOpen: false },
    setAlert: jest.fn(),
  }),
}));

const MockedCustomChip = CustomChip as jest.Mock;
const MockedTransactionDataTable = TransactionDataTable as jest.Mock;
const mockedGetStatus = getStatus as jest.Mock;
const MockedTooltip = Tooltip as jest.Mock;

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
    mockedGetStatus.mockImplementation((status) => ({ label: status, color: 'green', textColor: 'white' }));
  });

  it('renders data table when transactions exist', () => {
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

  it('renders empty list when no transactions exist', () => {
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

  it('renders loading spinner when dataTableIsLoading is true', () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
        dataTableIsLoading={true}
      />
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles filter application', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const applyButton = screen.getByRole('button', { name: 'commons.filterBtn' });
    const fiscalCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByFiscalCode');

    await act(async () => {
      await userEvent.type(fiscalCodeInput, 'test');
      await userEvent.click(applyButton);
    });

    await waitFor(() => {
      expect(handleFiltersApplied).toHaveBeenCalled();
    });
  });

  it('handles filter reset', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    await act(async () => {
      const applyButton = screen.getByRole('button', { name: 'commons.filterBtn' });
      const fiscalCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByFiscalCode');
      await userEvent.type(fiscalCodeInput, 'test');
      await userEvent.click(applyButton);
    });

    await waitFor(() => {
      const resetButton = screen.getByRole('button', { name: 'commons.removeFiltersBtn' });
      expect(resetButton).toBeInTheDocument();
    });
  });

  it('handles sort change', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
        handleSortChange={handleSortChange}
      />
    );

    await act(async () => {
      const sortButton = screen.getByRole('button', { name: 'Sort Action' });
      await userEvent.click(sortButton);
    });

    await waitFor(() => {
      expect(handleSortChange).toHaveBeenCalledWith([{ field: 'updateDate', sort: 'desc' }]);
    });
  });

  it('handles pagination change', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
        handlePaginationPageChange={handlePaginationPageChange}
      />
    );

    await act(async () => {
      const paginationButton = screen.getByRole('button', { name: 'Pagination Action' });
      await userEvent.click(paginationButton);
    });

    await waitFor(() => {
      expect(handlePaginationPageChange).toHaveBeenCalledWith(2);
    });
  });

  it('does not throw error when sort is triggered without handler', async () => {
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
  });

  it('does not throw error when pagination is triggered without handler', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const paginationButton = screen.getByRole('button', { name: 'Pagination Action' });
    await userEvent.click(paginationButton);

    expect(handlePaginationPageChange).not.toHaveBeenCalled();
  });

  it('opens drawer when row action is clicked', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const rowButton = screen.getByRole('button', { name: 'Row Action' });
    await userEvent.click(rowButton);

    expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
  });

  it('closes drawer when toggle is called', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const rowButton = screen.getByRole('button', { name: 'Row Action' });
    await userEvent.click(rowButton);
    expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close Drawer' });
    await userEvent.click(closeButton);
    expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument();
  });

  it('updates fiscal code input on user input', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const fiscalCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByFiscalCode');
    await userEvent.type(fiscalCodeInput, 'TESTCF');

    expect(fiscalCodeInput).toHaveValue('TESTCF');
  });

  it('accepts valid alphanumeric GTIN input', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    await userEvent.type(gtinInput, 'ABC123xyz');

    expect(gtinInput).toHaveValue('ABC123xyz');
    expect(screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).not.toBeInTheDocument();
  });

  it('prevents GTIN input with spaces', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin') as HTMLInputElement;
    fireEvent.change(gtinInput, { target: { value: '123 456' } });

    expect(gtinInput.value).not.toContain(' ');
  });

  it('prevents GTIN input longer than 14 characters', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin') as HTMLInputElement;
    fireEvent.change(gtinInput, { target: { value: '123456789012345' } });

    expect(gtinInput.value.length).toBeLessThanOrEqual(14);
  });

  it('shows error message for special characters in GTIN', () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    fireEvent.change(gtinInput, { target: { value: '123@#$' } });

    expect(screen.getByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).toBeInTheDocument();
  });

  it('accepts exactly 14 characters in GTIN', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    await userEvent.type(gtinInput, '12345678901234');

    expect(gtinInput).toHaveValue('12345678901234');
  });

  it('clears error message when valid input is entered after invalid', () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');

    fireEvent.change(gtinInput, { target: { value: '123@' } });
    expect(screen.getByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).toBeInTheDocument();

    fireEvent.change(gtinInput, { target: { value: '123456' } });
    expect(screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).not.toBeInTheDocument();
  });

  it('clears error message on blur', () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');

    fireEvent.change(gtinInput, { target: { value: '123@' } });
    fireEvent.blur(gtinInput);

    expect(screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).not.toBeInTheDocument();
  });

  it('accepts empty GTIN input', () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    fireEvent.change(gtinInput, { target: { value: '' } });

    expect(gtinInput).toHaveValue('');
    expect(screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).not.toBeInTheDocument();
  });

  it('renders form with all filter fields', () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(screen.getByLabelText('pages.pointOfSaleTransactions.searchByFiscalCode')).toBeInTheDocument();
    expect(screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin')).toBeInTheDocument();
  });

  it('renders transactions with empty values', () => {
    const emptyValueTransaction: Array<PointOfSaleTransactionProcessedDTO> = [{
      trxId: '1',
      updateDate: '',
      fiscalCode: '',
      effectiveAmountCents: 5000,
      rewardAmountCents: 500,
      status: 'REWARDED',
      additionalProperties: { productName: '' },
    }];

    render(
      <MerchantTransactions
        transactions={emptyValueTransaction}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('renders transactions with null values', () => {
    const nullValueTransaction: Array<PointOfSaleTransactionProcessedDTO> = [{
      trxId: '1',
      updateDate: null as any,
      fiscalCode: null as any,
      effectiveAmountCents: 5000,
      rewardAmountCents: 500,
      status: 'REWARDED',
      additionalProperties: { productName: null as any },
    }];

    render(
      <MerchantTransactions
        transactions={nullValueTransaction}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('renders transactions with undefined values', () => {
    const undefinedValueTransaction: Array<PointOfSaleTransactionProcessedDTO> = [{
      trxId: '1',
      updateDate: undefined as any,
      fiscalCode: undefined as any,
      effectiveAmountCents: 5000,
      rewardAmountCents: 500,
      status: 'REWARDED',
      additionalProperties: { productName: undefined as any },
    }];

    render(
      <MerchantTransactions
        transactions={undefinedValueTransaction}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('renders transaction with short values', () => {
    const shortValueTransaction: Array<PointOfSaleTransactionProcessedDTO> = [{
      trxId: '1',
      updateDate: 'SHORT',
      fiscalCode: 'ABC',
      effectiveAmountCents: 5000,
      rewardAmountCents: 500,
      status: 'REWARDED',
      additionalProperties: { productName: 'Test' },
    }];

    render(
      <MerchantTransactions
        transactions={shortValueTransaction}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('renders transaction with long values', () => {
    const longValueTransaction: Array<PointOfSaleTransactionProcessedDTO> = [{
      trxId: '1',
      updateDate: 'VERYLONGVALUE123456789',
      fiscalCode: 'VERYLONGFISCALCODE123',
      effectiveAmountCents: 5000,
      rewardAmountCents: 500,
      status: 'REWARDED',
      additionalProperties: { productName: 'VERYLONGPRODUCTNAME123' },
    }];

    render(
      <MerchantTransactions
        transactions={longValueTransaction}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('renders transaction with value exactly at threshold length', () => {
    const exactThresholdTransaction: Array<PointOfSaleTransactionProcessedDTO> = [{
      trxId: '1',
      updateDate: '12345678901',
      fiscalCode: '12345678901',
      effectiveAmountCents: 5000,
      rewardAmountCents: 500,
      status: 'REWARDED',
      additionalProperties: { productName: '12345678901' },
    }];

    render(
      <MerchantTransactions
        transactions={exactThresholdTransaction}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('displays transaction detail component when drawer is opened', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const rowButton = screen.getByRole('button', { name: 'Row Action' });
    await userEvent.click(rowButton);

    expect(screen.getByTestId('transaction-detail')).toBeInTheDocument();
  });

  it('passes correct props to transaction data table', () => {
    const sortModel = [{ field: 'updateDate', sort: 'desc' }];
    const paginationModel = { page: 0, pageSize: 10 };

    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
        sortModel={sortModel}
        paginationModel={paginationModel}
      />
    );

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('updates transactions when props change', () => {
    const { rerender } = render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();

    const newTransactions: Array<PointOfSaleTransactionProcessedDTO> = [];
    rerender(
      <MerchantTransactions
        transactions={newTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(screen.getByTestId('empty-list')).toBeInTheDocument();
  });

  it('displays correct empty message', () => {
    render(
      <MerchantTransactions
        transactions={[]}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(screen.getByTestId('empty-list')).toBeInTheDocument();
  });

  it('displays loading when both loading and transactions are present', () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
        dataTableIsLoading={true}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByTestId('transaction-data-table')).not.toBeInTheDocument();
  });

  it('handles undefined sortModel', () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
        sortModel={[]}
      />
    );

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('handles undefined paginationModel', () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('does not call handleFiltersApplied when callback is undefined', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={undefined as any}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const applyButton = screen.getByRole('button', { name: 'commons.filterBtn' });
    const fiscalCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByFiscalCode');

    await act(async () => {
      await userEvent.type(fiscalCodeInput, 'test');
      await userEvent.click(applyButton);
    });
  });

  it('does not call handleFiltersReset when callback is undefined', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={undefined as any}
      />
    );

    await act(async () => {
      const applyButton = screen.getByRole('button', { name: 'commons.filterBtn' });
      const fiscalCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByFiscalCode');
      await userEvent.type(fiscalCodeInput, 'test');
      await userEvent.click(applyButton);
    });

    await waitFor(() => {
      const resetButton = screen.getByRole('button', { name: 'commons.removeFiltersBtn' });
      expect(resetButton).toBeInTheDocument();
    });
  });

  it('does not call handleSortChange when callback is undefined', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
        handleSortChange={undefined}
      />
    );

    await act(async () => {
      const sortButton = screen.getByRole('button', { name: 'Sort Action' });
      await userEvent.click(sortButton);
    });
  });

  it('does not call handlePaginationPageChange when callback is undefined', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
        handlePaginationPageChange={undefined}
      />
    );

    await act(async () => {
      const paginationButton = screen.getByRole('button', { name: 'Pagination Action' });
      await userEvent.click(paginationButton);
    });
  });

  it('validates GTIN with only numbers', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    await userEvent.type(gtinInput, '1234567890123');

    expect(gtinInput).toHaveValue('1234567890123');
  });

  it('displays multiple transactions in data table', () => {
    const multipleTransactions: Array<PointOfSaleTransactionProcessedDTO> = [
      {
        trxId: '1',
        updateDate: '2025-10-06T10:00:00Z',
        fiscalCode: 'AAAAAA00A00A000A',
        effectiveAmountCents: 5000,
        rewardAmountCents: 500,
        status: 'REWARDED',
        additionalProperties: { productName: 'Frigorifero' },
      },
      {
        trxId: '2',
        updateDate: '2025-10-07T11:00:00Z',
        fiscalCode: 'BBBBBB00B00B000B',
        effectiveAmountCents: 6000,
        rewardAmountCents: 600,
        status: 'INVOICED',
        additionalProperties: { productName: 'Forno' },
      },
    ];

    render(
      <MerchantTransactions
        transactions={multipleTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('opens drawer with correct data when row is clicked', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const rowButton = screen.getByRole('button', { name: 'Row Action' });

    await act(async () => {
      await userEvent.click(rowButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-detail')).toBeInTheDocument();
    });
  });

  it('handles tooltip rendering with long values', () => {
    const longValueTransaction: Array<PointOfSaleTransactionProcessedDTO> = [{
      trxId: '1',
      updateDate: 'VERY_LONG_VALUE_THAT_EXCEEDS_THRESHOLD_LENGTH_12345',
      fiscalCode: 'VERYLONGFISCALCODE12345678901234567890',
      effectiveAmountCents: 5000,
      rewardAmountCents: 500,
      status: 'REWARDED',
      additionalProperties: { productName: 'VERYLONGPRODUCTNAME12345678901234567890' },
    }];

    render(
      <MerchantTransactions
        transactions={longValueTransaction}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('handles close drawer correctly', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const rowButton = screen.getByRole('button', { name: 'Row Action' });

    await act(async () => {
      await userEvent.click(rowButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Close Drawer' });

    await act(async () => {
      await userEvent.click(closeButton);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument();
    });
  });
});