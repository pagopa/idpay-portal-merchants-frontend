import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import TransactionDetail from '../TransactionDetail';
import { TYPE_TEXT, MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';

jest.mock('../../../utils/formatUtils', () => ({
  currencyFormatter: jest.fn((value: number) => `€ ${value.toFixed(2)}`),
  formatValues: jest.fn((value: string) => `Formatted: ${value}`),
}));
jest.mock('../../Chip/CustomChip', () => ({
  __esModule: true,
  default: ({ label, colorChip }: any) => (
    <div data-testid="custom-chip-mock" style={{ backgroundColor: colorChip }}>
      {label}
    </div>
  ),
}));

jest.mock('../useStatus', () => ({
  __esModule: true,
  default: jest.fn((status: string) => {
    if (status === 'COMPLETED') {
      return { label: 'Completato', color: '#00FF00' };
    }
    return { label: 'Altro', color: '#CCCCCC' };
  }),
}));

const mockCurrencyFormatter = require('../../../utils/formatUtils').currencyFormatter as jest.Mock;
const mockFormatValues = require('../../../utils/formatUtils').formatValues as jest.Mock;
const mockGetStatus = require('../useStatus').default as jest.Mock;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

describe('TransactionDetail', () => {
  const defaultItemValues = {
    id: 'TRX-123',
    amount: 5000,
    status: 'COMPLETED',
    description: 'Test transaction',
    additionalProperties: {
      productName: 'Prodotto A',
    },
    unmappedKey: 'Unmapped value',
  };

  const defaultListItem = [
    { id: 'id', label: 'ID Transazione', type: TYPE_TEXT.Text },
    { id: 'amount', label: 'Importo', type: TYPE_TEXT.Currency },
    { id: 'description', label: 'Descrizione', type: TYPE_TEXT.Text },
    { id: 'unmappedKey', label: 'Chiave non mappata', type: TYPE_TEXT.Boolean },
    { id: 'additionalProperties.productName', label: 'Nome Prodotto', type: TYPE_TEXT.Text },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.skip('should render the title and map all list items', () => {
    render(
      <Wrapper>
        <TransactionDetail
          title="Dettaglio Transazione"
          itemValues={defaultItemValues}
          listItem={defaultListItem as any}
        />
      </Wrapper>
    );

    expect(screen.getByText('Dettaglio Transazione')).toBeInTheDocument();
    expect(screen.getByText('ID Transazione')).toBeInTheDocument();
    expect(screen.getByText('Importo')).toBeInTheDocument();
    expect(screen.getByText('Descrizione')).toBeInTheDocument();
    expect(screen.getByText('Nome Prodotto')).toBeInTheDocument();
  });

  describe('getValueText logic', () => {
    const itemValues = {
      valueText: 'hello',
      valueNum: 1000,
      'additionalProperties.productName': 'dummy',
      additionalProperties: { productName: 'Laptop' },
    };

    it('should correctly handle TYPE_TEXT.Text and call formatValues', () => {
      render(
        <Wrapper>
          <TransactionDetail
            itemValues={itemValues}
            listItem={[{ id: 'valueText', label: 'Text Field', type: TYPE_TEXT.Text }]}
          />
        </Wrapper>
      );
      expect(mockFormatValues).toHaveBeenCalledWith('hello');
    });

    it.skip('should correctly handle TYPE_TEXT.Currency and call currencyFormatter', () => {
      render(
        <Wrapper>
          <TransactionDetail
            itemValues={itemValues}
            listItem={[{ id: 'valueNum', label: 'Amount Field', type: TYPE_TEXT.Currency }]}
          />
        </Wrapper>
      );

      expect(mockCurrencyFormatter).toHaveBeenCalledWith(10);
      expect(screen.getByText('€ 10.00')).toBeInTheDocument();
    });

    it('should return "error on type" for unhandled TYPE_TEXT', () => {
      render(
        <Wrapper>
          <TransactionDetail
            itemValues={itemValues}
            listItem={[{ id: 'valueText', label: 'Error Field', type: TYPE_TEXT.Boolean }]}
          />
        </Wrapper>
      );
      expect(screen.getByText('error on type')).toBeInTheDocument();
    });

    it('should correctly extract nested productName and ignore type', () => {
      render(
        <Wrapper>
          <TransactionDetail
            itemValues={itemValues}
            listItem={[
              {
                id: 'additionalProperties.productName',
                label: 'Product',
                type: TYPE_TEXT.Currency,
              },
            ]}
          />
        </Wrapper>
      );
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    it('should return MISSING_DATA_PLACEHOLDER for missing nested productName', () => {
      render(
        <Wrapper>
          <TransactionDetail
            itemValues={{ additionalProperties: null }}
            listItem={[
              { id: 'additionalProperties.productName', label: 'Product', type: TYPE_TEXT.Text },
            ]}
          />
        </Wrapper>
      );
      expect(screen.getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument();
    });
  });

  describe('getStatusChip and Status Display', () => {
    it.skip('should render the status label and CustomChip correctly', () => {
      render(
        <Wrapper>
          <TransactionDetail itemValues={{ status: 'COMPLETED' }} listItem={[]} />
        </Wrapper>
      );

      expect(mockGetStatus).toHaveBeenCalledWith('COMPLETED');
      expect(screen.getByText('Stato')).toBeInTheDocument();

      const chip = screen.getByTestId('custom-chip-mock');
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveTextContent('Completato');
      expect(chip).toHaveStyle('background-color: #00FF00');
    });

    it.skip('should use default status configuration for unmocked status', () => {
      render(
        <Wrapper>
          <TransactionDetail itemValues={{ status: 'PENDING' }} listItem={[]} />
        </Wrapper>
      );

      const chip = screen.getByTestId('custom-chip-mock');
      expect(chip).toHaveTextContent('Altro');
      expect(chip).toHaveStyle('background-color: #CCCCCC');
    });
  });
});
