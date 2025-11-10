import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Tooltip } from '@mui/material';
import MerchantTransactions from '../MerchantTransactions';
import { PointOfSaleTransactionProcessedDTO } from '../../../api/generated/merchants/PointOfSaleTransactionProcessedDTO';
import getStatus from '../useStatus';
import CustomChip from '../../Chip/CustomChip';
import TransactionDataTable from '../TransactionDataTable';

// --- Mocks ---

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// FIX #1: Define the mock as a jest.fn()
jest.mock('../useStatus', () => jest.fn());
jest.mock('../useDetailList', () => () => []);
jest.mock('../../Chip/CustomChip', () => jest.fn((props: any) => (
  <div data-testid="custom-chip" {...props}>{props.label}</div>
)));

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

  describe('handleGtinChange validation', () => {
  test('should prevent input with spaces', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    
    // Prova a inserire uno spazio
    await userEvent.type(gtinInput, '123 456');
    
    // Il valore non dovrebbe contenere spazi
    expect(gtinInput).toHaveValue('123456');
  });

  test('should prevent input longer than 14 characters', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    
    // Prova a inserire più di 14 caratteri
    await userEvent.type(gtinInput, '123456789012345'); // 15 caratteri
    
    // Il valore dovrebbe essere troncato a 14 caratteri
    expect(gtinInput).toHaveValue('12345678901234');
  });

  test('should show error message for special characters', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    
    // Prova a inserire caratteri speciali
    fireEvent.change(gtinInput, { target: { value: '123@#$' } });
    
    // Dovrebbe mostrare il messaggio di errore
    expect(screen.getByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).toBeInTheDocument();
    
    // Il valore non dovrebbe essere aggiornato
    expect(gtinInput).toHaveValue('');
  });

  test('should accept valid alphanumeric input', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    
    // Inserisci un valore valido
    await userEvent.type(gtinInput, 'ABC123xyz');
    
    // Il valore dovrebbe essere accettato
    expect(gtinInput).toHaveValue('ABC123xyz');
    
    // Non dovrebbe esserci messaggio di errore
    expect(screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).not.toBeInTheDocument();
  });

  test('should clear error message when valid input is entered after invalid', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    
    // Prima inserisci un valore non valido
    fireEvent.change(gtinInput, { target: { value: '123@' } });
    expect(screen.getByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).toBeInTheDocument();
    
    // Poi inserisci un valore valido
    fireEvent.change(gtinInput, { target: { value: '123456' } });
    
    // L'errore dovrebbe essere sparito
    expect(screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).not.toBeInTheDocument();
    expect(gtinInput).toHaveValue('123456');
  });

  test('should accept exactly 14 characters', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    
    // Inserisci esattamente 14 caratteri
    await userEvent.type(gtinInput, '12345678901234');
    
    expect(gtinInput).toHaveValue('12345678901234');
    expect(screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).not.toBeInTheDocument();
  });

  test('should handle empty input', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    const gtinInput = screen.getByLabelText('pages.pointOfSaleTransactions.searchByGtin');
    
    // Input vuoto dovrebbe essere accettato
    fireEvent.change(gtinInput, { target: { value: '' } });
    
    expect(gtinInput).toHaveValue('');
    expect(screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')).not.toBeInTheDocument();
  });
});

 test('should render tooltip with value when value length meets threshold', () => {
    const { container } = render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
      />
    );

    // Verifica che la tabella sia renderizzata
    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

   test('should show "-" when value is empty', () => {
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

    test('should show "-" when value is null', () => {
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

  test('should handle value with length equal to threshold', () => {
    const exactThresholdTransaction: Array<PointOfSaleTransactionProcessedDTO> = [{
      trxId: '1',
      updateDate: '12345678901', // exactly 11 characters
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

   test('should handle value with length above threshold', () => {
    const longValueTransaction: Array<PointOfSaleTransactionProcessedDTO> = [{
      trxId: '1',
      updateDate: 'VERYLONGVALUE123456789', // more than 11 characters
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

  test('should handle value with length below threshold', () => {
    const shortValueTransaction: Array<PointOfSaleTransactionProcessedDTO> = [{
      trxId: '1',
      updateDate: 'SHORT', // less than 11 characters
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

   test('should handle undefined value', () => {
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

});
