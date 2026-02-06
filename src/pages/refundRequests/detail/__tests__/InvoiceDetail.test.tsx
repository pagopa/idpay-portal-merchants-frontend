import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvoiceDetail from '../InvoiceDetail';
import { RewardBatchTrxStatusEnum } from '../../../../api/generated/merchants/RewardBatchTrxStatus';
import { getEndOfNextMonth } from '../../../../utils/formatUtils';

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

jest.mock('../../../../components/modal/ModalComponent', () => (props: any) =>
  props.open ? (
    <div data-testid="modal-component">
      {props.children}
    </div>
  ) : null
);
jest.mock('../../../../hooks/useAlert', () => ({
    useAlert: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn()
}));

const mockUseLocation = { state: { store: { status: 'CREATED' } } };

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
import { useLocation } from 'react-router-dom';

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
        rewardBatchRejectionReason: [{ date: new Date('2026-02-03'), reason: 'Motivo di rifiuto' }],
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
        (useLocation as jest.Mock).mockReturnValue(mockUseLocation);
        (window as any).open = jest.fn();
        global.fetch = jest.fn();
    });

    describe('Render component', () => {
        it('should render component', () => {
            render(
                <InvoiceDetail
                    title="Dettaglio transazione"
                    itemValues={baseItemValues}
                    listItem={baseListItem}
                    batchId=""
                    storeId=""
                    isOpen={true}
                    setIsOpen={() => { }}
                />
            );

            expect(screen.getByText('Dettaglio transazione')).toBeInTheDocument();
            expect(screen.getByText('Elettrodomestico')).toBeInTheDocument();
            expect(screen.getByText('formatted-Prodotto di test')).toBeInTheDocument();
            expect(screen.getByText('Numero fattura')).toBeInTheDocument();
            expect(screen.getByTestId('btn-test')).toBeInTheDocument();
        });
    });

    describe('Download File', () => {
        it('should successfully download file', async () => {
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
                    isOpen={true}
                    setIsOpen={() => { }}
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
        it('should handle fetch fail', async () => {
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
                    isOpen={true}
                    setIsOpen={() => { }}
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

        it('should handle wrong exstension', async () => {
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
                    isOpen={true}
                    setIsOpen={() => { }}
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

        it('should handle missing file', async () => {
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
                    isOpen={true}
                    setIsOpen={() => { }}
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

        it('should handle error', async () => {
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
                    isOpen={true}
                    setIsOpen={() => { }}
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

        it('should show loader', async () => {
            const mockPromise = new Promise(() => { });

            (downloadInvoiceFile as jest.Mock).mockReturnValueOnce(mockPromise);

            render(
                <InvoiceDetail
                    title="Dettaglio transazione"
                    itemValues={baseItemValues}
                    listItem={baseListItem}
                    batchId=""
                    storeId=""
                    isOpen={true}
                    setIsOpen={() => { }}
                />
            );

            const button = screen.getByTestId('btn-test');
            fireEvent.click(button);

            expect(screen.getByTestId('item-loader')).toBeInTheDocument();
        });
    });

    describe('Postpone Transaction Logic', () => {
        it('should disable button when isNextMonthDisabled is true', () => {
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
                    isOpen={true}
                    setIsOpen={() => { }}
                />
            );

            const button = screen.getByTestId('next-month-btn');
            expect(button).toBeDisabled();
        });

        it.skip('should show success alert', async () => {
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 1)
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
                    isOpen={true}
                    setIsOpen={() => { }}
                />
            );

            const button = screen.getByTestId('next-month-btn');
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

        it.skip('should show error alert', async () => {
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 1)
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
                    isOpen={true}
                    setIsOpen={() => { }}
                />
            );

            const button = screen.getByTestId('next-month-btn');
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
    });
});
