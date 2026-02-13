import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvoiceDetail from '../InvoiceDetail';
import { RewardBatchTrxStatusEnum } from '../../../../api/generated/merchants/RewardBatchTrxStatus';

jest.mock('../../../../services/merchantService', () => ({
  downloadInvoiceFile: jest.fn(),
  postponeTransaction: jest.fn(),
}));

jest.mock('../../../../hooks/useAlert', () => ({
  useAlert: () => ({
    setAlert: jest.fn(),
  }),
}));

jest.mock('../../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../../../redux/slices/initiativesSlice', () => ({
  intiativesListSelector: (state: any) => state,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useHistory: () => ({
    push: jest.fn(),
    location: { pathname: '/merchant/123' },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../../components/Chip/StatusChipInvoice', () => (props: any) => (
  <div data-testid="status-chip">{props.status}</div>
));

import { downloadInvoiceFile, postponeTransaction } from '../../../../services/merchantService';
import { useAppSelector } from '../../../../redux/hooks';
import { useLocation } from 'react-router-dom';

const baseItemValues = {
  id: 'trx-1',
  pointOfSaleId: 'pos-1',
  status: 'APPROVED',
  rewardBatchTrxStatus: RewardBatchTrxStatusEnum.APPROVED,
  invoiceData: {
    docNumber: 'DOC-123',
    filename: 'fattura.pdf',
  },
  rewardBatchRejectionReason: [],
};

const baseListItem = [
  {
    id: 'status',
    label: 'Status',
    type: 'Text',
  },
];

describe('InvoiceDetail - Updated Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppSelector as jest.Mock).mockReturnValue([]);
    (useLocation as jest.Mock).mockReturnValue({
      state: { store: { status: 'CREATED', month: new Date('2025-10-01') } },
    });
    (window as any).open = jest.fn();
    global.fetch = jest.fn();
  });

  it('renders list items and invoice fields correctly', () => {
    render(
      <InvoiceDetail
        itemValues={baseItemValues}
        listItem={baseListItem}
        batchId="batch-1"
        storeId="store-1"
        isOpen={true}
        setIsOpen={jest.fn()}
      />
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Numero fattura')).toBeInTheDocument();
    expect(screen.getByText('Fattura')).toBeInTheDocument();
    expect(screen.getByTestId('status-chip')).toBeInTheDocument();
  });

  it('shows credit note labels when status is REFUNDED', () => {
    render(
      <InvoiceDetail
        itemValues={{ ...baseItemValues, status: 'REFUNDED' }}
        listItem={baseListItem}
        batchId="batch-1"
        storeId="store-1"
        isOpen={true}
        setIsOpen={jest.fn()}
      />
    );

    expect(screen.getByText('Numero nota di credito')).toBeInTheDocument();
    expect(screen.getByText('Nota di credito')).toBeInTheDocument();
  });

  it('downloads PDF successfully', async () => {
    (downloadInvoiceFile as jest.Mock).mockResolvedValueOnce({
      invoiceUrl: 'http://test.com/file.pdf',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: jest.fn().mockResolvedValue(new Blob()),
    });

    render(
      <InvoiceDetail
        itemValues={baseItemValues}
        listItem={baseListItem}
        batchId="batch-1"
        storeId="store-1"
        isOpen={true}
        setIsOpen={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('btn-test'));

    await waitFor(() => {
      expect(downloadInvoiceFile).toHaveBeenCalledWith('trx-1', 'pos-1');
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('shows error when fetch fails', async () => {
    (downloadInvoiceFile as jest.Mock).mockResolvedValueOnce({
      invoiceUrl: 'http://test.com/file.pdf',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <InvoiceDetail
        itemValues={baseItemValues}
        listItem={baseListItem}
        batchId="batch-1"
        storeId="store-1"
        isOpen={true}
        setIsOpen={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('btn-test'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('renders rejection reason when status is SUSPENDED', () => {
    render(
      <InvoiceDetail
        itemValues={{
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.SUSPENDED,
          rewardBatchRejectionReason: [{ date: new Date('2026-02-03'), reason: 'Motivo' }],
        }}
        listItem={baseListItem}
        batchId="batch-1"
        storeId="store-1"
        isOpen={true}
        setIsOpen={jest.fn()}
      />
    );

    expect(screen.getByText('nota ufficiale')).toBeInTheDocument();
    expect(screen.getByText('Motivo')).toBeInTheDocument();
  });

  it('disables next month button when initiative data missing', () => {
    render(
      <InvoiceDetail
        itemValues={baseItemValues}
        listItem={baseListItem}
        batchId="batch-1"
        storeId="store-1"
        isOpen={true}
        setIsOpen={jest.fn()}
      />
    );

    expect(screen.getByTestId('next-month-btn')).toBeDisabled();
  });

  it('opens modal when next month button clicked and enabled', async () => {
    (useAppSelector as jest.Mock).mockReturnValue([
      {
        initiativeId: 'init-1',
        endDate: new Date('2025-12-31'),
      },
    ]);

    render(
      <InvoiceDetail
        itemValues={{
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
        }}
        listItem={baseListItem}
        batchId="batch-1"
        storeId="store-1"
        isOpen={true}
        setIsOpen={jest.fn()}
      />
    );

    const btn = screen.getByTestId('next-month-btn');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId('modal-component')).toBeInTheDocument();
    });
  });

  it('calls postponeTransaction on confirm', async () => {
    (useAppSelector as jest.Mock).mockReturnValue([
      {
        initiativeId: 'init-1',
        endDate: new Date('2025-12-31'),
      },
    ]);

    (postponeTransaction as jest.Mock).mockResolvedValueOnce({});

    render(
      <InvoiceDetail
        itemValues={{
          ...baseItemValues,
          rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
        }}
        listItem={baseListItem}
        batchId="batch-1"
        storeId="store-1"
        isOpen={true}
        setIsOpen={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('next-month-btn'));

    await waitFor(() => expect(screen.getByTestId('modal-component')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Conferma'));

    await waitFor(() => {
      expect(postponeTransaction).toHaveBeenCalledWith(
        'init-1',
        'batch-1',
        'trx-1',
        expect.any(String)
      );
    });
  });
});
