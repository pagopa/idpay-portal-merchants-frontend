import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvoiceDetail from '../InvoiceDetail';
import * as formatUtils from '../../../../utils/formatUtils';
import { RewardBatchTrxStatusEnum } from '../../../../api/generated/merchants/RewardBatchTrxStatus';
import { useHistory, useLocation } from 'react-router-dom';

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

// jest.mock('../../../../components/modal/ModalComponent', () => (props: any) =>
//     props.open ? (
//         <div data-testid="modal-component">
//             {props.children}
//         </div>
//     ) : null
// );

jest.mock('../../../../hooks/useAlert', () => ({
    useAlert: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockUseLocation = { state: { store: { status: 'CREATED', month: (new Date('2026-02-15')).toISOString().split('T')[0] } } };
const pushMock = jest.fn();
const mockUseHistory = jest.fn()

jest.mock('../../../../redux/hooks', () => ({
    useAppSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
    useHistory: () => mockUseHistory()
}));

jest.mock('../../../../redux/slices/initiativesSlice', () => ({
    intiativesListSelector: (state: any) => state,
}));

jest.mock('../../../../utils/formatUtils', () => ({
    ...jest.requireActual('../../../../utils/formatUtils'),
    formatValues: jest.fn((val: string) => `formatted-${val}`),
    currencyFormatter: jest.fn((val: number) => ({ toString: () => `€${val.toFixed(2)}` }))
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
        mockUseHistory.mockReturnValue({ push: pushMock, location: { pathname: '/merchants/merchant-1/refunds', state: {} }});
        (useStore as jest.Mock).mockReturnValue({ storeId: 'STORE_ID' });
        (useAlert as jest.Mock).mockReturnValue({ setAlert: mockSetAlert });
        (useLocation as jest.Mock).mockReturnValue(mockUseLocation);
        (useAppSelector as jest.Mock).mockReset();
        (window as any).open = jest.fn();
        global.fetch = jest.fn();
    });

    describe('Render component', () => {

        it('should render component', () => {
            (useAppSelector as jest.Mock).mockReturnValue([]);

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
            expect(screen.queryByText('Motivo di rifiuto')).not.toBeInTheDocument();
            expect(screen.queryByText('Nota ufficiale')).not.toBeInTheDocument();
            expect(screen.queryByText('03/02/2026')).not.toBeInTheDocument();
            expect(screen.getByTestId('btn-test')).toBeInTheDocument();
        });
        it('should render component', () => {
            (useAppSelector as jest.Mock).mockReturnValue([])
            render(
                <InvoiceDetail
                    title="Dettaglio transazione"
                    itemValues={{ ...baseItemValues, rewardBatchTrxStatus: 'SUSPENDED' }}
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
            expect(screen.getByText('Nota ufficiale')).toBeInTheDocument();
            expect(screen.getByText('Motivo di rifiuto')).toBeInTheDocument();
            expect(screen.getByText('03/02/2026')).toBeInTheDocument();
            expect(screen.getByTestId('btn-test')).toBeInTheDocument();
        });
    });

    describe('Download File', () => {

        it('should successfully download file', async () => {
            (useAppSelector as jest.Mock).mockReturnValue([]);

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
            (useAppSelector as jest.Mock).mockReturnValue([]);

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

            (useAppSelector as jest.Mock).mockReturnValue([]);

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

            (useAppSelector as jest.Mock).mockReturnValue([]);

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
            (useAppSelector as jest.Mock).mockReturnValue([]);

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

            (useAppSelector as jest.Mock).mockReturnValue([]);

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
            const button = await screen.findByTestId('next-month-btn');

            expect(button).toBeDisabled();
        });

        it('should show success alert', async () => {
            const futureDate = new Date('2026-03-15')
            const mockInitiatives = [
                {
                    initiativeId: 'init-123',
                    endDate: futureDate,
                },
            ];

            (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

            (useLocation as jest.Mock).mockReturnValue(mockUseLocation);

            (postponeTransaction as jest.Mock).mockResolvedValueOnce({ success: true });

            const consultableValues = {
                ...baseItemValues,
                rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
            };
            render(<InvoiceDetail
                title="Dettaglio transazione"
                itemValues={consultableValues}
                listItem={baseListItem}
                batchId="batch-1"
                storeId="store-1"
                isOpen={true}
                setIsOpen={() => { }}
            />
            );
            const button = await screen.findByTestId('next-month-btn');

            await waitFor(() => expect(button).not.toBeDisabled());

            fireEvent.click(button);
            await waitFor(() => {
                expect(screen.getByText('pages.refundRequests.invoiceDetailConfirmModal.title')).toBeInTheDocument();
                expect(screen.getByText('pages.refundRequests.invoiceDetailConfirmModal.description')).toBeInTheDocument();
            });

            const confirmButton = screen.getByText('Conferma');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(mockSetAlert).toHaveBeenCalledWith({
                    title: 'Successo',
                    text: 'Transazione spostata al mese successivo',
                    isOpen: true,
                    severity: 'success'
                });
            });
        });

        it('should close modal', async () => {
            const futureDate = new Date('2026-03-15')
            const mockInitiatives = [
                {
                    initiativeId: 'init-123',
                    endDate: futureDate,
                },
            ];

            (useAppSelector as jest.Mock).mockReturnValue(mockInitiatives);

            (useLocation as jest.Mock).mockReturnValue(mockUseLocation);

            (postponeTransaction as jest.Mock).mockResolvedValueOnce({ success: true });

            const consultableValues = {
                ...baseItemValues,
                rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE,
            };

            render(<InvoiceDetail
                title="Dettaglio transazione"
                itemValues={consultableValues}
                listItem={baseListItem}
                batchId="batch-1"
                storeId="store-1"
                isOpen={true}
                setIsOpen={() => { }}
            />
            );
            const button = await screen.findByTestId('next-month-btn');

            await waitFor(() => expect(button).not.toBeDisabled());

            fireEvent.click(button);

            await waitFor(() => {
                expect(screen.getByText('pages.refundRequests.invoiceDetailConfirmModal.title')).toBeInTheDocument();
                expect(screen.getByText('pages.refundRequests.invoiceDetailConfirmModal.description')).toBeInTheDocument();
            });

            const backButton = screen.getByText('Indietro');
            fireEvent.click(backButton);

            await waitFor(() => {
                expect(screen.queryByText('pages.refundRequests.invoiceDetailConfirmModal.title')).not.toBeInTheDocument();
                expect(screen.queryByText('pages.refundRequests.invoiceDetailConfirmModal.description')).not.toBeInTheDocument();
            });
        });

        it('should show error alert', async () => {
            const futureDate = new Date('2026-03-15')
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

            render(<InvoiceDetail
                title="Dettaglio transazione"
                itemValues={consultableValues}
                listItem={baseListItem}
                batchId="batch-1"
                storeId="store-1"
                isOpen={true}
                setIsOpen={() => { }}
            />
            );
            const button = await screen.findByTestId('next-month-btn');

            await waitFor(() => expect(button).not.toBeDisabled());

            fireEvent.click(button);

            await waitFor(() => {
                expect(screen.getByText('pages.refundRequests.invoiceDetailConfirmModal.title')).toBeInTheDocument();
                expect(screen.getByText('pages.refundRequests.invoiceDetailConfirmModal.description')).toBeInTheDocument();
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
    describe('Status Chip Display', () => {
        it('Should show correct StatusChip state', () => {
            render(
                <InvoiceDetail
                    title="Dettaglio transazione"
                    itemValues={{ ...baseItemValues, rewardBatchTrxStatus: RewardBatchTrxStatusEnum.APPROVED }}
                    listItem={baseListItem}
                    batchId=""
                    storeId=""
                    isOpen={true}
                    setIsOpen={() => { }}
                />
            );

            expect(screen.getByTestId('status-chip')).toBeInTheDocument();
        });
    });
    describe('Modify file', () => {
        it('Should navigate', () => {
            render(
                <InvoiceDetail
                    title="Dettaglio transazione"
                    itemValues={{ ...baseItemValues, rewardBatchTrxStatus: RewardBatchTrxStatusEnum.CONSULTABLE, status: "REWARDED" }}
                    listItem={baseListItem}
                    batchId=""
                    storeId=""
                    isOpen={true}
                    setIsOpen={() => { }}
                />
            );
            const button = screen.getByTestId('change-file-btn');
            fireEvent.click(button);
            expect(pushMock).toHaveBeenCalled()
        });
    });
});
