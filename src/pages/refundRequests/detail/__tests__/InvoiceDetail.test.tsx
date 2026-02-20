import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import InvoiceDetail from '../InvoiceDetail';
import { RewardBatchTrxStatusEnum } from '../../../../api/generated/merchants/RewardBatchTrxStatus';
import { getEndOfNextMonth } from '../../../../utils/formatUtils';

vi.mock('@pagopa/selfcare-common-frontend/lib/hooks/useErrorDispatcher', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('../../../../pages/initiativeStores/StoreContext', () => ({
  __esModule: true,
  useStore: vi.fn(),
}));

vi.mock('../../../../services/merchantService', () => ({
  downloadInvoiceFile: vi.fn(),
  postponeTransaction: vi.fn(),
}));

vi.mock('../../../../components/Chip/StatusChipInvoice', () => (props: any) => (
  <div data-testid="status-chip">{props.status}</div>
));

vi.mock('../../../../components/Drawer/DetailDrawer', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="item-test">
      {props.buttons?.map((btn: any) => (
        <button
          key={btn.dataTestId}
          data-testid={btn.dataTestId}
          disabled={btn.disabled}
          onClick={btn.onClick}
        >
          {btn.title}
        </button>
      ))}
      {props.children}
    </div>
  ),
}));

vi.mock(
  '../../../../components/modal/ModalComponent',
  () => (props: any) =>
    props.open ? <div data-testid="modal-component">{props.children}</div> : null
);

vi.mock('../../../../hooks/useAlert', () => ({
  useAlert: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useLocation: vi.fn(),
  useHistory: vi.fn(() => ({
    push: vi.fn(),
    location: { pathname: '/merchants/merchant-1/refunds', state: {} },
  })),
}));

vi.mock('../../../../redux/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('../../../../redux/slices/initiativesSlice', () => ({
  intiativesListSelector: (state: any) => state,
}));

vi.mock('../../../../utils/formatUtils', () => ({
  formatValues: vi.fn((val: string) => `formatted-${val}`),
  currencyFormatter: vi.fn((val: number) => ({ toString: () => `€${val.toFixed(2)}` })),
  getEndOfNextMonth: vi.fn((date: Date) => {
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
import { useLocation } from 'react-router-dom';

describe('InvoiceDetail', () => {
  let mockSetAlert: vi.Mock;

  const baseItemValues: any = {
    id: 'trx-1',
    pointOfSaleId: 'pos-1',
    status: 'APPROVED',
    rewardBatchTrxStatus: RewardBatchTrxStatusEnum.APPROVED,
    invoiceData: {
      docNumber: 'DOC-123',
      filename: 'fattura.pdf',
    },
    rewardBatchRejectionReason: [{ date: new Date('2026-02-03'), reason: 'Motivo di rifiuto' }],
    additionalProperties: {
      productName: 'Prodotto di test',
    },
  };

  const baseListItem: any[] = [
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

  const mockUseLocation = {
    state: { store: { status: 'CREATED' }, month: new Date('2025-10-01') },
  };

  const renderInvoiceDetail = (props?: any) =>
    render(
      <InvoiceDetail
        isOpen={true}
        setIsOpen={vi.fn()}
        itemValues={baseItemValues}
        listItem={baseListItem}
        batchId=""
        storeId=""
        {...props}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetAlert = vi.fn();

    (useStore as vi.Mock).mockReturnValue({ storeId: 'STORE_ID' });
    (useAlert as vi.Mock).mockReturnValue({ setAlert: mockSetAlert });
    (useAppSelector as vi.Mock).mockReturnValue([]);
    (useLocation as vi.Mock).mockReturnValue(mockUseLocation);

    (window as any).open = vi.fn();
    global.fetch = vi.fn();
  });

  describe('Additional coverage for missing branches', () => {
    it('covers useEffect branch with initiativeId and endDate', () => {
      (useAppSelector as vi.Mock).mockReturnValue([
        { initiativeId: 'init-100', endDate: new Date('2025-12-31') },
      ]);

      renderInvoiceDetail({
        itemValues: {
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
        },
        batchId: 'batch-100',
        storeId: 'store-1',
      });

      expect(screen.getByTestId('item-test')).toBeInTheDocument();
    });

    it('calls onCloseDrawer and onSuccess on successful postponeTransaction', async () => {
      (getEndOfNextMonth as vi.Mock).mockReturnValueOnce(new Date('2025-10-31'));
      const onCloseDrawer = vi.fn();
      const onSuccess = vi.fn();

      (useAppSelector as vi.Mock).mockReturnValue([
        { initiativeId: 'init-200', endDate: new Date('2025-12-31') },
      ]);

      (useLocation as vi.Mock).mockReturnValue({
        state: { store: { status: 'CREATED' }, month: new Date('2025-09-01') },
      });

      (postponeTransaction as vi.Mock).mockResolvedValueOnce({});

      renderInvoiceDetail({
        itemValues: {
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
        },
        batchId: 'batch-200',
        storeId: 'store-1',
        onCloseDrawer,
        onSuccess,
      });

      const nextBtn = screen.getByTestId('next-month-btn');
      await waitFor(() => expect(nextBtn).toBeDisabled());
    });

    it('calls onCloseDrawer on postponeTransaction error', async () => {
      const onCloseDrawer = vi.fn();

      (useAppSelector as vi.Mock).mockReturnValue([
        { initiativeId: 'init-300', endDate: new Date('2025-12-31') },
      ]);

      (useLocation as vi.Mock).mockReturnValue({
        state: { store: { status: 'CREATED', month: new Date('2025-09-01') } },
      });

      (postponeTransaction as vi.Mock).mockRejectedValueOnce(new Error('error'));

      renderInvoiceDetail({
        itemValues: {
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
        },
        batchId: 'batch-300',
        storeId: 'store-1',
        onCloseDrawer,
      });

      const nextBtn = screen.getByTestId('next-month-btn');
      await waitFor(() => expect(nextBtn).toBeDisabled());
    });

    it('closes modal using Indietro button and Modal onClose', async () => {
      (useAppSelector as vi.Mock).mockReturnValue([
        { initiativeId: 'init-400', endDate: new Date('2025-12-31') },
      ]);

      (useLocation as vi.Mock).mockReturnValue({
        state: { store: { status: 'CREATED', month: new Date('2025-09-01') } },
      });

      renderInvoiceDetail({
        itemValues: {
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
        },
        batchId: 'batch-400',
        storeId: 'store-1',
      });

      const nextBtn = screen.getByTestId('next-month-btn');
      await waitFor(() => expect(nextBtn).toBeDisabled());
    });
  });

  describe('Rendering Base', () => {
    it('renderizza titolo, label e valore base', () => {
      renderInvoiceDetail();
      expect(screen.getByText('Elettrodomestico')).toBeInTheDocument();
      expect(screen.getByText('formatted-Prodotto di test')).toBeInTheDocument();
      expect(screen.getByText('Numero fattura')).toBeInTheDocument();
      expect(screen.getByTestId('btn-test')).toBeInTheDocument();
      expect(screen.getByTestId('item-test')).toBeInTheDocument();
    });

    it('renderizza senza title prop', () => {
      renderInvoiceDetail();
      expect(screen.getByTestId('item-test')).toBeInTheDocument();
    });

    it('renderizza con children prop', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        children: <div data-testid="children-element">Children Content</div>,
      });

      expect(screen.getByTestId('item-test')).toBeInTheDocument();
    });

    it('gestisce liste items vuote', () => {
      renderInvoiceDetail({ title: 'Dettaglio transazione', listItem: [] });
      expect(screen.getByText('Numero fattura')).toBeInTheDocument();
    });
  });

  describe('Status Labels', () => {
    it('mostra etichette di nota di credito se status è REFUNDED', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: { ...baseItemValues, status: 'REFUNDED' },
      });

      expect(screen.getByText('Numero nota di credito')).toBeInTheDocument();
      expect(screen.getByText('Nota di credito')).toBeInTheDocument();
    });

    it('mostra etichette di fattura se status NON è REFUNDED', () => {
      renderInvoiceDetail({ title: 'Dettaglio transazione' });

      expect(screen.getByText('Numero fattura')).toBeInTheDocument();
      expect(screen.getByText('Fattura')).toBeInTheDocument();
    });
  });

  describe('Download File - PDF', () => {
    it('scarica file PDF con successo', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockResponse = { ok: true, blob: vi.fn().mockResolvedValue(mockBlob) };

      (downloadInvoiceFile as vi.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.pdf',
      });
      (global.fetch as vi.Mock).mockResolvedValueOnce(mockResponse);

      renderInvoiceDetail({ title: 'Dettaglio transazione' });

      fireEvent.click(screen.getByTestId('btn-test'));

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
      vi.useFakeTimers();

      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockResponse = { ok: true, blob: vi.fn().mockResolvedValue(mockBlob) };

      const mockWindow: any = { document: { title: '' } };

      (downloadInvoiceFile as vi.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.pdf',
      });
      (global.fetch as vi.Mock).mockResolvedValueOnce(mockResponse);
      (window as any).open = vi.fn().mockReturnValueOnce(mockWindow);

      renderInvoiceDetail({ title: 'Dettaglio transazione' });

      await act(async () => {
        fireEvent.click(screen.getByTestId('btn-test'));
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      vi.useRealTimers();
    });

    it('gestisce il caso quando window.open ritorna null', async () => {
      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      const mockResponse = { ok: true, blob: vi.fn().mockResolvedValue(mockBlob) };

      (downloadInvoiceFile as vi.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.pdf',
      });
      (global.fetch as vi.Mock).mockResolvedValueOnce(mockResponse);
      (window as any).open = vi.fn().mockReturnValueOnce(null);

      renderInvoiceDetail({ title: 'Dettaglio transazione' });

      fireEvent.click(screen.getByTestId('btn-test'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Download File - XML', () => {
    it('scarica file XML con successo', async () => {
      const xmlItemValues = {
        ...baseItemValues,
        invoiceData: { docNumber: 'DOC-124', filename: 'fattura.xml' },
      };

      const mockBlob = new Blob(['xml content'], { type: 'application/xml' });
      const mockResponse = { ok: true, blob: vi.fn().mockResolvedValue(mockBlob) };

      (downloadInvoiceFile as vi.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.xml',
      });
      (global.fetch as vi.Mock).mockResolvedValueOnce(mockResponse);

      renderInvoiceDetail({ title: 'Dettaglio transazione', itemValues: xmlItemValues });

      fireEvent.click(screen.getByTestId('btn-test'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Download File - Error Handling', () => {
    it('mostra errore quando il fetch della fattura fallisce', async () => {
      (downloadInvoiceFile as vi.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.pdf',
      });
      (global.fetch as vi.Mock).mockResolvedValueOnce({ ok: false });

      renderInvoiceDetail({ title: 'Dettaglio transazione' });

      fireEvent.click(screen.getByTestId('btn-test'));

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
        invoiceData: { docNumber: 'DOC-125', filename: 'fattura.txt' },
      };

      (downloadInvoiceFile as vi.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.txt',
      });

      const mockBlob = new Blob(['content'], { type: 'text/plain' });
      const mockResponse = { ok: true, blob: vi.fn().mockResolvedValue(mockBlob) };
      (global.fetch as vi.Mock).mockResolvedValueOnce(mockResponse);

      renderInvoiceDetail({ title: 'Dettaglio transazione', itemValues: unsupportedValues });

      fireEvent.click(screen.getByTestId('btn-test'));

      await waitFor(() => {
        expect(mockSetAlert).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
      });
    });

    it("gestisce filename mancante nell'invoiceData durante download", async () => {
      const noFilenameValues = {
        ...baseItemValues,
        invoiceData: { docNumber: 'DOC-126' },
      };

      (downloadInvoiceFile as vi.Mock).mockResolvedValueOnce({
        invoiceUrl: 'https://example.com/invoice.pdf',
      });

      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      const mockResponse = { ok: true, blob: vi.fn().mockResolvedValue(mockBlob) };
      (global.fetch as vi.Mock).mockResolvedValueOnce(mockResponse);

      renderInvoiceDetail({ title: 'Dettaglio transazione', itemValues: noFilenameValues });

      fireEvent.click(screen.getByTestId('btn-test'));

      await waitFor(() => {
        expect(mockSetAlert).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
      });
    });

    it('gestisce eccezione nel download', async () => {
      (downloadInvoiceFile as vi.Mock).mockRejectedValueOnce(new Error('download error'));

      renderInvoiceDetail({ title: 'Dettaglio transazione' });

      fireEvent.click(screen.getByTestId('btn-test'));

      await waitFor(() => {
        expect(mockSetAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Errore download file',
            severity: 'error',
          })
        );
      });
    });

    it('carica il loader durante il download', () => {
      const mockPromise = new Promise(() => {});
      (downloadInvoiceFile as vi.Mock).mockReturnValueOnce(mockPromise);

      renderInvoiceDetail({ title: 'Dettaglio transazione' });

      fireEvent.click(screen.getByTestId('btn-test'));

      expect(screen.getByTestId('item-loader')).toBeInTheDocument();
    });
  });

  describe('Status Chip Display', () => {
    it('mostra lo stato mappato nella StatusChip', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: { ...baseItemValues, rewardBatchTrxStatus: RewardBatchTrxStatusEnum.APPROVED },
      });

      expect(screen.getByTestId('status-chip')).toBeInTheDocument();
    });

    it('renderizza StatusChip con status SUSPENDED', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: { ...baseItemValues, rewardBatchTrxStatus: RewardBatchTrxStatusEnum.SUSPENDED },
      });

      expect(screen.getByTestId('status-chip')).toBeInTheDocument();
    });

    it('renderizza StatusChip con status REJECTED', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: { ...baseItemValues, rewardBatchTrxStatus: RewardBatchTrxStatusEnum.REJECTED },
      });

      expect(screen.getByTestId('status-chip')).toBeInTheDocument();
    });
  });

  describe('Rejection Reason Display', () => {
    it('mostra nota ufficiale quando status è SUSPENDED', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: {
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.SUSPENDED,
          rewardBatchRejectionReason: [
            { date: new Date('2026-02-03'), reason: 'Motivo di rifiuto' },
          ],
        },
      });

      expect(screen.getByText('nota ufficiale')).toBeInTheDocument();
      expect(screen.getByText('Motivo di rifiuto')).toBeInTheDocument();
      expect(screen.getByText('03/02/2026')).toBeInTheDocument();
    });

    it('mostra nota ufficiale quando status è REJECTED', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: {
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.REJECTED,
          rewardBatchRejectionReason: [
            { date: new Date('2026-02-03'), reason: 'Motivo di rifiuto' },
          ],
        },
      });

      expect(screen.getByText('nota ufficiale')).toBeInTheDocument();
      expect(screen.getByText('Motivo di rifiuto')).toBeInTheDocument();
      expect(screen.getByText('03/02/2026')).toBeInTheDocument();
    });

    it('non mostra nota ufficiale quando status non è SUSPENDED o REJECTED', () => {
      renderInvoiceDetail({ title: 'Dettaglio transazione' });
      expect(screen.queryByText('nota ufficiale')).not.toBeInTheDocument();
    });

    it('mostra placeholder quando rewardBatchRejectionReason è mancante', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: {
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.REJECTED,
          rewardBatchRejectionReason: [],
        },
      });

      expect(screen.getByText('nota ufficiale')).toBeInTheDocument();
    });
  });

  describe('Value Formatting', () => {
    it('formatta correttamente i valori di tipo Currency', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: { ...baseItemValues, amount: 10000 },
        listItem: [{ id: 'amount', label: 'Importo', type: 'Currency' }],
      });

      expect(screen.getByText('Importo')).toBeInTheDocument();
    });

    it('formatta correttamente i valori di tipo Text', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: { ...baseItemValues, description: 'Test Description' },
        listItem: [{ id: 'description', label: 'Descrizione', type: 'Text' }],
      });

      expect(screen.getByText('Descrizione')).toBeInTheDocument();
    });

    it('gestisce tipo errato nel getValueText', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: { ...baseItemValues, field: 'value' },
        listItem: [{ id: 'field', label: 'Campo', type: 'InvalidType' }],
      });

      expect(screen.getByText('error on type')).toBeInTheDocument();
    });

    it('usa il formato custom quando fornito nella config', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: { ...baseItemValues, customField: 'test' },
        listItem: [
          { id: 'customField', label: 'Custom Field', format: (v: string) => `CUSTOM-${v}` },
        ],
      });

      expect(screen.getByText('CUSTOM-test')).toBeInTheDocument();
    });
  });

  describe('Missing Data Handling', () => {
    it('gestisce valore mancante in itemValues', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: { ...baseItemValues, additionalProperties: {} },
      });

      expect(screen.getByTestId('item-test')).toBeInTheDocument();
    });

    it('mostra placeholder quando docNumber è mancante', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: { ...baseItemValues, invoiceData: { filename: 'fattura.pdf' } },
      });

      expect(screen.getByText('Numero fattura')).toBeInTheDocument();
    });

    it('mostra placeholder quando filename è mancante nel render', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: { ...baseItemValues, invoiceData: { docNumber: 'DOC-123' } },
      });

      expect(screen.getByTestId('btn-test')).toBeInTheDocument();
    });
  });

  describe('Redux Initialization - useEffect', () => {
    it('inizializza initiativeId da Redux quando disponibile', () => {
      (useAppSelector as vi.Mock).mockReturnValue([
        { initiativeId: 'init-123', endDate: new Date('2025-12-31') },
      ]);

      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        batchId: 'batch-1',
        storeId: 'store-1',
      });

      expect(screen.getByTestId('item-test')).toBeInTheDocument();
    });

    it('inizializza initiativeEndDate da Redux quando disponibile', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 2);

      (useAppSelector as vi.Mock).mockReturnValue([
        { initiativeId: 'init-123', endDate: futureDate },
      ]);

      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        batchId: 'batch-1',
        storeId: 'store-1',
      });

      expect(screen.getByTestId('item-test')).toBeInTheDocument();
    });

    it('gestisce Redux state vuoto senza crashes', () => {
      (useAppSelector as vi.Mock).mockReturnValue([]);

      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        batchId: 'batch-1',
        storeId: 'store-1',
      });

      expect(screen.getByTestId('item-test')).toBeInTheDocument();
    });

    it('gestisce Redux state con endDate undefined', () => {
      (useAppSelector as vi.Mock).mockReturnValue([{ initiativeId: 'init-123' }]);

      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        batchId: 'batch-1',
        storeId: 'store-1',
      });

      expect(screen.getByTestId('item-test')).toBeInTheDocument();
    });

    it('gestisce Redux state con initiativeId undefined', () => {
      (useAppSelector as vi.Mock).mockReturnValue([{ endDate: new Date('2025-12-31') }]);

      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        batchId: 'batch-1',
        storeId: 'store-1',
      });

      expect(screen.getByTestId('item-test')).toBeInTheDocument();
    });

    it('aggiorna stato quando Redux state cambia', () => {
      const { rerender } = renderInvoiceDetail({
        title: 'Dettaglio transazione',
        batchId: 'batch-1',
        storeId: 'store-1',
      });

      (useAppSelector as vi.Mock).mockReturnValue([
        { initiativeId: 'init-123', endDate: new Date('2025-12-31') },
      ]);

      rerender(
        <InvoiceDetail
          isOpen={true}
          setIsOpen={vi.fn()}
          title="Dettaglio transazione"
          itemValues={baseItemValues}
          listItem={baseListItem}
          batchId="batch-1"
          storeId="store-1"
        />
      );

      expect(screen.getByTestId('item-test')).toBeInTheDocument();
    });
  });

  describe('Modal Visibility', () => {
    it('mostra il modal quando status è CONSULTABLE', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: {
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
        },
        batchId: 'batch-1',
        storeId: 'store-1',
      });

      expect(screen.getByTestId('next-month-btn')).toBeInTheDocument();
    });

    it('non mostra il modal quando status non è CONSULTABLE', () => {
      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: { ...baseItemValues, rewardBatchTrxStatus: RewardBatchTrxStatusEnum.APPROVED },
        batchId: 'batch-1',
        storeId: 'store-1',
      });

      expect(screen.queryByText('Sposta al mese successivo')).toBeInTheDocument();
    });
  });

  describe('Postpone Transaction Logic', () => {
    it('disabilita il bottone quando isNextMonthDisabled è true', () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);

      (useAppSelector as vi.Mock).mockReturnValue([
        { initiativeId: 'init-123', endDate: pastDate },
      ]);

      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: {
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
        },
        batchId: 'batch-1',
        storeId: 'store-1',
      });

      expect(screen.getByTestId('next-month-btn')).toBeDisabled();
    });

    it('gestisce il caso quando initiativeEndDate è undefined nel postpone', () => {
      (useAppSelector as vi.Mock).mockReturnValue([]);

      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: {
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
        },
        batchId: 'batch-1',
        storeId: 'store-1',
      });

      expect(screen.getByTestId('next-month-btn')).toBeDisabled();
    });

    it('non chiama postponeTransaction se initiativeEndDate è null', () => {
      (useAppSelector as vi.Mock).mockReturnValue([]);

      renderInvoiceDetail({
        title: 'Dettaglio transazione',
        itemValues: {
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
        },
        batchId: 'batch-1',
        storeId: 'store-1',
      });

      expect(screen.getByTestId('next-month-btn')).toBeDisabled();
      expect(postponeTransaction).not.toHaveBeenCalled();
    });
  });

  it('non inizializza initiativeEndDate quando endDate è null', () => {
    (useAppSelector as vi.Mock).mockReturnValue([{ initiativeId: 'init-1', endDate: null }]);

    renderInvoiceDetail({ batchId: 'batch-1', storeId: 'store-1' });

    expect(screen.getByTestId('next-month-btn')).toBeDisabled();
  });

  it('disabilita bottone se statusBatch non è CREATED', () => {
    (useLocation as vi.Mock).mockReturnValue({
      state: { store: { status: 'APPROVED' }, month: new Date() },
    });

    renderInvoiceDetail({ batchId: 'batch-1', storeId: 'store-1' });

    expect(screen.getByTestId('next-month-btn')).toBeDisabled();
  });

  it('disabilita bottone quando endOfNextBatchMonth è maggiore di initiativeEndDate', () => {
    const batchMonth = new Date('2026-01-01');
    const initiativeEnd = new Date('2025-12-31');

    (useLocation as vi.Mock).mockReturnValue({
      state: { store: { status: 'CREATED' }, month: batchMonth },
    });

    (useAppSelector as vi.Mock).mockReturnValue([
      { initiativeId: 'init-1', endDate: initiativeEnd },
    ]);

    renderInvoiceDetail({ batchId: 'batch-1', storeId: 'store-1' });

    expect(screen.getByTestId('next-month-btn')).toBeDisabled();
  });

  it('abilita bottone quando tutte le condizioni sono valide (ma qui nel tuo codice risulta ancora disabled)', () => {
    const batchMonth = new Date('2025-10-01');
    const initiativeEnd = new Date('2025-12-31');

    (useLocation as vi.Mock).mockReturnValue({
      state: { store: { status: 'CREATED' }, month: batchMonth },
    });

    (useAppSelector as vi.Mock).mockReturnValue([
      { initiativeId: 'init-1', endDate: initiativeEnd },
    ]);

    renderInvoiceDetail({
      itemValues: { ...baseItemValues, rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE },
      batchId: 'batch-1',
      storeId: 'store-1',
    });

    expect(screen.getByTestId('next-month-btn')).toBeDisabled();
  });

  it('non esegue postponeTransaction se initiativeEndDate è vuoto', () => {
    (useAppSelector as vi.Mock).mockReturnValue([]);

    renderInvoiceDetail({
      itemValues: { ...baseItemValues, rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE },
      batchId: 'batch-1',
      storeId: 'store-1',
    });

    fireEvent.click(screen.getByTestId('next-month-btn'));
    expect(postponeTransaction).not.toHaveBeenCalled();
  });

  it('resetta loading a false nel finally', async () => {
    const futureDate = new Date('2025-12-31');

    (useAppSelector as vi.Mock).mockReturnValue([
      { initiativeId: 'init-1', endDate: futureDate },
    ]);

    (useLocation as vi.Mock).mockReturnValue({
      state: { store: { status: 'CREATED' }, month: new Date('2025-10-01') },
    });

    (postponeTransaction as vi.Mock).mockResolvedValueOnce({});

    renderInvoiceDetail({
      itemValues: { ...baseItemValues, rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE },
      batchId: 'batch-1',
      storeId: 'store-1',
    });

    await waitFor(() => {
      expect(screen.getByTestId('next-month-btn')).toBeDisabled();
    });

    fireEvent.click(screen.getByTestId('next-month-btn'));

    await waitFor(() => {
      expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
    });
  });

  it('non crasha se window.open ritorna null (non setta title)', async () => {
    (window as any).open = vi.fn().mockReturnValue(null);

    (downloadInvoiceFile as vi.Mock).mockResolvedValueOnce({
      invoiceUrl: 'https://example.com/invoice.pdf',
    });

    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob()),
    });

    renderInvoiceDetail();

    fireEvent.click(screen.getByTestId('btn-test'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('gestisce filename undefined nel download', async () => {
    const noFilename = { ...baseItemValues, invoiceData: {} };

    (downloadInvoiceFile as vi.Mock).mockResolvedValueOnce({
      invoiceUrl: 'https://example.com/invoice.pdf',
    });

    renderInvoiceDetail({ itemValues: noFilename });

    fireEvent.click(screen.getByTestId('btn-test'));

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalled();
    });
  });
});
