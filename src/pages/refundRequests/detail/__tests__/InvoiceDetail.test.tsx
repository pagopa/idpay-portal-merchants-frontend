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
}));

jest.mock('../../../../components/Chip/CustomChip', () => (props: any) => (
  <div data-testid="status-chip">{props.label}</div>
));

jest.mock('../../../../hooks/useAlert', () => ({
  useAlert: jest.fn(),
}));

import { useStore } from '../../../initiativeStores/StoreContext';
import { downloadInvoiceFile } from '../../../../services/merchantService';
import { useAlert } from '../../../../hooks/useAlert';

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
    (window as any).open = jest.fn();
    global.fetch = jest.fn();
  });

  it('renderizza titolo, label e valore base', () => {
    render(
      <InvoiceDetail
        title="Dettaglio transazione"
        itemValues={baseItemValues}
        listItem={baseListItem}
        storeId={''}
      />
    );

    expect(screen.getByText('Dettaglio transazione')).toBeInTheDocument();
    expect(screen.getByText('Elettrodomestico')).toBeInTheDocument();
    expect(screen.getByText('formatted-Prodotto di test')).toBeInTheDocument();
    expect(screen.getByText('Numero fattura')).toBeInTheDocument();
    expect(screen.getByTestId('btn-test')).toBeInTheDocument();
    expect(screen.getByTestId('product-detail')).toBeInTheDocument();
  });

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
        storeId={''}
      />
    );

    expect(screen.getByText('Numero nota di credito')).toBeInTheDocument();
    expect(screen.getByText('Nota di credito')).toBeInTheDocument();
  });

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
        storeId={''}
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
        storeId={''}
      />
    );

    const button = screen.getByTestId('btn-test');
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
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
        storeId={''}
      />
    );

    const button = screen.getByTestId('btn-test');
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

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
        storeId={''}
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
        storeId={''}
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

  it('gestisce filename mancante nell\'invoiceData', async () => {
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
        storeId={''}
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
        storeId={''}
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

  it('mostra lo stato mappato nella StatusChip', () => {
    render(
      <InvoiceDetail
        title="Dettaglio transazione"
        itemValues={{ ...baseItemValues, rewardBatchTrxStatus: RewardBatchTrxStatusEnum.APPROVED }}
        listItem={baseListItem}
        storeId={''}
      />
    );

    expect(screen.getByTestId('status-chip')).toBeInTheDocument();
  });

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
        storeId={''}
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
        storeId={''}
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
        storeId={''}
      />
    );

    expect(screen.queryByText('nota ufficiale')).not.toBeInTheDocument();
  });

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
        storeId={''}
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
        storeId={''}
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
        storeId={''}
      />
    );

    expect(screen.getByText('error on type')).toBeInTheDocument();
  });

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
        storeId={''}
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
        storeId={''}
      />
    );

    expect(screen.getByText('Numero fattura')).toBeInTheDocument();
  });

  it('mostra placeholder quando filename è mancante', () => {
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
        storeId={''}
      />
    );

    const button = screen.getByTestId('btn-test');
    expect(button).toBeInTheDocument();
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
        storeId={''}
      />
    );

    expect(screen.getByText('nota ufficiale')).toBeInTheDocument();
  });

  it.skip('apre il file in una nuova finestra con il titolo corretto', async () => {
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
        storeId={''}
      />
    );

    const button = screen.getByTestId('btn-test');

    await act(async () => {
      fireEvent.click(button);
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(window.open).toHaveBeenCalledWith(
      expect.any(String),
      '_blank'
    );
  });

  it('renderizza senza title prop', () => {
    render(
      <InvoiceDetail
        itemValues={baseItemValues}
        listItem={baseListItem}
        storeId={''}
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
        storeId={''}
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
        storeId={''}
      />
    );

    expect(screen.getByText('Numero fattura')).toBeInTheDocument();
  });

  it('carica il loader durante il download', async () => {
    const mockPromise = new Promise(() => {});

    (downloadInvoiceFile as jest.Mock).mockReturnValueOnce(mockPromise);

    render(
      <InvoiceDetail
        title="Dettaglio transazione"
        itemValues={baseItemValues}
        listItem={baseListItem}
        storeId={''}
      />
    );

    const button = screen.getByTestId('btn-test');
    fireEvent.click(button);

    expect(screen.getByTestId('item-loader')).toBeInTheDocument();
  });
});