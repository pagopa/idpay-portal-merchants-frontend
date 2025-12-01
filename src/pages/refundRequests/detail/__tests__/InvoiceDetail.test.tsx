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

import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { useStore } from '../../../initiativeStores/StoreContext';
import { downloadInvoiceFile } from '../../../../services/merchantService';

describe('InvoiceDetail', () => {
  const addErrorMock = jest.fn();

  const baseItemValues = {
    id: 'trx-1',
    status: 'APPROVED',
    docNumber: 'DOC-123',
    fileName: 'fattura.pdf',
    rewardBatchRejectionReason: 'Motivo di rifiuto',
    additionalProperties: {
      productName: 'Prodotto di test',
    },
  };

  const baseListItem = [
    {
      id: 'additionalProperties.productName',
      label: 'Prodotto',
      format: (value: string) => `formatted-${value}`,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (useStore as jest.Mock).mockReturnValue({ storeId: 'STORE_ID' });
    (useErrorDispatcher as jest.Mock).mockReturnValue(addErrorMock);

    (window as any).open = jest.fn();
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
    expect(screen.getByText('Prodotto')).toBeInTheDocument();
    expect(screen.getByText('formatted-Prodotto di test')).toBeInTheDocument();

    expect(screen.getByText('Numero fattura')).toBeInTheDocument();

    expect(screen.getByTestId('btn-test')).toBeInTheDocument();
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

  it('chiama il servizio di download e apre la finestra al click sul bottone', async () => {
    const promiseResolver: { resolve?: (value: any) => void } = {};

    (downloadInvoiceFile as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        promiseResolver.resolve = resolve;
      })
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

    expect(screen.getByTestId('item-loader')).toBeInTheDocument();

    await act(async () => {
      promiseResolver.resolve?.({ invoiceUrl: 'https://example.com/invoice.pdf' });
    });

    await waitFor(() => {
      expect(downloadInvoiceFile).toHaveBeenCalledWith('trx-1',"");
    });

    await waitFor(() => {
      expect(screen.queryByTestId('item-loader')).toBeInTheDocument();
    });
  });

  it('gestisce l\'errore di download mostrando l\'errore tramite useErrorDispatcher', async () => {
    (downloadInvoiceFile as jest.Mock).mockRejectedValueOnce(new Error('download error'));

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
      expect(addErrorMock).toHaveBeenCalled();
    });

    expect(addErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'FILE_DOWNLOAD',
        displayableTitle: 'Errore downloand file',
      })
    );

    expect(window.open).not.toHaveBeenCalled();
  });

  it('mostra lo stato mappato nella StatusChip', () => {
    render(
      <InvoiceDetail
        title="Dettaglio transazione"
        itemValues={{ ...baseItemValues, status: 'APPROVED' }}
        listItem={baseListItem}
        storeId={''}
      />
    );

    expect(screen.getByTestId('status-chip')).toHaveTextContent('');
  });

  it('mostra "nota ufficiale" e la reason se status è SUSPENDED o REJECTED', () => {
    const suspendedValues = {
      ...baseItemValues,
      status: RewardBatchTrxStatusEnum.SUSPENDED,
      rewardBatchRejectionReason: 'Motivo ufficiale di sospensione',
    };

    render(
      <InvoiceDetail
        title="Dettaglio transazione"
        itemValues={suspendedValues}
        listItem={baseListItem}
        storeId={''}      />
    );

    expect(screen.getByText('Dettaglio transazione')).toBeInTheDocument();
  });
});
