import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import TransactionDetail from '../TransactionDetail';
import { TYPE_TEXT, MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import { StoreProvider } from '../../../pages/initiativeStores/StoreContext';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { downloadInvoiceFile } from '../../../services/merchantService';

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
                            isOpen={true}
                            setIsOpen={() => { }}
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
        expect(screen.getByText('Importo')).toBeInTheDocument();
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
                                isOpen={true}
                                setIsOpen={() => { }}
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
                                isOpen={true}
                                setIsOpen={() => { }}
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
                                isOpen={true}
                                setIsOpen={() => { }}
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
                                isOpen={true}
                                setIsOpen={() => { }}
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
                                isOpen={true}
                                setIsOpen={() => { }}
                            />
                        </ThemeProvider>
                    </StoreProvider>
                </Provider>
            );
            expect(screen.getAllByText(MISSING_DATA_PLACEHOLDER)[0]).toBeInTheDocument();
        });
    });
});
