import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import TransactionDetail from '../TransactionDetail';
import { TYPE_TEXT, MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import { StoreProvider } from '../../../pages/initiativeStores/StoreContext';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { downloadInvoiceFile } from '../../../services/merchantService';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';

jest.mock('../../../services/merchantService', () => ({
  downloadInvoiceFile: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

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
    { id: 'unmappedKey', label: 'Chiave non mappata', type: TYPE_TEXT.Text },
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
    expect(screen.getByText('TRX-123')).toBeInTheDocument();
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
      const unknownType = 'UNKNOWN_TYPE' as any;
      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail
                itemValues={itemValues}
                listItem={[{ id: 'valueText', label: 'Error Field', type: unknownType }]}
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
                  {
                    id: 'additionalProperties.productName',
                    label: 'Product',
                    type: TYPE_TEXT.Text,
                  },
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

  describe('Invoice Download functionality', () => {
    const mockDownloadInvoiceFile = downloadInvoiceFile as jest.Mock;
    const mockUseErrorDispatcher = useErrorDispatcher as jest.Mock;
    const mockAddError = jest.fn();
    let mockLink: any;

    beforeEach(() => {
      jest.clearAllMocks();
      mockUseErrorDispatcher.mockReturnValue(mockAddError);

      // Mock completo per document.createElement
      mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        setAttribute: jest.fn(),
        style: {},
      };

      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink as any;
        }
        return document.createElement(tagName);
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it.skip('should display "Fattura" label and filename when status is not REFUNDED', () => {
      const itemValues = {
        status: 'COMPLETED',
        invoiceFile: { filename: 'invoice-123.pdf' },
      };

      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail itemValues={itemValues} listItem={[]} />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );

      expect(screen.getByText('Fattura')).toBeInTheDocument();
      expect(screen.getByText('invoice-123.pdf')).toBeInTheDocument();
    });

    it.skip('should display "Nota di credito" label when status is REFUNDED', () => {
      const itemValues = {
        status: 'REFUNDED',
        invoiceFile: { filename: 'credit-note.pdf' },
      };

      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail itemValues={itemValues} listItem={[]} />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );

      expect(screen.getByText('Nota di credito')).toBeInTheDocument();
      expect(screen.getByText('credit-note.pdf')).toBeInTheDocument();
    });

    it.skip('should display MISSING_DATA_PLACEHOLDER when invoice filename is missing', () => {
      const itemValues = {
        status: 'COMPLETED',
        invoiceFile: null,
      };

      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail itemValues={itemValues} listItem={[]} />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );

      expect(screen.getByText('Fattura')).toBeInTheDocument();

      // Cerca il MISSING_DATA_PLACEHOLDER nel link
      const links = screen.getAllByRole('link');
      const invoiceLink = links.find((link) =>
        link.textContent?.includes(MISSING_DATA_PLACEHOLDER)
      );
      expect(invoiceLink).toBeInTheDocument();
    });

    it.skip('should successfully download invoice file when link is clicked', async () => {
      mockDownloadInvoiceFile.mockResolvedValue({
        invoiceUrl: 'https://example.com/invoice.pdf',
      });

      const itemValues = {
        id: 'TRX-123',
        status: 'COMPLETED',
        invoiceFile: { filename: 'invoice-123.pdf' },
      };

      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail itemValues={itemValues} listItem={[]} />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );

      // Trova il link che contiene il filename
      const downloadLink = screen.getByText('invoice-123.pdf').closest('a');
      expect(downloadLink).toBeInTheDocument();

      if (downloadLink) {
        fireEvent.click(downloadLink);
      }

      await waitFor(() => {
        expect(mockDownloadInvoiceFile).toHaveBeenCalledWith('TRX-123', 'store-123');
        expect(mockLink.href).toBe('https://example.com/invoice.pdf');
        expect(mockLink.download).toBe('invoice-123.pdf');
        expect(mockLink.click).toHaveBeenCalled();
      });
    });

    it.skip('should use default filename "fattura.pdf" when filename is not provided', async () => {
      mockDownloadInvoiceFile.mockResolvedValue({
        invoiceUrl: 'https://example.com/default-invoice.pdf',
      });

      const itemValues = {
        id: 'TRX-456',
        status: 'COMPLETED',
        invoiceFile: null, // Nessun filename fornito
      };

      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail itemValues={itemValues} listItem={[]} />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );

      // Trova il link con MISSING_DATA_PLACEHOLDER
      const links = screen.getAllByRole('link');
      const downloadLink = links.find((link) =>
        link.textContent?.includes(MISSING_DATA_PLACEHOLDER)
      );

      expect(downloadLink).toBeInTheDocument();

      if (downloadLink) {
        fireEvent.click(downloadLink);
      }

      await waitFor(() => {
        expect(mockDownloadInvoiceFile).toHaveBeenCalledWith('TRX-456', 'store-123');
        expect(mockLink.href).toBe('https://example.com/default-invoice.pdf');
        expect(mockLink.download).toBe('fattura.pdf'); // Filename di default
        expect(mockLink.click).toHaveBeenCalled();
      });
    });

    it.skip('should handle download when invoiceFile is undefined', async () => {
      mockDownloadInvoiceFile.mockResolvedValue({
        invoiceUrl: 'https://example.com/invoice.pdf',
      });

      const itemValues = {
        id: 'TRX-789',
        status: 'COMPLETED',
        // invoiceFile non definito
      };

      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail itemValues={itemValues} listItem={[]} />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );

      const links = screen.getAllByRole('link');
      const downloadLink = links.find((link) =>
        link.textContent?.includes(MISSING_DATA_PLACEHOLDER)
      );

      if (downloadLink) {
        fireEvent.click(downloadLink);
      }

      await waitFor(() => {
        expect(mockDownloadInvoiceFile).toHaveBeenCalledWith('TRX-789', 'store-123');
        expect(mockLink.download).toBe('fattura.pdf');
      });
    });

    it.skip('should dispatch error when download fails', async () => {
      const errorMessage = 'Download failed';
      mockDownloadInvoiceFile.mockRejectedValue(new Error(errorMessage));

      const itemValues = {
        id: 'TRX-999',
        status: 'COMPLETED',
        invoiceFile: { filename: 'invoice-999.pdf' },
      };

      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail itemValues={itemValues} listItem={[]} />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );

      const downloadLink = screen.getByText('invoice-999.pdf').closest('a');

      if (downloadLink) {
        fireEvent.click(downloadLink);
      }

      await waitFor(() => {
        expect(mockDownloadInvoiceFile).toHaveBeenCalledWith('TRX-999', 'store-123');
        expect(mockAddError).toHaveBeenCalledWith({
          id: 'FILE_DOWNLOAD',
          blocking: false,
          error: expect.any(Error),
          techDescription: 'Merchant ID not found',
          displayableTitle: 'Errore downloand file',
          displayableDescription: 'Non è stato possibile scaricare il file',
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      });

      // Verifica che il link.click non sia stato chiamato in caso di errore
      expect(mockLink.click).not.toHaveBeenCalled();
    });

    it.skip('should handle network error during download', async () => {
      const networkError = new Error('Network error');
      mockDownloadInvoiceFile.mockRejectedValue(networkError);

      const itemValues = {
        id: 'TRX-NET-001',
        status: 'REFUNDED',
        invoiceFile: { filename: 'credit-note-001.pdf' },
      };

      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail itemValues={itemValues} listItem={[]} />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );

      // Verifica che sia "Nota di credito" per REFUNDED
      expect(screen.getByText('Nota di credito')).toBeInTheDocument();

      const downloadLink = screen.getByText('credit-note-001.pdf').closest('a');

      if (downloadLink) {
        fireEvent.click(downloadLink);
      }

      await waitFor(() => {
        expect(mockAddError).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'FILE_DOWNLOAD',
            blocking: false,
            error: expect.any(Error),
          })
        );
      });
    });

    it.skip('should handle download for REFUNDED status', async () => {
      mockDownloadInvoiceFile.mockResolvedValue({
        invoiceUrl: 'https://example.com/credit-note.pdf',
      });

      const itemValues = {
        id: 'TRX-REFUND-001',
        status: 'REFUNDED',
        invoiceFile: { filename: 'credit-note.pdf' },
      };

      render(
        <Provider store={store}>
          <StoreProvider>
            <ThemeProvider theme={createTheme()}>
              <TransactionDetail itemValues={itemValues} listItem={[]} />
            </ThemeProvider>
          </StoreProvider>
        </Provider>
      );

      const downloadLink = screen.getByText('credit-note.pdf').closest('a');

      if (downloadLink) {
        fireEvent.click(downloadLink);
      }

      await waitFor(() => {
        expect(mockDownloadInvoiceFile).toHaveBeenCalledWith('TRX-REFUND-001', 'store-123');
        expect(mockLink.href).toBe('https://example.com/credit-note.pdf');
        expect(mockLink.download).toBe('credit-note.pdf');
        expect(mockLink.click).toHaveBeenCalled();
      });
    });
  });
});
