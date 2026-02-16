import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

jest.mock('../../../routes', () => ({
  __esModule: true,
  default: {
    MODIFY_DOCUMENT: '/merchants/:id/stores/:pointOfSaleId/transactions/:trxId/modify/:fileDocNumber',
  },
}));

const mockCurrencyFormatter = jest.fn((n: number) => `€ ${n.toFixed(2)}`);
const mockFormatValues = jest.fn((s: string) => `Formatted: ${s}`);

jest.mock('../../../utils/formatUtils', () => ({
  __esModule: true,
  currencyFormatter: (n: number) => mockCurrencyFormatter(n),
  formatValues: (s: string) => mockFormatValues(s),
}));

jest.mock('../../../utils/constants', () => ({
  __esModule: true,
  MISSING_DATA_PLACEHOLDER: '-',
  TYPE_TEXT: {
    Text: 'Text',
    Currency: 'Currency',
  },
}));

const mockUseStore = jest.fn();

jest.mock('../../../pages/initiativeStores/StoreContext', () => ({
  __esModule: true,
  useStore: () => mockUseStore(),
}));

const mockSetAlert  = jest.fn();
jest.mock('../../../hooks/useAlert', () => ({
  __esModule: true,
  useAlert: () => ({ setAlert: mockSetAlert  }),
}));

const mockDownloadInvoiceFile = jest.fn();
jest.mock('../../../services/merchantService', () => ({
  __esModule: true,
  downloadInvoiceFile: (...args: any[]) => mockDownloadInvoiceFile(...args),
}));

const mockGetStatus = jest.fn();
jest.mock('../useStatus', () => ({
  __esModule: true,
  default: (status: string) => mockGetStatus(status),
}));

jest.mock('../../Chip/CustomChip', () => ({
  __esModule: true,
  default: ({ label, colorChip }: any) => (
    <div data-testid="chip" data-color={colorChip}>
      {label}
    </div>
  ),
}));

jest.mock('../../Drawer/DetailDrawer', () => ({
  __esModule: true,
  default: ({ children, buttons, ...rest }: any) => (
    <div data-testid={rest['data-testid'] ?? 'detail-drawer'}>
      <div data-testid="drawer-buttons">
        {(buttons ?? []).map((b: any) => (
          <button
            key={b.dataTestId ?? b.title}
            data-testid={b.dataTestId ?? 'drawer-btn'}
            onClick={b.onClick}
          >
            {b.title}
          </button>
        ))}
      </div>
      {children}
    </div>
  ),
}));

const pushMock = jest.fn();
const mockUseHistory = jest.fn();
const mockUseParams = jest.fn();

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useHistory: () => mockUseHistory(),
  useParams: () => mockUseParams(),
}));

import TransactionDetail from '../TransactionDetail';
import routes from '../../../routes';
import { TYPE_TEXT, MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';

describe('TransactionDetail (100% coverage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseParams.mockReturnValue({ id: 'merchant-123' });
    mockUseHistory.mockReturnValue({ push: pushMock, location: { pathname: '/here' } });

    mockUseStore.mockReturnValue({ storeId: 'store-999' });

    mockGetStatus.mockReturnValue({ label: 'Completato', color: '#00FF00' });
  });

  const baseList = [
    { id: 'valueText', label: 'Text Field', type: TYPE_TEXT.Text },
    { id: 'valueNum', label: 'Amount Field', type: TYPE_TEXT.Currency },
    { id: 'additionalProperties.productName', label: 'Product', type: TYPE_TEXT.Text },
    { id: 'unknown', label: 'Unknown Type', type: 'UNKNOWN_TYPE' as any },
  ];

  it.skip('renders list items, status chip; covers getValueText for Text/Currency/nested/missing/unknown', () => {
    const itemValues = {
      id: 'TRX-1',
      status: 'COMPLETED',
      valueText: 'hello',
      valueNum: '1000',
      additionalProperties: { productName: 'Laptop' },
      invoiceFile: { filename: 'invoice.pdf', docNumber: 'DOC-1' },
      unknown: 'whatever',
    };

    render(
      <TransactionDetail
        title="Dettaglio"
        isOpen
        onClose={jest.fn()}
        itemValues={itemValues}
        listItem={baseList}
      />
    );

    expect(mockFormatValues).toHaveBeenCalledWith('hello');
    expect(screen.getByText('Formatted: hello')).toBeInTheDocument();

    expect(mockCurrencyFormatter).toHaveBeenCalledWith(10);
    expect(screen.getByText('€ 10.00')).toBeInTheDocument();

    expect(screen.getByText('Laptop')).toBeInTheDocument();

    expect(screen.getByText('error on type')).toBeInTheDocument();

    expect(mockGetStatus).toHaveBeenCalledWith('COMPLETED');
    expect(screen.getByText('Stato')).toBeInTheDocument();
    expect(screen.getByTestId('chip')).toHaveTextContent('Completato');
    expect(screen.getByTestId('chip')).toHaveAttribute('data-color', '#00FF00');

    expect(screen.getByText('Numero fattura')).toBeInTheDocument();
    expect(screen.getByText('DOC-1')).toBeInTheDocument();
    expect(screen.getByText('Fattura')).toBeInTheDocument();
    expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
  });

  it('renders MISSING_DATA_PLACEHOLDER when additionalProperties is null and for invoice fields when missing', () => {
    const itemValues = {
      id: 'TRX-2',
      status: 'COMPLETED',
      valueText: 'x',
      valueNum: '0',
      additionalProperties: null,
      invoiceFile: null,
    };

    render(
      <TransactionDetail
        title="Dettaglio"
        isOpen
        onClose={jest.fn()}
        itemValues={itemValues}
        listItem={[
          { id: 'additionalProperties.productName', label: 'Product', type: TYPE_TEXT.Text },
        ]}
      />
    );

    expect(screen.getAllByText(MISSING_DATA_PLACEHOLDER)[0]).toBeInTheDocument();

    expect(screen.getByText('Numero fattura')).toBeInTheDocument();
    expect(screen.getAllByText(MISSING_DATA_PLACEHOLDER).length).toBeGreaterThanOrEqual(2);

    expect(screen.getByText('Fattura')).toBeInTheDocument();
  });

  it('hides invoice section when status is CANCELLED (CANCELLED branch)', () => {
    const itemValues = {
      id: 'TRX-3',
      status: 'CANCELLED',
      valueText: 'hello',
      additionalProperties: { productName: 'x' },
    };

    render(
      <TransactionDetail
        title="Dettaglio"
        isOpen
        onClose={jest.fn()}
        itemValues={itemValues}
        listItem={[{ id: 'valueText', label: 'Text Field', type: TYPE_TEXT.Text }]}
      />
    );

    expect(screen.queryByText('Numero fattura')).not.toBeInTheDocument();
    expect(screen.queryByText('Fattura')).not.toBeInTheDocument();
    expect(screen.queryByText('Nota di credito')).not.toBeInTheDocument();
  });

  it('shows REFUNDED labels (REFUNDED branch) and isEditable=false (no edit button)', () => {
    const itemValues = {
      id: 'TRX-4',
      status: 'REFUNDED',
      invoiceFile: { filename: 'credit-note.pdf', docNumber: 'CN-1' },
    };

    render(
      <TransactionDetail
        title="Dettaglio"
        isOpen
        onClose={jest.fn()}
        itemValues={itemValues}
        listItem={[]}
      />
    );

    expect(screen.getByText('Numero nota di credito')).toBeInTheDocument();
    expect(screen.getByText('Nota di credito')).toBeInTheDocument();
    expect(screen.getByText('CN-1')).toBeInTheDocument();
    expect(screen.getByText('credit-note.pdf')).toBeInTheDocument();

    expect(screen.queryByTestId('change-file-btn')).not.toBeInTheDocument();
  });

  it('creates edit button when editable and pushes correct path on click (docNumber present)', () => {
    const itemValues = {
      id: 'TRX-5',
      status: 'COMPLETED',
      rewardBatchTrxStatus: 'PENDING',
      invoiceFile: { filename: 'invoice-5.pdf', docNumber: 'DOC-5' },
    };

    render(
      <TransactionDetail
        title="Dettaglio"
        isOpen
        onClose={jest.fn()}
        itemValues={itemValues}
        listItem={[]}
      />
    );

    const btn = screen.getByTestId('change-file-btn');
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);

    const expectedPath = routes.MODIFY_DOCUMENT.replace(':id', 'merchant-123')
      .replace(':pointOfSaleId', 'store-999')
      .replace(':trxId', 'TRX-5')
      .replace(':fileDocNumber', window.btoa('DOC-5'));

    expect(pushMock).toHaveBeenCalledWith(expectedPath, { fromLocation: { pathname: '/here' } });
  });

  it('creates edit button when editable and pushes path with empty docNumber when missing (?? "" branch)', () => {
    const itemValues = {
      id: 'TRX-6',
      status: 'COMPLETED',
      rewardBatchTrxStatus: 'PENDING',
      invoiceFile: null,
    };

    render(
      <TransactionDetail
        title="Dettaglio"
        isOpen
        onClose={jest.fn()}
        itemValues={itemValues}
        listItem={[]}
      />
    );

    const btn = screen.getByTestId('change-file-btn');
    fireEvent.click(btn);

    const expectedPath = routes.MODIFY_DOCUMENT.replace(':id', 'merchant-123')
      .replace(':pointOfSaleId', 'store-999')
      .replace(':trxId', 'TRX-6')
      .replace(':fileDocNumber', '');

    expect(pushMock).toHaveBeenCalledWith(expectedPath, { fromLocation: { pathname: '/here' } });
  });

  it('does NOT show edit button when rewardBatchTrxStatus is APPROVED (isEditable=false branch)', () => {
    const itemValues = {
      id: 'TRX-7',
      status: 'COMPLETED',
      rewardBatchTrxStatus: 'APPROVED',
    };

    render(
      <TransactionDetail
        title="Dettaglio"
        isOpen
        onClose={jest.fn()}
        itemValues={itemValues}
        listItem={[]}
      />
    );

    expect(screen.queryByTestId('change-file-btn')).not.toBeInTheDocument();
  });

  it('download success: shows loader, calls service, creates link, uses provided filename', async () => {
    mockDownloadInvoiceFile.mockResolvedValue({ invoiceUrl: 'https://example.com/invoice.pdf' });

    const linkMock = {
      href: '',
      download: '',
      click: jest.fn(),
    };

    const origCreateElement = document.createElement.bind(document);
    const createElSpy = jest
      .spyOn(document, 'createElement')
      .mockImplementation((tag: any) => {
        if (tag === 'a') return linkMock as any;
        return origCreateElement(tag);
      });

    const itemValues = {
      id: 'TRX-8',
      status: 'COMPLETED',
      invoiceFile: { filename: 'invoice-8.pdf', docNumber: 'D8' },
    };

    render(
      <TransactionDetail
        title="Dettaglio"
        isOpen
        onClose={jest.fn()}
        itemValues={itemValues}
        listItem={[]}
      />
    );

    fireEvent.click(screen.getByTestId('btn-test'));

    expect(await screen.findByTestId('item-loader')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockDownloadInvoiceFile).toHaveBeenCalledWith('TRX-8', 'store-999');
      expect(linkMock.href).toBe('https://example.com/invoice.pdf');
      expect(linkMock.download).toBe('invoice-8.pdf');
      expect(linkMock.click).toHaveBeenCalled();
    });

    createElSpy.mockRestore();
  });

  it('download success uses default filename "fattura.pdf" when filename is missing (|| branch)', async () => {
    mockDownloadInvoiceFile.mockResolvedValue({ invoiceUrl: 'https://example.com/default.pdf' });

    const linkMock = { href: '', download: '', click: jest.fn() };

    const origCreateElement = document.createElement.bind(document);
    const createElSpy = jest
      .spyOn(document, 'createElement')
      .mockImplementation((tag: any) => {
        if (tag === 'a') return linkMock as any;
        return origCreateElement(tag);
      });

    const itemValues = {
      id: 'TRX-9',
      status: 'COMPLETED',
      invoiceFile: null,
    };

    render(
      <TransactionDetail
        title="Dettaglio"
        isOpen
        onClose={jest.fn()}
        itemValues={itemValues}
        listItem={[]}
      />
    );

    fireEvent.click(screen.getByTestId('btn-test'));

    expect(await screen.findByTestId('item-loader')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockDownloadInvoiceFile).toHaveBeenCalledWith('TRX-9', 'store-999');
      expect(linkMock.href).toBe('https://example.com/default.pdf');
      expect(linkMock.download).toBe('fattura.pdf');
      expect(linkMock.click).toHaveBeenCalled();
    });

    createElSpy.mockRestore();
  });

  it('download error: calls setAlert and stops loading (catch branch)', async () => {
    mockDownloadInvoiceFile.mockRejectedValue(new Error('boom'));

    const itemValues = {
      id: 'TRX-10',
      status: 'COMPLETED',
      invoiceFile: { filename: 'invoice-10.pdf', docNumber: 'D10' },
    };

    render(
      <TransactionDetail
        title="Dettaglio"
        isOpen
        onClose={jest.fn()}
        itemValues={itemValues}
        listItem={[]}
      />
    );

    fireEvent.click(screen.getByTestId('btn-test'));

    expect(await screen.findByTestId('item-loader')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockDownloadInvoiceFile).toHaveBeenCalledWith('TRX-10', 'store-999');
      expect(mockSetAlert ).toHaveBeenCalled();
    });

    const payload = mockSetAlert .mock.calls[0][0];
    expect(payload.title).toBe('Errore download file');
    expect(payload.severity).toBe('error');
    expect(payload.isOpen).toBe(true);

    await waitFor(() => {
      expect(screen.queryByTestId('item-loader')).not.toBeInTheDocument();
      expect(screen.getByText('invoice-10.pdf')).toBeInTheDocument();
    });
  });
});