
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import TransactionDetail from '../TransactionDetail';
import { TYPE_TEXT, MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import { StoreProvider } from '../../../pages/initiativeStores/StoreContext';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import * as merchantService from '../../../services/merchantService';
import * as useErrorDispatcherModule from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';



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
const store = configureStore({ reducer: () => ({}) });

// const Wrapper = ({ children }: { children: React.ReactNode }) => (
//   <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
// );

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
      <Provider store={store}>
        <StoreProvider>
          <ThemeProvider theme={createTheme()}>
            <TransactionDetail
              title="Dettaglio Transazione"
              itemValues={defaultItemValues}
              listItem={defaultListItem as any}
            />
          </ThemeProvider>
        </StoreProvider>
      </Provider>
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
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail
                itemValues={itemValues}
                listItem={[{ id: 'valueText', label: 'Text Field', type: TYPE_TEXT.Text }]}
              />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );
      expect(mockFormatValues).toHaveBeenCalledWith('hello');
    });

    it.skip('should correctly handle TYPE_TEXT.Currency and call currencyFormatter', () => {
      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail
                itemValues={itemValues}
                listItem={[{ id: 'valueNum', label: 'Amount Field', type: TYPE_TEXT.Currency }]}
              />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );

      expect(mockCurrencyFormatter).toHaveBeenCalledWith(10);
      expect(screen.getByText('€ 10.00')).toBeInTheDocument();
    });

    it('should return "error on type" for unhandled TYPE_TEXT', () => {
      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail
                itemValues={itemValues}
                listItem={[{ id: 'valueText', label: 'Error Field', type: TYPE_TEXT.Boolean }]}
              />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );
      expect(screen.getByText('error on type')).toBeInTheDocument();
    });

    it('should correctly extract nested productName and ignore type', () => {
      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
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
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    it('should return MISSING_DATA_PLACEHOLDER for missing nested productName', () => {
      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail
                itemValues={{ additionalProperties: null }}
                listItem={[
                  { id: 'additionalProperties.productName', label: 'Product', type: TYPE_TEXT.Text },
                ]}
              />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );
      expect(screen.getAllByText(MISSING_DATA_PLACEHOLDER)[0]).toBeInTheDocument();
    });
  });

  describe('getStatusChip and Status Display', () => {
    it.skip('should render the status label and CustomChip correctly', () => {
      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail itemValues={{ status: 'COMPLETED' }} listItem={[]} />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
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
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail itemValues={{ status: 'PENDING' }} listItem={[]} />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );

      const chip = screen.getByTestId('custom-chip-mock');
      expect(chip).toHaveTextContent('Altro');
      expect(chip).toHaveStyle('background-color: #CCCCCC');
    });
  });

  // describe('TransactionDetail - downloadFile', () => {
  //   const addErrorMock = jest.fn();
  //   const clickMock = jest.fn();
  //
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //     jest.spyOn(useErrorDispatcherModule, 'default').mockReturnValue(addErrorMock);
  //     const originalCreateElement = document.createElement;
  //     jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
  //       const element = originalCreateElement.call(document, tagName);
  //       if (tagName === 'a') {
  //         jest.spyOn(element, 'click');
  //       }
  //       return element;
  //     });
  //   });
  //
  //   it('should call downloadInvoiceFile and click link when file exists', async () => {
  //     const transaction = {
  //       id: 'TRX-123',
  //       invoiceFile: { filename: 'fattura.pdf' },
  //     };
  //     const invoiceUrl = 'https://fakeurl.com/invoice.pdf';
  //     jest.spyOn(merchantService, 'downloadInvoiceFile').mockResolvedValue({ invoiceUrl });
  //
  //     render(
  //       <Provider store={store}>
  //         <StoreProvider>
  //           <ThemeProvider theme={createTheme()}>
  //             <TransactionDetail itemValues={transaction} listItem={[]} />
  //           </ThemeProvider>
  //         </StoreProvider>
  //       </Provider>
  //     );
  //
  //     fireEvent.click(screen.getByText('fattura.pdf'));
  //
  //     expect(merchantService.downloadInvoiceFile).toHaveBeenCalledWith('TRX-123', '');
  //     expect(clickMock).toHaveBeenCalled();
  //   });
  //
  //   it('should call addError if downloadInvoiceFile fails', async () => {
  //     const transaction = {
  //       id: 'TRX-123',
  //       invoiceFile: { filename: 'fattura.pdf' },
  //     };
  //     jest.spyOn(merchantService, 'downloadInvoiceFile').mockRejectedValue(new Error('Failed'));
  //
  //     render(
  //       <Provider store={store}>
  //         <StoreProvider>
  //           <ThemeProvider theme={createTheme()}>
  //             <TransactionDetail itemValues={transaction} listItem={[]} />
  //           </ThemeProvider>
  //         </StoreProvider>
  //       </Provider>
  //     );
  //
  //     const link = screen.getByRole('link', { name: /fattura\.pdf/i });
  //     const clickSpy = jest.spyOn(link, 'click');
  //
  //     fireEvent.click(link);
  //
  //     await waitFor(() => {
  //       expect(merchantService.downloadInvoiceFile).toHaveBeenCalledWith('TRX-123', '');
  //       expect(clickSpy).toHaveBeenCalled();
  //     });
  //   });
  // });
});
