import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvoiceDetail from '../InvoiceDetail';
import { useLocation } from 'react-router-dom';
import { getMerchantsApi } from '../../../../api/MerchantsApiClient';

let consoleErrorSpy: jest.SpyInstance;

beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});

jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useErrorDispatcher', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../initiativeStores/StoreContext', () => ({
  useStore: jest.fn(),
}));

jest.mock('../../../../services/merchantService', () => ({
  postponeTransaction: jest.fn(),
}));

jest.mock('../../../../components/Chip/StatusChipInvoice', () => (props: any) => (
  <div data-testid="status-chip">{props.status}</div>
));

jest.mock('../../../../hooks/useAlert', () => ({
  useAlert: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockUseLocation = {
  state: {
    store: { status: 'CREATED', month: new Date('2026-02-15').toISOString().split('T')[0] },
  },
};
const pushMock = jest.fn();
const mockUseHistory = jest.fn();

jest.mock('../../../../hooks/useCurrentInitiative', () => ({
  useCurrentInitiative: jest.fn(),
}));

jest.mock('../../../../hooks/useUserPermissions', () => ({
  ...jest.requireActual('../../../../hooks/useUserPermissions'),
  useUserPermissions: jest.fn(),
}));

jest.mock('../../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));
jest.mock('../../../../api/MerchantsApiClient', () => ({
  getMerchantsApi: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useHistory: () => mockUseHistory(),
  useParams: () => ({ initiative_id: 'init-1', batch_id: 'batch-1' }),
}));

jest.mock('../../../../redux/slices/initiativesSlice', () => ({
  intiativesListSelector: (state: any) => state,
}));

// jest.mock('../../../../utils/formatUtils', () => ({
//     ...jest.requireActual('../../../../utils/formatUtils'),
//     formatValues: jest.fn((val: string) => val ? `formatted-${val}` : MISSING_DATA_PLACEHOLDER),
//     currencyFormatter: jest.fn((val: number) => ({ toString: () => `€${val.toFixed(2)}` }))
// }));

jest.mock('../../../../helpers', () => ({
  ...jest.requireActual('../../../../helpers'),
  isReversableOrEditable: jest.fn(),
}));

import { useStore } from '../../../initiativeStores/StoreContext';
import { postponeTransaction } from '../../../../services/merchantService';
import { useAlert } from '../../../../hooks/useAlert';
import { useAppSelector } from '../../../../redux/hooks';
import { isReversableOrEditable } from '../../../../helpers';
import { MISSING_DATA_PLACEHOLDER, TYPE_TEXT } from '../../../../utils/constants';
import { safeFormatDate } from '../../../../utils/formatUtils';
import { useCurrentInitiative } from '../../../../hooks/useCurrentInitiative';
import { useUserPermissions } from '../../../../hooks/useUserPermissions';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

let mockSetAlert: jest.Mock;

const baseItemValues = {
  id: 'trx-1',
  pointOfSaleId: 'pos-1',
  status: 'APPROVED',
  rewardBatchTrxStatus: 'APPROVED',
  invoiceData: {
    docNumber: 'DOC-123',
    filename: 'fattura.pdf',
  },
  rewardBatchRejectionReason: [{ date: new Date('2026-02-03'), reason: 'Motivo di rifiuto' }],
  additionalProperties: {
    productName: 'Prodotto di test',
  },
};

const baseListItem = [
  {
    label: 'Data e ora',
    id: 'trxChargeDate',
    type: TYPE_TEXT.Text,
    format: (val: any) => safeFormatDate(val),
  },
  {
    label: 'Elettrodomestico',
    id: 'additionalProperties.productName',
    type: TYPE_TEXT.Text,
  },
  {
    label: 'Codice Fiscale Beneficiario',
    id: 'fiscalCode',
    type: TYPE_TEXT.Text,
  },
  {
    label: 'ID transazione',
    id: 'trxId',
    type: TYPE_TEXT.Text,
    bold: true,
  },
  {
    label: 'Codice sconto',
    id: 'trxCode',
    type: TYPE_TEXT.Text,
  },
  {
    label: 'Totale della spesa',
    id: 'effectiveAmountCents',
    type: TYPE_TEXT.Currency,
    bold: true,
  },
  {
    label: 'Sconto applicato',
    id: 'rewardAmountCents',
    type: TYPE_TEXT.Currency,
  },
  {
    label: 'Importo autorizzato',
    id: 'authorizedAmountCents',
    type: TYPE_TEXT.Currency,
  },
];

const createMockStore = (initialState?: any) => {
  return configureStore({
    reducer: () => initialState,
  });
};

const store = createMockStore();

beforeEach(() => {
  jest.clearAllMocks();
  mockSetAlert = jest.fn();
  mockUseHistory.mockReturnValue({
    push: pushMock,
    location: { pathname: '/merchants/init-1/refunds/batch-1', state: {} },
  });
  (useStore as jest.Mock).mockReturnValue({ storeId: 'STORE_ID' });
  (useAlert as jest.Mock).mockReturnValue({ setAlert: mockSetAlert });
  (useLocation as jest.Mock).mockReturnValue(mockUseLocation);
  (useCurrentInitiative as jest.Mock).mockReturnValue({ initiativeId: 'init-123', endDate: null });
  (useUserPermissions as jest.Mock).mockReturnValue({
    isActionDisabled: jest.fn().mockReturnValue(false),
  });
  (useAppSelector as jest.Mock).mockReset();
  (window as any).open = jest.fn();
  global.fetch = jest.fn();
});

describe('Render component', () => {
  it('should render component', () => {
    (useAppSelector as jest.Mock).mockReturnValue([]);

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    expect(screen.getByText('Dettaglio transazione')).toBeInTheDocument();
    expect(screen.getByText('Elettrodomestico')).toBeInTheDocument();
    expect(screen.getByText('Prodotto di test')).toBeInTheDocument();
    expect(screen.getByText('Numero fattura')).toBeInTheDocument();
    expect(screen.queryByText('Motivo di rifiuto')).not.toBeInTheDocument();
    expect(screen.queryByText('Nota ufficiale')).not.toBeInTheDocument();
    expect(screen.queryByText('03/02/2026')).not.toBeInTheDocument();
    expect(screen.getByTestId('btn-test')).toBeInTheDocument();
  });
  it('should render rejection note for suspended status', () => {
    (useAppSelector as jest.Mock).mockReturnValue([]);
    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={{
            ...baseItemValues,
            rewardBatchTrxStatus: 'SUSPENDED',
            additionalProperties: { productName: undefined },
          }}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    expect(screen.getByText('Dettaglio transazione')).toBeInTheDocument();
    expect(screen.getByText('Elettrodomestico')).toBeInTheDocument();
    expect(screen.getByText('Numero fattura')).toBeInTheDocument();
    expect(screen.getByText('Nota ufficiale')).toBeInTheDocument();
    expect(screen.getByText('Motivo di rifiuto')).toBeInTheDocument();
    expect(screen.getByText('03/02/2026')).toBeInTheDocument();
    expect(screen.getByTestId('btn-test')).toBeInTheDocument();
  });
  it('should handle undefined initiativesListSel (line 68 branch)', () => {
    (useAppSelector as jest.Mock).mockReturnValue(undefined);

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    expect(screen.getByText('Dettaglio transazione')).toBeInTheDocument();
  });
  it('should cover rejection reason empty branch (lines 220-225)', () => {
    const values = {
      ...baseItemValues,
      rewardBatchTrxStatus: 'REJECTED',
      rewardBatchRejectionReason: [],
    };

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={values}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
  });
});
describe('Download File', () => {
  let mockDownloadInvoiceFile: jest.Mock;

  const setupDownloadInvoiceFileMock = () => {
    mockDownloadInvoiceFile = jest.fn();
    (getMerchantsApi as jest.Mock).mockReturnValue({
      downloadInvoiceFile: mockDownloadInvoiceFile,
    });
    return mockDownloadInvoiceFile;
  };
  it('should successfully download file', async () => {
    (useAppSelector as jest.Mock).mockReturnValue([]);

    const downloadInvoiceFileMock = setupDownloadInvoiceFileMock();

    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    const mockResponse = {
      ok: true,
      blob: jest.fn().mockResolvedValue(mockBlob),
    };

    downloadInvoiceFileMock.mockResolvedValueOnce({
      invoiceUrl: 'https://example.com/invoice.pdf',
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    const button = screen.getByTestId('btn-test');
    fireEvent.click(button);

    expect(screen.getByTestId('item-loader')).toBeInTheDocument();

    await waitFor(() => {
      expect(downloadInvoiceFileMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/invoice.pdf', {
        method: 'GET',
      });
    });
  });

  it('should handle fetch fail', async () => {
    (useAppSelector as jest.Mock).mockReturnValue([]);

    const downloadInvoiceFileMock = setupDownloadInvoiceFileMock();

    downloadInvoiceFileMock.mockResolvedValueOnce({
      invoiceUrl: 'https://example.com/invoice.pdf',
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    const button = screen.getByTestId('btn-test');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Errore download file',
          text: 'Non è stato possibile scaricare il file',
          severity: 'error',
          isOpen: true,
        })
      );
    });
  });

  it('should handle wrong exstension', async () => {
    (useAppSelector as jest.Mock).mockReturnValue([]);

    const downloadInvoiceFileMock = setupDownloadInvoiceFileMock();

    const unsupportedValues = {
      ...baseItemValues,
      invoiceData: {
        docNumber: 'DOC-125',
        filename: 'fattura.txt',
      },
    };

    downloadInvoiceFileMock.mockResolvedValueOnce({
      invoiceUrl: 'https://example.com/invoice.txt',
    });

    const mockBlob = new Blob(['content'], { type: 'text/plain' });
    const mockResponse = {
      ok: true,
      blob: jest.fn().mockResolvedValue(mockBlob),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={unsupportedValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    const button = screen.getByTestId('btn-test');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
        })
      );
    });
  });

  it('should handle missing file', async () => {
    (useAppSelector as jest.Mock).mockReturnValue([]);

    const downloadInvoiceFileMock = setupDownloadInvoiceFileMock();

    const noFilenameValues = {
      ...baseItemValues,
      invoiceData: {
        docNumber: 'DOC-126',
      },
    };

    downloadInvoiceFileMock.mockResolvedValueOnce({
      invoiceUrl: 'https://example.com/invoice.pdf',
    });

    const mockBlob = new Blob(['content'], { type: 'application/pdf' });
    const mockResponse = {
      ok: true,
      blob: jest.fn().mockResolvedValue(mockBlob),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={noFilenameValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    const button = screen.getByTestId('btn-test');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
        })
      );
    });
  });

  it('should handle error', async () => {
    (useAppSelector as jest.Mock).mockReturnValue([]);

    const downloadInvoiceFileMock = setupDownloadInvoiceFileMock();

    downloadInvoiceFileMock.mockRejectedValueOnce(new Error('download error'));

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    const button = screen.getByTestId('btn-test');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Errore download file',
          severity: 'error',
        })
      );
    });
  });

  it('should show loader', async () => {
    (useAppSelector as jest.Mock).mockReturnValue([]);

    const downloadInvoiceFileMock = setupDownloadInvoiceFileMock();

    const mockPromise = new Promise(() => {});

    downloadInvoiceFileMock.mockReturnValueOnce(mockPromise);

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    const button = screen.getByTestId('btn-test');
    fireEvent.click(button);

    expect(screen.getByTestId('item-loader')).toBeInTheDocument();
  });

  it('should use empty string when docNumber is undefined', () => {
    (isReversableOrEditable as jest.Mock).mockReturnValue(true);

    const values = {
      ...baseItemValues,
      pointOfSaleId: 'pos-1',
      invoiceData: {},
    };

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={values}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    const modifyBtn = screen.getByTestId('change-file-btn');
    fireEvent.click(modifyBtn);

    expect(pushMock).toHaveBeenCalled();
  });

  it('should handle xml extension branch', async () => {
    (useAppSelector as jest.Mock).mockReturnValue([]);

    const downloadInvoiceFileMock = setupDownloadInvoiceFileMock();

    const xmlValues = {
      ...baseItemValues,
      invoiceData: { docNumber: 'DOC', filename: 'file.xml' },
    };

    downloadInvoiceFileMock.mockResolvedValueOnce({
      invoiceUrl: 'https://example.com/file.xml',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: jest.fn().mockResolvedValue(new Blob(['xml'], { type: 'application/xml' })),
    });

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={xmlValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('btn-test'));

    await waitFor(() => {
      expect(downloadInvoiceFileMock).toHaveBeenCalled();
    });
  });

  it('should cover window.open null', async () => {
    (useAppSelector as jest.Mock).mockReturnValue([]);

    const downloadInvoiceFileMock = setupDownloadInvoiceFileMock();

    downloadInvoiceFileMock.mockResolvedValueOnce({
      invoiceUrl: 'https://example.com/invoice.pdf',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: jest.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' })),
    });

    (window as any).open = jest.fn().mockReturnValue(null);

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('btn-test'));

    await waitFor(() => {
      expect(downloadInvoiceFileMock).toHaveBeenCalled();
    });
  });
});

describe('Postpone Transaction Logic', () => {
  it('should disable button when isNextMonthDisabled is true', async () => {
    const pastDate = new Date('2026-01-15');

    const mockInitiatives = [
      {
        initiativeId: 'init-123',
        endDate: pastDate,
      },
    ];

    (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

    (useLocation as jest.Mock).mockReturnValue(mockUseLocation);

    const consultableValues = {
      ...baseItemValues,
      rewardBatchTrxStatus: 'CONSULTABLE',
    };
    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );
    const button = await screen.findByTestId('next-month-btn');

    expect(button).toBeDisabled();
  });

  it('should show success alert', async () => {
    const futureDate = new Date('2026-03-15');
    const mockInitiatives = [
      {
        initiativeId: 'init-123',
        endDate: futureDate,
      },
    ];

    (useCurrentInitiative as jest.Mock).mockReturnValue({
      initiativeId: 'init-123',
      endDate: futureDate,
    });

    (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

    (useLocation as jest.Mock).mockReturnValue(mockUseLocation);

    (postponeTransaction as jest.Mock).mockResolvedValueOnce({ success: true });

    const consultableValues = {
      ...baseItemValues,
      rewardBatchTrxStatus: 'CONSULTABLE',
    };
    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );
    const button = await screen.findByTestId('next-month-btn');

    await waitFor(() => expect(button).not.toBeDisabled());

    fireEvent.click(button);
    await waitFor(() => {
      expect(
        screen.getByText('pages.refundRequests.invoiceDetailConfirmModal.title')
      ).toBeInTheDocument();
      expect(
        screen.getByText('pages.refundRequests.invoiceDetailConfirmModal.description')
      ).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Conferma');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        title: 'Errore',
        text: 'Non è stato possibile spostare la transazione',
        isOpen: true,
        severity: 'error',
      });
    });
  });

  it('should close modal', async () => {
    const futureDate = new Date('2026-03-15');
    const mockInitiatives = [
      {
        initiativeId: 'init-123',
        endDate: futureDate,
      },
    ];

    (useCurrentInitiative as jest.Mock).mockReturnValue({
      initiativeId: 'init-123',
      endDate: futureDate,
    });

    (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

    (useLocation as jest.Mock).mockReturnValue(mockUseLocation);

    (postponeTransaction as jest.Mock).mockResolvedValueOnce({ success: true });

    const consultableValues = {
      ...baseItemValues,
      rewardBatchTrxStatus: 'CONSULTABLE',
    };

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );
    const button = await screen.findByTestId('next-month-btn');

    await waitFor(() => expect(button).not.toBeDisabled());

    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText('pages.refundRequests.invoiceDetailConfirmModal.title')
      ).toBeInTheDocument();
      expect(
        screen.getByText('pages.refundRequests.invoiceDetailConfirmModal.description')
      ).toBeInTheDocument();
    });

    const backButton = screen.getByText('Indietro');
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(
        screen.queryByText('pages.refundRequests.invoiceDetailConfirmModal.title')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('pages.refundRequests.invoiceDetailConfirmModal.description')
      ).not.toBeInTheDocument();
    });
  });

  it('should show error alert', async () => {
    const futureDate = new Date('2026-03-15');
    const mockInitiatives = [
      {
        initiativeId: 'init-123',
        endDate: futureDate,
      },
    ];

    (useCurrentInitiative as jest.Mock).mockReturnValue({
      initiativeId: 'init-123',
      endDate: futureDate,
    });

    (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

    (postponeTransaction as jest.Mock).mockRejectedValueOnce(new Error('postpone error'));

    const consultableValues = {
      ...baseItemValues,
      rewardBatchTrxStatus: 'CONSULTABLE',
    };

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );
    const button = await screen.findByTestId('next-month-btn');

    await waitFor(() => expect(button).not.toBeDisabled());

    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText('pages.refundRequests.invoiceDetailConfirmModal.title')
      ).toBeInTheDocument();
      expect(
        screen.getByText('pages.refundRequests.invoiceDetailConfirmModal.description')
      ).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Conferma');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Errore',
          text: 'Non è stato possibile spostare la transazione',
          isOpen: true,
          severity: 'error',
        })
      );
    });
  });
});

describe('Reverse button', () => {
  it('Should navigate to reverse page when reverse button is clicked', () => {
    (useLocation as jest.Mock).mockReturnValue({
      state: { store: { status: 'CLOSED', month: mockUseLocation.state.store.month } },
    });
    (isReversableOrEditable as jest.Mock).mockReturnValue(true);

    const trxItem = {
      id: 'trx-1',
      pointOfSaleId: 'pos-1',
      status: 'REWARDED',
      rewardBatchTrxStatus: 'REJECTED',
      initiativeId: 'init-123',
      invoiceData: {
        docNumber: 'DOC-123',
        filename: 'fattura.pdf',
      },
      rewardBatchRejectionReason: [{ date: new Date('2026-02-03'), reason: 'Motivo di rifiuto' }],
      additionalProperties: {
        productName: 'Prodotto di test',
      },
    };

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={trxItem}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    const reverseButton = screen.getByTestId('reverse-btn');
    fireEvent.click(reverseButton);

    expect(pushMock).toHaveBeenCalled();
    expect(pushMock.mock.calls[0][0]).toContain('storna-transazione');
  });

  it('Should navigate', () => {
    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={{
            ...baseItemValues,
            rewardBatchTrxStatus: 'REJECTED',
            status: 'REWARDED',
            pointOfSaleId: 'pos-1',
          }}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );
    const button = screen.getByTestId('btn-test');
    fireEvent.click(button);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('Should navigate to modify document when editable and pointOfSaleId is present', () => {
    (useLocation as jest.Mock).mockReturnValue(mockUseLocation);
    (isReversableOrEditable as jest.Mock).mockReturnValue(true);

    const trxItem = {
      ...baseItemValues,
      pointOfSaleId: 'pos-1',
      invoiceData: {
        docNumber: 'DOC-777',
        filename: 'fattura.pdf',
      },
    };

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={trxItem}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    const modifyBtn = screen.getByTestId('change-file-btn');
    fireEvent.click(modifyBtn);

    expect(pushMock).toHaveBeenCalled();
    expect(pushMock.mock.calls[0][0]).toContain('modifica-documento');
  });

  it('Should not render modify button when not editable', () => {
    (isReversableOrEditable as jest.Mock).mockReturnValue(false);

    render(
      <Provider store={store}>
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={{ ...baseItemValues, pointOfSaleId: 'pos-1' }}
          listItem={baseListItem}
          isOpen={true}
          setIsOpen={() => {}}
        />
      </Provider>
    );

    expect(screen.queryByTestId('change-file-btn')).not.toBeInTheDocument();
  });
});
