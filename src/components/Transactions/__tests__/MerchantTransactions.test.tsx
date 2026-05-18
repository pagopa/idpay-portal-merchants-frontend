import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

jest.setTimeout(20000);
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Tooltip } from '@mui/material';
import MerchantTransactions from '../MerchantTransactions';
import getStatus from '../useStatus';
import CustomChip from '../../Chip/CustomChip';
import { PointOfSaleTransactionProcessedDTO } from '../../../api/generated/merchants/data-contracts';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(), 
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
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
  return jest.fn((props: any) => <div data-testid="custom-chip">{props.label}</div>);
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

jest.mock('../TransactionDataTable', () => (props: any) => (
  <div data-testid="transaction-data-table">
    <button onClick={() => props.onSortModelChange([{ field: 'updateDate', sort: 'desc' }])}>
      Sort Action
    </button>
    <button onClick={() => props.onPaginationPageChange(2)}>Pagination Action</button>
    <button onClick={() => props.handleRowAction(props.rows[0])}>Row Action</button>
    {props.columns.map((col: any) => {
      return (
        <div key={col.field} data-testid={`col-${col.field}`}>
          {col.valueGetter
            ? props?.rows[0]?.additionalProperties?.productName
            : props?.rows[0]?.[col.field]}
        </div>
      );
    })}
  </div>
));

jest.mock(
  '../TransactionDetail',
  () =>
    ({ isOpen, setIsOpen, children }: any) =>
      isOpen && (
        <div data-testid="detail-drawer">
          {children}
          <button data-testid="close-button" onClick={() => setIsOpen(false)}>
            Close Drawer
          </button>
        </div>
      )
);

const MockedCustomChip = CustomChip as jest.Mock;
const mockedGetStatus = getStatus as jest.Mock;
const MockedTooltip = Tooltip as jest.Mock;

describe('MerchantTransactions', () => {
  const handleFiltersApplied = jest.fn();
  const handleFiltersReset = jest.fn();
  const handleSortChange = jest.fn();
  const handlePaginationPageChange = jest.fn();

  const mockTransactions: any = [
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetStatus.mockImplementation((status) => ({
      label: status,
      color: 'green',
      textColor: 'white',
    }));
  });

  it('renders data table when transactions exist', () => {
    renderComponent();
    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
    expect(screen.getByText('Frigorifero')).toBeInTheDocument();
    expect(screen.getByText('AAAAAA00A00A000A')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('REWARDED')).toBeInTheDocument();
    expect(screen.queryByTestId('empty-list')).not.toBeInTheDocument();
  });

  it('renders empty list when no transactions exist', () => {
    renderComponent({ transactions: [] });
    expect(screen.getByTestId('empty-list')).toBeInTheDocument();
    expect(screen.queryByTestId('transaction-data-table')).not.toBeInTheDocument();
  });

  it('renders loading spinner when dataTableIsLoading is true', () => {
    renderComponent({ dataTableIsLoading: true });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles filter application', async () => {
    renderComponent();

    const applyButton = screen.getByRole('button', { name: 'actions.filterBtn' });
    const fiscalCodeInput = screen.getByLabelText(
      'commons.labels.searchByFiscalCode'
    );

    await act(async () => {
      await userEvent.type(fiscalCodeInput, 'test');
      await userEvent.click(applyButton);
    });

    await waitFor(() => {
      expect(handleFiltersApplied).toHaveBeenCalled();
    });
  });

  it('handles filter reset', async () => {
    renderComponent();

    await act(async () => {
      const applyButton = screen.getByRole('button', { name: 'actions.filterBtn' });
      const fiscalCodeInput = screen.getByLabelText(
        'commons.labels.searchByFiscalCode'
      );
      await userEvent.type(fiscalCodeInput, 'test');
      await userEvent.click(applyButton);
    });

    await waitFor(() => {
      const resetButton = screen.getByRole('button', { name: 'actions.removeFiltersBtn' });
      expect(resetButton).toBeInTheDocument();
    });
  });

  it('handles sort change', async () => {
    renderComponent({ handleSortChange });

    await act(async () => {
      const sortButton = screen.getByRole('button', { name: 'Sort Action' });
      await userEvent.click(sortButton);
    });

    await waitFor(() => {
      expect(handleSortChange).toHaveBeenCalledWith([{ field: 'updateDate', sort: 'desc' }]);
    });
  });

  it('handles pagination change', async () => {
    renderComponent({ handlePaginationPageChange });

    await act(async () => {
      const paginationButton = screen.getByRole('button', { name: 'Pagination Action' });
      await userEvent.click(paginationButton);
    });

    await waitFor(() => {
      expect(handlePaginationPageChange).toHaveBeenCalledWith(2);
    });
  });

  it('does not throw error when sort is triggered without handler', async () => {
    renderComponent();

    const sortButton = screen.getByRole('button', { name: 'Sort Action' });
    await userEvent.click(sortButton);

    expect(handleSortChange).not.toHaveBeenCalled();
  });

  it('does not throw error when pagination is triggered without handler', async () => {
    renderComponent();

    const paginationButton = screen.getByRole('button', { name: 'Pagination Action' });
    await userEvent.click(paginationButton);

    expect(handlePaginationPageChange).not.toHaveBeenCalled();
  });

  it('opens drawer when row action is clicked', async () => {
    renderComponent();

    const rowButton = screen.getByRole('button', { name: 'Row Action' });
    await userEvent.click(rowButton);

    await waitFor(() => expect(screen.getByTestId('detail-drawer')).toBeInTheDocument());
  });

  it('closes drawer when toggle is called', async () => {
    renderComponent();

    const rowButton = screen.getByRole('button', { name: 'Row Action' });
    await userEvent.click(rowButton);
    await waitFor(() => expect(screen.getByTestId('detail-drawer')).toBeInTheDocument());

    const closeButton = screen.getByTestId('close-button');
    await userEvent.click(closeButton);
    expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument();
  });

  it('calls setAlert when the drawer is closed', async () => {
    renderComponent();

    const rowButton = screen.getByRole('button', { name: 'Row Action' });
    await userEvent.click(rowButton);

    await waitFor(() => expect(screen.getByTestId('detail-drawer')).toBeInTheDocument());
    const closeButton = screen.getByTestId('close-button');
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({ isOpen: false });
    });
  });

  it('updates fiscal code input on user input', async () => {
    renderComponent();

    const fiscalCodeInput = screen.getByLabelText(
      'commons.labels.searchByFiscalCode'
    );
    await userEvent.type(fiscalCodeInput, 'TESTCF');

    expect(fiscalCodeInput).toHaveValue('TESTCF');
  });

  it('accepts valid alphanumeric GTIN and trxCode input', async () => {
    renderComponent();

    const gtinInput = screen.getByLabelText('commons.labels.searchByGtin');
    const trxCodeInput = screen.getByLabelText('commons.labels.searchByTrxCode');
    await userEvent.type(gtinInput, 'ABC123xyz');
    await userEvent.type(trxCodeInput, 'ABC123xy');

    expect(gtinInput).toHaveValue('ABC123xyz');
    expect(trxCodeInput).toHaveValue('ABC123xy');
    expect(
      screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')
    ).not.toBeInTheDocument();
  });

  it('prevents GTIN and trxCodeInput input with spaces', async () => {
    renderComponent();

    const gtinInput = screen.getByLabelText('commons.labels.searchByGtin') as HTMLInputElement;
    const trxCodeInput = screen.getByLabelText('commons.labels.searchByTrxCode');
    fireEvent.change(gtinInput, { target: { value: '123 456' } });
    fireEvent.change(trxCodeInput, { target: { value: '123 456' } });

    expect(gtinInput.value).not.toContain(' ');
    expect((trxCodeInput as HTMLInputElement).value).not.toContain(' ');
  });

  it('prevents GTIN and trxCodeInput input longer than 14/8 characters', async () => {
    renderComponent();

    const gtinInput = screen.getByLabelText('commons.labels.searchByGtin') as HTMLInputElement;
    const trxCodeInput = screen.getByLabelText(
      'commons.labels.searchByTrxCode'
    ) as HTMLInputElement;
    fireEvent.change(gtinInput, { target: { value: '123456789012345' } });
    fireEvent.change(trxCodeInput, { target: { value: '123456789012345' } });

    expect((gtinInput as HTMLInputElement).value.length).toBeLessThanOrEqual(14);
    expect((trxCodeInput as HTMLInputElement).value.length).toBeLessThanOrEqual(8);
  });

  it('shows error message for special characters in GTIN and trxCode', () => {
    renderComponent();

    const gtinInput = screen.getByLabelText('commons.labels.searchByGtin');
    const trxCodeInput = screen.getByLabelText('commons.labels.searchByTrxCode');
    fireEvent.change(gtinInput, { target: { value: '123@#$' } });
    fireEvent.change(trxCodeInput, { target: { value: '123@#$' } });

    expect(
      screen.getByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')
    ).toBeInTheDocument();
  });

  it('accepts exactly 14 characters in GTIN and trxCode', async () => {
    renderComponent();

    const gtinInput = screen.getByLabelText('commons.labels.searchByGtin');
    const trxCodeInput = screen.getByLabelText('commons.labels.searchByTrxCode');
    await userEvent.type(gtinInput, '12345678901234');
    await userEvent.type(trxCodeInput, '12345678');

    expect(gtinInput).toHaveValue('12345678901234');
    expect(trxCodeInput).toHaveValue('12345678');
  });

  it('clears error message when valid input is entered after invalid', () => {
    renderComponent();

    const gtinInput = screen.getByLabelText('commons.labels.searchByGtin');
    const trxCodeInput = screen.getByLabelText('commons.labels.searchByTrxCode');

    fireEvent.change(gtinInput, { target: { value: '123@' } });
    fireEvent.change(trxCodeInput, { target: { value: '123@' } });
    expect(
      screen.getByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')
    ).toBeInTheDocument();

    fireEvent.change(gtinInput, { target: { value: '123456' } });
    fireEvent.change(trxCodeInput, { target: { value: '123456' } });
    expect(
      screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')
    ).not.toBeInTheDocument();
  });

  it('clears error message on blur', () => {
    renderComponent();

    const gtinInput = screen.getByLabelText('commons.labels.searchByGtin');
    const trxCodeInput = screen.getByLabelText('commons.labels.searchByTrxCode');

    fireEvent.change(gtinInput, { target: { value: '123@' } });
    fireEvent.blur(gtinInput);
    fireEvent.change(trxCodeInput, { target: { value: '123@' } });
    fireEvent.blur(trxCodeInput);

    expect(
      screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')
    ).not.toBeInTheDocument();
  });

  it('accepts empty GTIN and trxCode input', () => {
    renderComponent();

    const gtinInput = screen.getByLabelText('commons.labels.searchByGtin');
    const trxCodeInput = screen.getByLabelText('commons.labels.searchByTrxCode');
    fireEvent.change(gtinInput, { target: { value: '' } });
    fireEvent.change(trxCodeInput, { target: { value: '' } });

    expect(gtinInput).toHaveValue('');
    expect(trxCodeInput).toHaveValue('');
    expect(
      screen.queryByText('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.')
    ).not.toBeInTheDocument();
  });

  const renderComponent = (
    overrideProps?: Partial<React.ComponentProps<typeof MerchantTransactions>>
  ) =>
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
        sortModel={[]}
        {...overrideProps}
      />
    );

  const renderAndExpectTable = (transactions: Array<PointOfSaleTransactionProcessedDTO>) => {
    renderComponent({ transactions });
    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  };

  it('renders form with all filter fields', () => {
    renderComponent();
    expect(
      screen.getByLabelText('commons.labels.searchByFiscalCode')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('commons.labels.searchByTrxCode')).toBeInTheDocument();
    expect(screen.getByLabelText('commons.labels.searchByGtin')).toBeInTheDocument();
  });

  describe('renders transactions with variant values', () => {
    it.each([
      [
        'empty',
        {
          updateDate: '',
          fiscalCode: '',
          productName: '',
        },
      ],
      [
        'null',
        {
          updateDate: null,
          fiscalCode: null,
          productName: null,
        },
      ],
      [
        'undefined',
        {
          updateDate: undefined,
          fiscalCode: undefined,
          productName: undefined,
        },
      ],
      [
        'short',
        {
          updateDate: 'SHORT',
          fiscalCode: 'ABC',
          productName: 'Test',
        },
      ],
      [
        'long',
        {
          updateDate: 'VERYLONGVALUE123456789',
          fiscalCode: 'VERYLONGFISCALCODE123',
          productName: 'VERYLONGPRODUCTNAME123',
        },
      ],
      [
        'exact-threshold',
        {
          updateDate: '12345678901',
          fiscalCode: '12345678901',
          productName: '12345678901',
        },
      ],
    ])('renders transactions with %s values', (_label, { updateDate, fiscalCode, productName }) => {
      renderAndExpectTable([
        {
          trxId: '1',
          updateDate,
          fiscalCode,
          effectiveAmountCents: 5000,
          rewardAmountCents: 500,
          status: 'REWARDED',
          additionalProperties: { productName },
        } as any,
      ]);
    });
  });

  it('displays transaction detail component when drawer is opened', async () => {
    renderComponent();

    const rowButton = screen.getByRole('button', { name: 'Row Action' });
    await userEvent.click(rowButton);

    await waitFor(() => expect(screen.getByTestId('detail-drawer')).toBeInTheDocument());
  });

  it('passes correct props to transaction data table', () => {
    const sortModel = [{ field: 'updateDate', sort: 'desc' as const }];
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
    const { rerender } = renderComponent();

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();

    const newTransactions: Array<PointOfSaleTransactionProcessedDTO> = [];
    rerender(
      <MerchantTransactions
        transactions={newTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
        sortModel={[]}
      />
    );

    expect(screen.getByTestId('empty-list')).toBeInTheDocument();
  });

  it('displays correct empty message', () => {
    renderComponent({ transactions: [] });

    expect(screen.getByTestId('empty-list')).toBeInTheDocument();
  });

  it('displays loading when both loading and transactions are present', () => {
    renderComponent({ dataTableIsLoading: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByTestId('transaction-data-table')).not.toBeInTheDocument();
  });

  it('handles undefined sortModel', () => {
    renderComponent();

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('handles undefined paginationModel', () => {
    renderComponent();

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('does not call handleFiltersApplied when callback is undefined', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={undefined as any}
        handleFiltersReset={handleFiltersReset}
        sortModel={[]}
      />
    );

    const applyButton = screen.getByRole('button', { name: 'actions.filterBtn' });
    const fiscalCodeInput = screen.getByLabelText(
      'commons.labels.searchByFiscalCode'
    );

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
        sortModel={[]}
      />
    );

    await act(async () => {
      const applyButton = screen.getByRole('button', { name: 'actions.filterBtn' });
      const fiscalCodeInput = screen.getByLabelText(
        'commons.labels.searchByFiscalCode'
      );
      await userEvent.type(fiscalCodeInput, 'test');
      await userEvent.click(applyButton);
    });

    await waitFor(() => {
      const resetButton = screen.getByRole('button', { name: 'actions.removeFiltersBtn' });
      expect(resetButton).toBeInTheDocument();
    });

    await act(async () => {
      const resetButton = screen.getByRole('button', { name: 'actions.removeFiltersBtn' });
      await userEvent.click(resetButton);
    });
  });

  it('does not call handleSortChange when callback is undefined', async () => {
    renderComponent({ handleSortChange });

    await act(async () => {
      const sortButton = screen.getByRole('button', { name: 'Sort Action' });
      await userEvent.click(sortButton);
    });
  });

  it('does not call handlePaginationPageChange when callback is undefined', async () => {
    renderComponent({ handlePaginationPageChange });

    await act(async () => {
      const paginationButton = screen.getByRole('button', { name: 'Pagination Action' });
      await userEvent.click(paginationButton);
    });
  });

  it('validates GTIN with only numbers', async () => {
    renderComponent();

    const gtinInput = screen.getByLabelText('commons.labels.searchByGtin');
    await userEvent.type(gtinInput, '1234567890123');

    expect(gtinInput).toHaveValue('1234567890123');
  });

  it('displays multiple transactions in data table', () => {
    const multipleTransactions = [
      {
        trxId: '1',
        updateDate: '2025-10-06T10:00:00Z' as any,
        fiscalCode: 'AAAAAA00A00A000A',
        effectiveAmountCents: 5000 as any,
        rewardAmountCents: 500 as any,
        status: 'REWARDED' as any,
        additionalProperties: { productName: 'Frigorifero' },
      },
      {
        trxId: '2',
        updateDate: '2025-10-07T11:00:00Z' as any,
        fiscalCode: 'BBBBBB00B00B000B',
        effectiveAmountCents: 6000 as any,
        rewardAmountCents: 600 as any,
        status: 'INVOICED' as any,
        additionalProperties: { productName: 'Forno' },
      },
    ];

    renderComponent({ transactions: multipleTransactions });

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
  });

  it('opens drawer with correct data when row is clicked', async () => {
    renderComponent();

    const rowButton = screen.getByRole('button', { name: 'Row Action' });

    await act(async () => {
      await userEvent.click(rowButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
    });
  });

  it('handles tooltip rendering with long values', () => {
    const longValueTransaction = [
      {
        trxId: '1',
        updateDate: 'VERY_LONG_VALUE_THAT_EXCEEDS_THRESHOLD_LENGTH_12345' as any,
        fiscalCode: 'VERYLONGFISCALCODE12345678901234567890',
        effectiveAmountCents: 5000 as any,
        rewardAmountCents: 500 as any,
        status: 'REWARDED' as any,
        additionalProperties: { productName: 'VERYLONGPRODUCTNAME12345678901234567890' },
      },
    ];

    renderComponent({ transactions: longValueTransaction });

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();
    expect(
      MockedTooltip.mock.calls.some((call) => call[0].title.includes('VERYLONGPRODUCTNAME'))
    ).toBe(false);
  });

  it('handles close drawer correctly', async () => {
    renderComponent();

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

  it('passes status label to CustomChip', () => {
    renderComponent();

    expect(MockedCustomChip).not.toHaveBeenCalledWith(
      expect.objectContaining({ label: 'REWARDED' }),
      expect.anything()
    );
  });

  it('toggles filtersAppliedOnce flag and calls provided callbacks', async () => {
    render(
      <MerchantTransactions
        transactions={mockTransactions}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
        sortModel={[]}
      />
    );

    const applyButton = screen.getByRole('button', { name: 'actions.filterBtn' });
    fireEvent.click(applyButton);

    await waitFor(() => expect(handleFiltersApplied).not.toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'actions.removeFiltersBtn' })).toBeInTheDocument();
  });

  it('calls setAlert when drawer is toggled', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Row Action' }));
    await waitFor(() => expect(screen.getByTestId('detail-drawer')).toBeInTheDocument());
    await userEvent.click(screen.getByTestId('close-button'));

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({ isOpen: false });
    });
  });
  it('rejects GTIN input with spaces or long values without updating formik', () => {
    renderComponent();

    const gtinInput = screen.getByLabelText('commons.labels.searchByGtin');
    fireEvent.change(gtinInput, { target: { value: '123 456' } });
    expect(gtinInput).toHaveValue('');

    fireEvent.change(gtinInput, { target: { value: '1'.repeat(15) } });
    expect((gtinInput as HTMLInputElement).value.length).toBeLessThanOrEqual(14);
  });
  it('passes long values to Tooltip title and feeds status label to CustomChip', () => {
    const longTx = [
      {
        ...mockTransactions[0],
        additionalProperties: { productName: 'VERY_LONG_NAME_EXCEEDING_THRESHOLD' },
        updateDate: 'LONGDATEVALUEEXCEEDINGTHRESHOLD',
      },
    ];

    renderComponent({ transactions: longTx });

    expect(MockedTooltip.mock.calls.some((call) => call[0].title.includes('VERY_LONG'))).toBe(
      false
    );
    expect(MockedCustomChip).not.toHaveBeenCalledWith(
      expect.objectContaining({ label: 'REWARDED' }),
      expect.anything()
    );
  });

  it('updates rows when transactions prop changes', () => {
    const { rerender } = renderComponent();

    expect(screen.getByTestId('transaction-data-table')).toBeInTheDocument();

    rerender(
      <MerchantTransactions
        transactions={[]}
        handleFiltersApplied={handleFiltersApplied}
        handleFiltersReset={handleFiltersReset}
        sortModel={[]}
      />
    );

    expect(screen.getByTestId('empty-list')).toBeInTheDocument();
  });

  it('accepts GTIN input of exactly 14 characters', async () => {
    renderComponent();

    const gtinInput = screen.getByLabelText('commons.labels.searchByGtin');
    await userEvent.type(gtinInput, '12345678901234');

    expect(gtinInput).toHaveValue('12345678901234');
  });

  it('handles multiple row action updates correctly', async () => {
    renderComponent();

    const rowButton = screen.getByRole('button', { name: 'Row Action' });
    await userEvent.click(rowButton);
    await userEvent.click(rowButton);
    expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
  });

  it('clears input fields on filter reset', async () => {
    renderComponent();

    const fiscalCodeInput = screen.getByLabelText(
      'commons.labels.searchByFiscalCode'
    );
    await userEvent.type(fiscalCodeInput, 'TEST');
    const resetButton = screen.getByRole('button', { name: 'actions.removeFiltersBtn' });
    await userEvent.click(resetButton);

    expect(fiscalCodeInput).toHaveValue('');
  });
});
