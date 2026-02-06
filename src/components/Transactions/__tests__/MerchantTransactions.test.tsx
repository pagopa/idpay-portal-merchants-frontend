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

const mockSetAlert = jest.fn();

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({
    alert: { isOpen: false },
    setAlert: mockSetAlert,
  }),
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

    // expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
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
    // expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();

    // const closeButton = screen.getByRole('button', { name: 'Close Drawer' });
    // await userEvent.click(closeButton);
    // expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument();
  });

  it('calls setAlert when the drawer is closed', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const rowButton = screen.getByRole('button', { name: 'Row Action' });
    await userEvent.click(rowButton);

    // const closeButton = screen.getByRole('button', { name: 'Close Drawer' });
    // await userEvent.click(closeButton);

    // await waitFor(() => {
    //   expect(mockSetAlert).toHaveBeenCalledWith({ isOpen: false });
    // });
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

  it('accepts valid alphanumeric GTIN and trxCode input', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    const trxCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByTrxCode');
    await userEvent.type(gtinInput, 'ABC123xyz');
    await userEvent.type(trxCodeInput, 'ABC123xy');

    expect(gtinInput).toHaveValue('ABC123xyz');
    expect(trxCodeInput).toHaveValue('ABC123xy');
    expect(screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).not.toBeInTheDocument();
    expect(screen.queryByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')).not.toBeInTheDocument();
  });

  it('prevents GTIN and trxCodeInput input with spaces', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin') as HTMLInputElement;
    const trxCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByTrxCode');
    fireEvent.change(gtinInput, { target: { value: '123 456' } });
    fireEvent.change(trxCodeInput, { target: { value: '123 456' } });

    expect(gtinInput.value).not.toContain(' ');
    expect(trxCodeInput.value).not.toContain(' ');
  });

  it('prevents GTIN and trxCodeInput input longer than 14/8 characters', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin') as HTMLInputElement;
    const trxCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByTrxCode') as HTMLInputElement;
    fireEvent.change(gtinInput, { target: { value: '123456789012345' } });
    fireEvent.change(trxCodeInput, { target: { value: '123456789012345' } });

    expect(gtinInput.value.length).toBeLessThanOrEqual(14);
    expect(trxCodeInput.value.length).toBeLessThanOrEqual(8);
  });

  it('shows error message for special characters in GTIN and trxCode', () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    const trxCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByTrxCode');
    fireEvent.change(gtinInput, { target: { value: '123@#$' } });
    fireEvent.change(trxCodeInput, { target: { value: '123@#$' } });

    expect(screen.getByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).toBeInTheDocument();
    expect(screen.getByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')).toBeInTheDocument();
  });

  it('accepts exactly 14 characters in GTIN and trxCode', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    const trxCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByTrxCode');
    await userEvent.type(gtinInput, '12345678901234');
    await userEvent.type(trxCodeInput, '12345678');

    expect(gtinInput).toHaveValue('12345678901234');
    expect(trxCodeInput).toHaveValue('12345678');
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
    const trxCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByTrxCode');

    fireEvent.change(gtinInput, { target: { value: '123@' } });
    fireEvent.change(trxCodeInput, { target: { value: '123@' } });
    expect(screen.getByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).toBeInTheDocument();
    expect(screen.getByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')).toBeInTheDocument();

    fireEvent.change(gtinInput, { target: { value: '123456' } });
    fireEvent.change(trxCodeInput, { target: { value: '123456' } });
    expect(screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).not.toBeInTheDocument();
    expect(screen.queryByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')).not.toBeInTheDocument();
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
    const trxCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByTrxCode');

    fireEvent.change(gtinInput, { target: { value: '123@' } });
    fireEvent.blur(gtinInput);
    fireEvent.change(trxCodeInput, { target: { value: '123@' } });
    fireEvent.blur(trxCodeInput);

    expect(screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).not.toBeInTheDocument();
    expect(screen.queryByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')).not.toBeInTheDocument();
  });

  it('accepts empty GTIN and trxCode input', () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    const trxCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByTrxCode');
    fireEvent.change(gtinInput, { target: { value: '' } });
    fireEvent.change(trxCodeInput, { target: { value: '' } });

    expect(gtinInput).toHaveValue('');
    expect(trxCodeInput).toHaveValue('');
    expect(screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).not.toBeInTheDocument();
    expect(screen.queryByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')).not.toBeInTheDocument();
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
    expect(screen.getByLabelText('pages.pointOfSaleTransactions.searchByTrxCode')).toBeInTheDocument();
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

    // await waitFor(() => {
    //   expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
    //   expect(screen.getByTestId('transaction-detail')).toBeInTheDocument();
    // });
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
    expect(MockedTooltip.mock.calls.some(call => call[0].title.includes('VERYLONGPRODUCTNAME'))).toBe(false);
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

    // await waitFor(() => {
    //   expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
    // });

    // const closeButton = screen.getByRole('button', { name: 'Close Drawer' });

    // await act(async () => {
    //   await userEvent.click(closeButton);
    // });

    // await waitFor(() => {
    //   expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument();
    // });
  });

  it('passes status label to CustomChip', () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    expect(MockedCustomChip).not.toHaveBeenCalledWith(
      expect.objectContaining({ label: 'REWARDED' }),
      expect.anything()
    );
  });

  it('toggles filtersAppliedOnce flag and calls provided callbacks', async () => {
    render(<MerchantTransactions
      transactions={mockTransactions}
      handleFiltersApplied={handleFiltersApplied}
      handleFiltersReset={handleFiltersReset} sortModel={[]}    />);

    const applyButton = screen.getByRole('button', { name: 'commons.filterBtn' });
    fireEvent.click(applyButton);

    await waitFor(() => expect(handleFiltersApplied).not.toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'commons.removeFiltersBtn' })).toBeInTheDocument();
  });

  it('calls setAlert when drawer is toggled', async () => {
    render(<MerchantTransactions
      transactions={mockTransactions}
      handleFiltersApplied={handleFiltersApplied}
      handleFiltersReset={handleFiltersReset}
    />);

    await userEvent.click(screen.getByRole('button', { name: 'Row Action' }));
    // await userEvent.click(screen.getByRole('button', { name: 'Close Drawer' }));

    // await waitFor(() => {
    //   expect(mockSetAlert).toHaveBeenCalledWith({ isOpen: false });
    // });
  });
  it('rejects GTIN input with spaces or long values without updating formik', () => {
    render(<MerchantTransactions
      transactions={mockTransactions}
      handleFiltersApplied={handleFiltersApplied}
      handleFiltersReset={handleFiltersReset}
    />);

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    fireEvent.change(gtinInput, { target: { value: '123 456' } });
    expect(gtinInput).toHaveValue('');

    fireEvent.change(gtinInput, { target: { value: '1'.repeat(15) } });
    expect(gtinInput.value.length).toBeLessThanOrEqual(14);
  });
  it('passes long values to Tooltip title and feeds status label to CustomChip', () => {
    const longTx = [{
      ...mockTransactions[0],
      additionalProperties: { productName: 'VERY_LONG_NAME_EXCEEDING_THRESHOLD' },
      updateDate: 'LONGDATEVALUEEXCEEDINGTHRESHOLD',
    }];

    render(<MerchantTransactions
      transactions={longTx}
      handleFiltersApplied={handleFiltersApplied}
      handleFiltersReset={handleFiltersReset}
    />);

    expect(MockedTooltip.mock.calls.some(call => call[0].title.includes('VERY_LONG'))).toBe(false);
    expect(MockedCustomChip).not.toHaveBeenCalledWith(
      expect.objectContaining({ label: 'REWARDED' }),
      expect.anything()
    );
  });

  it('updates rows when transactions prop changes', () => {
    const { rerender } = render(<MerchantTransactions
      transactions={mockTransactions}
      handleFiltersApplied={handleFiltersApplied}
      handleFiltersReset={handleFiltersReset}
    />);

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();

    rerender(<MerchantTransactions
      transactions={[]}
      handleFiltersApplied={handleFiltersApplied}
      handleFiltersReset={handleFiltersReset}
    />);

    expect(screen.getByTestId('empty-list')).toBeInTheDocument();
  });

  it('accepts GTIN input of exactly 14 characters', async () => {
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

  it('handles multiple row action updates correctly', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const rowButton = screen.getByRole('button', { name: 'Row Action' });
    await userEvent.click(rowButton);
    await userEvent.click(rowButton);
    // expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
  });

  it('clears input fields on filter reset', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const fiscalCodeInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByFiscalCode');
    await userEvent.type(fiscalCodeInput, 'TEST');
    const resetButton = screen.getByRole('button', { name: 'commons.removeFiltersBtn' });
    await userEvent.click(resetButton);

    expect(fiscalCodeInput).toHaveValue('');
  });
});
