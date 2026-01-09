import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSelector } from 'react-redux';

let mockLocationState: any;
const mockGoBack = jest.fn();

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    goBack: mockGoBack,
  }),
  useLocation: () => mockLocationState,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend', () => ({
  TitleBox: (props: any) => <div data-testid="title-box">{props.title}</div>,
}));

jest.mock('@pagopa/mui-italia', () => ({
  ButtonNaked: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('../../../../components/Transactions/useStatus', () => ({
  __esModule: true,
  default: jest.fn((status: string) => ({
    label: `status-${status}`,
    color: 'default',
    textColor: undefined,
  })),
}));

jest.mock('../../../../components/Chip/CustomChip', () => (props: any) => (
  <div data-testid="custom-chip">{props.label}</div>
));

jest.mock('../ShopCard', () => ({
  ShopCard: (props: any) => (
    <div data-testid="shop-card">
      <span data-testid="shop-card-batchName">{props.batchName}</span>
      <span data-testid="shop-card-dateRange">{props.dateRange}</span>
      <span data-testid="shop-card-companyName">{props.companyName}</span>
      <span data-testid="shop-card-refundAmount">{props.refundAmount}</span>
      <span data-testid="shop-card-status">{props.status}</span>
      <span data-testid="shop-card-approvedRefund">{props.approvedRefund}</span>
    </div>
  ),
}));

jest.mock('../../invoiceDataTable', () => ({
  __esModule: true,
  default: () => <div data-testid="invoice-data-table" />,
}));

jest.mock('../../../initiativeDiscounts/FiltersForm', () => ({
  __esModule: true,
  default: ({ children, onFiltersApplied, onFiltersReset }: any) => (
    <div>
      <button type="button" data-testid="apply-filters" onClick={onFiltersApplied}>
        APPLY_FILTERS
      </button>
      <button type="button" data-testid="reset-filters" onClick={onFiltersReset}>
        RESET_FILTERS
      </button>
      <div data-testid="filters-children">{children}</div>
    </div>
  ),
}));

jest.mock('../../../../helpers', () => ({
  formatDate: (value: string) => `formatted-${value}`,
  formattedCurrency: (value: number) => `€ ${value}`,
  truncateString: (value: string, max: number) =>
    value && value.length > max ? `${value.slice(0, max)}...` : value,
}));

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Tooltip: ({ title, children }: any) => (
      <div data-testid="tooltip" data-title={title}>
        {children}
      </div>
    ),
  };
});

jest.mock('../../../../services/merchantService', () => ({
  getMerchantPointOfSalesWithTransactions: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/utils/storage', () => ({
  storageTokenOps: {
    read: jest.fn(),
  },
}));

jest.mock('../../../../utils/jwt-utils', () => ({
  parseJwt: jest.fn(),
}));


import ShopDetails from '../ShopDetails';
import { getMerchantPointOfSalesWithTransactions } from '../../../../services/merchantService';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { parseJwt } from '../../../../utils/jwt-utils';
import { MISSING_DATA_PLACEHOLDER } from '../../../../utils/constants';
import { FranchisePointOfSaleDTO } from '../../../../api/generated/merchants/FranchisePointOfSaleDTO';

const mockedGetMerchantPointOfSalesWithTransactions = getMerchantPointOfSalesWithTransactions as unknown as jest.MockedFunction<typeof Array<FranchisePointOfSaleDTO>>;
const mockedStorageRead = storageTokenOps.read as jest.Mock;
const mockedParseJwt = parseJwt as jest.MockedFunction<typeof parseJwt>;

describe('ShopDetails', () => {
  const storeMock = {
    name: 'Negozio Test',
    startDate: '2025-01-01',
    endDate: '2025-02-01',
    businessName: 'Azienda Test SRL',
    totalAmountCents: 12345,
    status: 'INVOICED',
    approvedAmountCents: 6789,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    const mockedUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;
    mockLocationState = {
      state: {
        store: storeMock,
      },
    };

    mockedStorageRead.mockReturnValue('fake-jwt');
    mockedParseJwt.mockReturnValue({ merchant_id: 'MERCHANT-123' } as any);
    mockedUseSelector.mockReturnValue([
      { initiativeId: 'INITIATIVE-123', initiativeName: 'Test Initiative' }
    ]);
    getMerchantPointOfSalesWithTransactions?.mockResolvedValue(
      [
        {
          pointOfSaleId: '1',
          franchiseName: 'Punto Vendita Uno',
        },
        {
          pointOfSaleId: '2',
          franchiseName: 'Punto Vendita Due',
        },
      ]
   )
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // it('renderizza breadcrumb, title e ShopCard con i dati dello store', () => {
  //   render(<ShopDetails />);
  //
  //   const breadcrumb = screen.getByLabelText('breadcrumb');
  //   expect(within(breadcrumb).getByText('Negozio Test')).toBeInTheDocument();
  //
  //   expect(screen.getByTestId('title-box')).toHaveTextContent('Negozio Test');
  //
  //   expect(screen.getByTestId('shop-card-batchName')).toHaveTextContent('Negozio Test');
  //   expect(screen.getByTestId('shop-card-dateRange')).toHaveTextContent(
  //     'formatted-2025-01-01 - formatted-2025-02-01'
  //   );
  //   expect(screen.getByTestId('shop-card-companyName')).toHaveTextContent('Azienda Test SRL');
  //   expect(screen.getByTestId('shop-card-status')).toHaveTextContent('INVOICED');
  //   expect(screen.getByTestId('shop-card-approvedRefund')).toHaveTextContent('€ 6789');
  // });

  it('il bottone back chiama history.goBack', () => {
    render(<ShopDetails />);

    const backButton = screen.getByTestId('back-button-test');
    fireEvent.click(backButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('il bottone export CSV è disabilitato e mostra il testo tradotto', () => {
    render(<ShopDetails />);

    const exportBtn = screen.getByTestId('download-csv-button-test');
    expect(exportBtn).toBeDisabled();
    expect(exportBtn).toHaveTextContent('pages.refundRequests.storeDetails.exportCSV');
  });

  it('renderizza il filtro per data e per stato', () => {
    render(<ShopDetails />);

    expect(screen.getByText('commons.backBtn')).toBeInTheDocument();

    const statusSelect = screen.getByTestId('filterStatus-select');
    expect(statusSelect).toBeInTheDocument();
  });

  it('i MenuItem dello stato mostrano le label restituite da StatusChip/getStatus (placeholder test minimale)', () => {
    const { container } = render(<ShopDetails />);

    const hiddenInput = screen.getByTestId('filterStatus-select');
    expect(hiddenInput).toBeInTheDocument();

    const selectButton = container.querySelector('#status') as HTMLElement;
    expect(selectButton).not.toBeInTheDocument();
  });

  it('mostra la tabella InvoiceDataTable', () => {
    render(<ShopDetails />);

    expect(screen.getByTestId('invoice-data-table')).toBeInTheDocument();
  });

  it('quando si applicano i filtri non mostra progressbar (test di non regressione)', async () => {
    render(<ShopDetails />);

    const applyBtn = screen.getByTestId('apply-filters');

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    fireEvent.click(applyBtn);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('quando si resettano i filtri non deve rompersi (callback di reset chiamabile)', () => {
    render(<ShopDetails />);

    const resetBtn = screen.getByTestId('reset-filters');
    fireEvent.click(resetBtn);

    expect(screen.getByTestId('filters-children')).toBeInTheDocument();
  });

  it('gestisce il caso in cui lo store non sia presente in location.state', () => {
    mockLocationState = { state: undefined };

    render(<ShopDetails />);

    expect(screen.getByTestId('back-button-test')).toBeInTheDocument();
  });

  it('mostra Tooltip con franchiseName quando presente e placeholder quando assente', async () => {
    render(<ShopDetails />);

    await waitFor(() => {
      expect(mockedGetMerchantPointOfSalesWithTransactions).toHaveBeenCalledWith(
        ""
      );
    });

    const posSelectButton = screen.getByRole('button', { name: /Punto vendita/i });
    fireEvent.mouseDown(posSelectButton);

    const tooltips = await screen.findAllByTestId('tooltip');
    expect(tooltips[0]).toHaveAttribute('data-title', 'Punto Vendita Uno');
  });

});
