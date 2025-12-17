import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvoiceDetail from '../InvoiceDetail';
import { RewardBatchTrxStatusEnum } from '../../../../api/generated/merchants/RewardBatchTrxStatus';

jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../initiativeStores/StoreContext', () => ({
  useStore: jest.fn(),
}));

jest.mock('../../../../services/merchantService', () => ({
  downloadInvoiceFile: jest.fn(),
  postponeTransaction: jest.fn(),
}));

jest.mock('../../../../components/Chip/StatusChipInvoice', () => (props: any) => (
  <div data-testid="status-chip">{props.status}</div>
));

jest.mock('../../../../components/modal/ModalComponent', () => (props: any) => (
  props.open ? (
    <div data-testid="modal-component" onClick={() => props.onClose()}>
      {props.children}
    </div>
  ) : null
));

jest.mock('../../../../hooks/useAlert', () => ({
  useAlert: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../../../redux/slices/initiativesSlice', () => ({
  intiativesListSelector: (state: any) => state,
}));

jest.mock('../../../../utils/formatUtils', () => ({
  formatValues: jest.fn((val: string) => `formatted-${val}`),
  currencyFormatter: jest.fn((val: number) => ({ toString: () => `€${val.toFixed(2)}` })),
  getEndOfNextMonth: jest.fn((date: Date) => {
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(0);
    return nextMonth;
  }),
}));

import { useStore } from '../../../initiativeStores/StoreContext';
import { downloadInvoiceFile, postponeTransaction } from '../../../../services/merchantService';
import { useAlert } from '../../../../hooks/useAlert';
import { useAppSelector } from '../../../../redux/hooks';

describe('InvoiceDetail', () => {
  let mockSetAlert: jest.Mock;

  const baseItemValues = {
    id: 'trx-1',
    pointOfSaleId: 'pos-1',
    status: 'APPROVED',
    rewardBatchTrxStatus: RewardBatchTrxStatusEnum.APPROVED,
    invoiceData: {
      docNumber: 'DOC-123',
      filename: 'fattura.pdf',
    },
    rewardBatchRejectionReason: 'Motivo di rifiuto',
    additionalProperties: {
      productName: 'Prodotto di test',
    },
  };

  const baseListItem = [
    {
      id: 'additionalProperties.productName',
      label: 'Elettrodomestico',
      format: (value: string) => `formatted-${value}`,
    },
    {
      id: 'amount',
      label: 'Importo',
      type: 'Currency',
    },
    {
      id: 'description',
      label: 'Descrizione',
      type: 'Text',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetAlert = jest.fn();
    (useStore as jest.Mock).mockReturnValue({ storeId: 'STORE_ID' });
    (useAlert as jest.Mock).mockReturnValue({ setAlert: mockSetAlert });
    (useAppSelector as jest.Mock).mockReturnValue([]);
    (window as any).open = jest.fn();
    global.fetch = jest.fn();
  });

  describe('Rendering Base', () => {
    it('renderizza titolo, label e valore base', () => {
      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByText('Dettaglio transazione')).toBeInTheDocument();
      expect(screen.getByText('Elettrodomestico')).toBeInTheDocument();
      expect(screen.getByText('formatted-Prodotto di test')).toBeInTheDocument();
      expect(screen.getByText('Numero fattura')).toBeInTheDocument();
      expect(screen.getByTestId('btn-test')).toBeInTheDocument();
      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('renderizza senza title prop', () => {
      render(
        <InvoiceDetail
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('renderizza con children prop', () => {
      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        >
          <div data-testid="children-element">Children Content</div>
        </InvoiceDetail>
      );

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('gestisce liste items vuote', () => {
      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={[]}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByText('Numero fattura')).toBeInTheDocument();
    });
  });

  describe('Status Labels', () => {
    it('mostra etichette di nota di credito se status è REFUNDED', () => {
      const refundedValues = {
        ...baseItemValues,
        status: 'REFUNDED',
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={refundedValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByText('Numero nota di credito')).toBeInTheDocument();
      expect(screen.getByText('Nota di credito')).toBeInTheDocument();
    });

    it('mostra etichette di fattura se status NON è REFUNDED', () => {
      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByText('Numero fattura')).toBeInTheDocument();
      expect(screen.getByText('Fattura')).toBeInTheDocument();
    });
  });

  describe('Download File - PDF', () => {
    it('scarica file PDF con successo', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
      };

      (downloadInvoiceFile as jest.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.pdf',
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      const button = screen.getByTestId('btn-test');
      fireEvent.click(button);

      expect(screen.getByTestId('item-loader')).toBeInTheDocument();

      await waitFor(() => {
        expect(downloadInvoiceFile).toHaveBeenCalledWith('trx-1', 'pos-1');
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('https://example.com/invoice.pdf', {
          method: 'GET',
        });
      });
    });

    it('setta il titolo della finestra PDF quando window.open non è null', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
      };

      const mockWindow = {
        document: { title: '' },
      };

      (downloadInvoiceFile as jest.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.pdf',
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      (window as any).open = jest.fn().mockReturnValueOnce(mockWindow);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      const button = screen.getByTestId('btn-test');

      await act(async () => {
        fireEvent.click(button);
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(mockWindow.document.title).toBe('fattura.pdf');
    });

    it('gestisce il caso quando window.open ritorna null', async () => {
      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
      };

      (downloadInvoiceFile as jest.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.pdf',
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      (window as any).open = jest.fn().mockReturnValueOnce(null);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      const button = screen.getByTestId('btn-test');
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Download File - XML', () => {
    it('scarica file XML con successo', async () => {
      const xmlItemValues = {
        ...baseItemValues,
        invoiceData: {
          docNumber: 'DOC-124',
          filename: 'fattura.xml',
        },
      };

      const mockBlob = new Blob(['xml content'], { type: 'application/xml' });
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
      };

      (downloadInvoiceFile as jest.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.xml',
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={xmlItemValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      const button = screen.getByTestId('btn-test');
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Download File - Error Handling', () => {
    it('mostra errore quando il fetch della fattura fallisce', async () => {
      (downloadInvoiceFile as jest.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.pdf',
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
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

    it('mostra errore per estensione file non supportata', async () => {
      const unsupportedValues = {
        ...baseItemValues,
        invoiceData: {
          docNumber: 'DOC-125',
          filename: 'fattura.txt',
        },
      };

      (downloadInvoiceFile as jest.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.txt',
      });

      const mockBlob = new Blob(['content'], { type: 'text/plain' });
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={unsupportedValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
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

    it('gestisce filename mancante nell\'invoiceData durante download', async () => {
      const noFilenameValues = {
        ...baseItemValues,
        invoiceData: {
          docNumber: 'DOC-126',
        },
      };

      (downloadInvoiceFile as jest.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.pdf',
      });

      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={noFilenameValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
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

    it('gestisce eccezione nel download', async () => {
      (downloadInvoiceFile as jest.Mock).mockRejectedValueOnce(
        new Error('download error')
      );

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
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

    it('carica il loader durante il download', async () => {
      const mockPromise = new Promise(() => {});

      (downloadInvoiceFile as jest.Mock).mockReturnValueOnce(mockPromise);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      const button = screen.getByTestId('btn-test');
      fireEvent.click(button);

      expect(screen.getByTestId('item-loader')).toBeInTheDocument();
    });
  });

  describe('Status Chip Display', () => {
    it('mostra lo stato mappato nella StatusChip', () => {
      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={{ ...baseItemValues, rewardBatchTrxStatus: RewardBatchTrxStatusEnum.APPROVED }}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByTestId('status-chip')).toBeInTheDocument();
    });

    it('renderizza StatusChip con status SUSPENDED', () => {
      const suspendedValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.SUSPENDED,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={suspendedValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByTestId('status-chip')).toBeInTheDocument();
    });

    it('renderizza StatusChip con status REJECTED', () => {
      const rejectedValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.REJECTED,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={rejectedValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByTestId('status-chip')).toBeInTheDocument();
    });
  });

  describe('Rejection Reason Display', () => {
    it('mostra nota ufficiale quando status è SUSPENDED', () => {
      const suspendedValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.SUSPENDED,
        rewardBatchRejectionReason: 'Motivo ufficiale di sospensione',
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={suspendedValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByText('nota ufficiale')).toBeInTheDocument();
      expect(screen.getByText('Motivo ufficiale di sospensione')).toBeInTheDocument();
    });

    it('mostra nota ufficiale quando status è REJECTED', () => {
      const rejectedValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.REJECTED,
        rewardBatchRejectionReason: 'Motivo di rifiuto',
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={rejectedValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByText('nota ufficiale')).toBeInTheDocument();
      expect(screen.getByText('Motivo di rifiuto')).toBeInTheDocument();
    });

    it('non mostra nota ufficiale quando status non è SUSPENDED o REJECTED', () => {
      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.queryByText('nota ufficiale')).not.toBeInTheDocument();
    });

    it('mostra placeholder quando rewardBatchRejectionReason è mancante', () => {
      const noReasonValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.REJECTED,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={noReasonValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByText('nota ufficiale')).toBeInTheDocument();
    });
  });

  describe('Value Formatting', () => {
    it('formatta correttamente i valori di tipo Currency', () => {
      const itemValuesWithAmount = {
        ...baseItemValues,
        amount: 10000,
      };

      const listWithCurrency = [
        {
          id: 'amount',
          label: 'Importo',
          type: 'Currency',
        },
      ];

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={itemValuesWithAmount}
          listItem={listWithCurrency}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByText('Importo')).toBeInTheDocument();
    });

    it('formatta correttamente i valori di tipo Text', () => {
      const itemValuesWithText = {
        ...baseItemValues,
        description: 'Test Description',
      };

      const listWithText = [
        {
          id: 'description',
          label: 'Descrizione',
          type: 'Text',
        },
      ];

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={itemValuesWithText}
          listItem={listWithText}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByText('Descrizione')).toBeInTheDocument();
    });

    it('gestisce tipo errato nel getValueText', () => {
      const itemValuesWithInvalidType = {
        ...baseItemValues,
        field: 'value',
      };

      const listWithInvalidType = [
        {
          id: 'field',
          label: 'Campo',
          type: 'InvalidType',
        },
      ];

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={itemValuesWithInvalidType}
          listItem={listWithInvalidType}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByText('error on type')).toBeInTheDocument();
    });

    it('usa il formato custom quando fornito nella config', () => {
      const customListItem = [
        {
          id: 'customField',
          label: 'Custom Field',
          format: (value: string) => `CUSTOM-${value}`,
        },
      ];

      const itemValuesWithCustom = {
        ...baseItemValues,
        customField: 'test',
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={itemValuesWithCustom}
          listItem={customListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByText('CUSTOM-test')).toBeInTheDocument();
    });
  });

  describe('Missing Data Handling', () => {
    it('gestisce valore mancante in itemValues', () => {
      const incompleteValues = {
        ...baseItemValues,
        additionalProperties: {},
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={incompleteValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('mostra placeholder quando docNumber è mancante', () => {
      const noDocNumberValues = {
        ...baseItemValues,
        invoiceData: {
          filename: 'fattura.pdf',
        },
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={noDocNumberValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      expect(screen.getByText('Numero fattura')).toBeInTheDocument();
    });

    it('mostra placeholder quando filename è mancante nel render', () => {
      const noFilenameValues = {
        ...baseItemValues,
        invoiceData: {
          docNumber: 'DOC-123',
        },
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={noFilenameValues}
          listItem={baseListItem}
          batchId=""
          storeId=""
        />
      );

      const button = screen.getByTestId('btn-test');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Redux Initialization - useEffect', () => {
    it('inizializza initiativeId da Redux quando disponibile', () => {
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: new Date('2025-12-31'),
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('inizializza initiativeEndDate da Redux quando disponibile', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 2);

      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('gestisce Redux state vuoto senza crashes', () => {
      (useAppSelector as jest.Mock).mockReturnValue([]);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('gestisce Redux state con endDate undefined', () => {
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('gestisce Redux state con initiativeId undefined', () => {
      const mockInitiatives = [
        {
          endDate: new Date('2025-12-31'),
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('aggiorna stato quando Redux state cambia', () => {
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: new Date('2025-12-31'),
        },
      ];

      const { rerender } = render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

      rerender(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });
  });

  describe('Modal Visibility', () => {
    it('mostra il modal quando status è CONSULTABLE', () => {
      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.getByText('Sposta al mese successivo')).toBeInTheDocument();
    });

    it('non mostra il modal quando status non è CONSULTABLE', () => {
      const approvedValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.APPROVED,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={approvedValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.queryByText('Sposta al mese successivo')).not.toBeInTheDocument();
    });

    it('apre il modal quando si clicca il bottone', async () => {
      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 2);

      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });
    });

    it('chiude il modal quando si clicca il bottone Indietro', async () => {
      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 2);

      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Indietro');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
      });
    });

    it('mostra corretto titolo nel modal', async () => {
      const futureDate = new Date('2025-12-31');
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      expect(
        screen.getByText('pages.purchaseManagement.refundTransactionModal.title')
      ).toBeInTheDocument();
    });

    it('mostra corretto testo descrittivo nel modal', async () => {
      const futureDate = new Date('2025-12-31');
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      expect(
        screen.getByText('pages.purchaseManagement.refundTransactionModal.description')
      ).toBeInTheDocument();
    });

    it('chiude modal quando si clicca sul backdrop', async () => {
      const futureDate = new Date('2025-12-31');
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      const modal = screen.getByTestId('modal-component');
      fireEvent.click(modal);

      await waitFor(() => {
        expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
      });
    });

    it('entrambi i bottoni hanno le varianti corrette', async () => {
      const futureDate = new Date('2025-12-31');
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Indietro' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Conferma' })).toBeInTheDocument();
    });
  });

  describe('Postpone Transaction Logic', () => {
    it('disabilita il bottone quando isNextMonthDisabled è true', () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);

      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: pastDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByRole('button', { name: 'Sposta al mese successivo' });
      expect(button).toBeDisabled();
    });

    it('abilita il bottone quando isNextMonthDisabled è false', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 2);

      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByRole('button', { name: 'Sposta al mese successivo' });
      expect(button).not.toBeDisabled();
    });

    it('chiama postponeTransaction con i parametri corretti', async () => {
      const futureDate = new Date('2025-12-31');
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);
      (postponeTransaction as jest.Mock).mockResolvedValueOnce({ success: true });

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Conferma');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(postponeTransaction).toHaveBeenCalledWith(
          'init-123',
          'batch-1',
          'trx-1',
          expect.any(String)
        );
      });
    });

    it('mostra alert di successo dopo postponeTransaction riuscito', async () => {
      const futureDate = new Date('2025-12-31');
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);
      (postponeTransaction as jest.Mock).mockResolvedValueOnce({ success: true });

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Conferma');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockSetAlert).toHaveBeenCalledWith({
          title: 'Successo',
          text: 'Transazione spostata al mese successivo',
          isOpen: true,
          severity: 'success',
        });
      });
    });

    it('chiude il modal dopo successo del postpone', async () => {
      const futureDate = new Date('2025-12-31');
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);
      (postponeTransaction as jest.Mock).mockResolvedValueOnce({ success: true });

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Conferma');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
      });
    });

    it('mostra alert di errore quando postponeTransaction fallisce', async () => {
      const futureDate = new Date('2025-12-31');
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);
      (postponeTransaction as jest.Mock).mockRejectedValueOnce(
        new Error('postpone error')
      );

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
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

    it('gestisce il caso quando initiativeEndDate è undefined nel postpone', async () => {
      (useAppSelector as jest.Mock).mockReturnValue([]);

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByRole('button', { name: 'Sposta al mese successivo' });
      expect(button).toBeDisabled();
    });

    it('mostra loader durante postponeTransaction', async () => {
      const futureDate = new Date('2025-12-31');
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);
      const mockPromise = new Promise(() => {});
      (postponeTransaction as jest.Mock).mockReturnValueOnce(mockPromise);

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Conferma');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const confButton = screen.getByText('Conferma');
        expect(confButton).toHaveProperty('disabled', true);
      });
    });

    it('non chiama postponeTransaction se initiativeEndDate è null', async () => {
      (useAppSelector as jest.Mock).mockReturnValue([]);

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByRole('button', { name: 'Sposta al mese successivo' });
      expect(button).toBeDisabled();
      expect(postponeTransaction).not.toHaveBeenCalled();
    });

    it('converte la data ISO string correttamente nel postpone', async () => {
      const futureDate = new Date('2025-12-31T23:59:59');
      const mockInitiatives = [
        {
          initiativeId: 'init-456',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);
      (postponeTransaction as jest.Mock).mockResolvedValueOnce({ success: true });

      const consultableValues = {
        ...baseItemValues,
        id: 'trx-999',
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-999"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Conferma');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(postponeTransaction).toHaveBeenCalledWith(
          'init-456',
          'batch-999',
          'trx-999',
          expect.stringContaining('T')
        );
      });
    });
  });

  describe('getNestedValue Function', () => {
    it('estrae correttamente valori annidati semplici', () => {
      const itemValues = {
        ...baseItemValues,
        level1: {
          level2: 'valore',
        },
      };

      const customListItem = [
        {
          id: 'level1.level2',
          label: 'Nested Value',
          type: 'Text',
        },
      ];

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={itemValues}
          listItem={customListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.getByText('Nested Value')).toBeInTheDocument();
    });

    it('estrae correttamente valori annidati profundi', () => {
      const itemValues = {
        ...baseItemValues,
        data: {
          nested: {
            deep: {
              value: 'profondo',
            },
          },
        },
      };

      const customListItem = [
        {
          id: 'data.nested.deep.value',
          label: 'Deep Value',
          type: 'Text',
        },
      ];

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={itemValues}
          listItem={customListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.getByText('Deep Value')).toBeInTheDocument();
    });

    it('gestisce path mancante nel getNestedValue', () => {
      const itemValues = {
        ...baseItemValues,
      };

      const customListItem = [
        {
          id: 'nonexistent.path.value',
          label: 'Missing Value',
          type: 'Text',
        },
      ];

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={itemValues}
          listItem={customListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.getByText('Missing Value')).toBeInTheDocument();
    });

    it('gestisce null nel percorso annidato', () => {
      const itemValues = {
        ...baseItemValues,
        level1: null,
      };

      const customListItem = [
        {
          id: 'level1.level2.value',
          label: 'Null Path Value',
          type: 'Text',
        },
      ];

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={itemValues}
          listItem={customListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.getByText('Null Path Value')).toBeInTheDocument();
    });

    it('estrae correttamente con path di una sola parte', () => {
      const itemValues = {
        ...baseItemValues,
        simpleField: 'valore semplice',
      };

      const customListItem = [
        {
          id: 'simpleField',
          label: 'Simple Field',
          type: 'Text',
        },
      ];

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={itemValues}
          listItem={customListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.getByText('Simple Field')).toBeInTheDocument();
    });
  });

  describe('Edge Cases e Comportamenti Finali', () => {
    it('gestisce batchId vuoto nel postpone', async () => {
      const futureDate = new Date('2025-12-31');
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);
      (postponeTransaction as jest.Mock).mockResolvedValueOnce({ success: true });

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId=""
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Conferma');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(postponeTransaction).toHaveBeenCalledWith(
          'init-123',
          '',
          'trx-1',
          expect.any(String)
        );
      });
    });

    it('mantiene lo stato del loading quando postponeTransaction è in corso', async () => {
      const futureDate = new Date('2025-12-31');
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);
      const mockPromise = new Promise(resolve => setTimeout(resolve, 100));
      (postponeTransaction as jest.Mock).mockReturnValueOnce(mockPromise);

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Conferma');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const confBtn = screen.getByText('Conferma');
        expect(confBtn).toHaveProperty('disabled', true);
      });
    });

    it('gestisce multiple click sul bottone durante il loading', async () => {
      const futureDate = new Date('2025-12-31');
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);
      const mockPromise = new Promise(resolve => setTimeout(resolve, 100));
      (postponeTransaction as jest.Mock).mockReturnValueOnce(mockPromise);

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Conferma');
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);

      expect(postponeTransaction).toHaveBeenCalledTimes(1);
    });

    it('ripristina loading a false dopo errore', async () => {
      const futureDate = new Date('2025-12-31');
      const mockInitiatives = [
        {
          initiativeId: 'init-123',
          endDate: futureDate,
        },
      ];

      (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);
      (postponeTransaction as jest.Mock).mockRejectedValueOnce(
        new Error('postpone error')
      );

      const consultableValues = {
        ...baseItemValues,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
      };

      render(
        <InvoiceDetail
          title="Dettaglio transazione"
          itemValues={consultableValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      const button = screen.getByText('Sposta al mese successivo');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Conferma');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockSetAlert).toHaveBeenCalled();
      });
    });
  });
});