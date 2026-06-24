import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ListPointOfSaleDTO } from '../../../api/generated/merchants/data-contracts';
import PosCatalog from '../posCatalog';

const buildPosCatalogResponse = (
  overrides?: Partial<ListPointOfSaleDTO>
): ListPointOfSaleDTO => ({
  content: [
    {
      id: '1',
      type: 'ONLINE',
      franchiseName: 'Esercente point - de risi',
      city: 'Milano',
      address: 'Via Solferino 1',
      website: 'https://example.com',
      contactName: 'Mario',
      contactSurname: 'Rossi',
      contactEmail: 'mario.rossi@example.com',
      channelPhone: '0212345678',
    },
    {
      id: '2',
      type: 'PHYSICAL',
      franchiseName: 'Negozio fisico',
      city: 'Roma',
      address: 'Via Roma 10',
      website: '',
      contactName: 'Luigi',
      contactSurname: 'Bianchi',
      contactEmail: 'luigi.bianchi@example.com',
      channelPhone: '0612345678',
    },
    {
      id: '3',
      type: 'PHYSICAL',
      franchiseName: 'Esercente point - de risi',
      city: 'Milano',
      address: 'Via Solferino 2',
      website: '',
      contactName: 'Mario',
      contactSurname: 'Verdi',
      contactEmail: 'mario.verdi@example.com',
      channelPhone: '0299988877',
    },
    ...Array.from({ length: 7 }, (_, index) => ({
      id: `${index + 4}`,
      type: 'PHYSICAL' as const,
      franchiseName: `Store ${index + 4}`,
      city: 'Torino',
      address: `Via Test ${index + 4}`,
      website: '',
      contactName: `Nome ${index + 4}`,
      contactSurname: `Cognome ${index + 4}`,
      contactEmail: `store${index + 4}@example.com`,
      channelPhone: '0112345678',
    })),
  ],
  pageNumber: 0,
  pageSize: 10,
  totalElements: 10,
  totalPages: 1,
  ...overrides,
});

const mockReplace = jest.fn();
const mockSetAlert = jest.fn();
const mockRead = jest.fn();
const mockUseAppSelector = jest.fn();
const mockUseLocation = jest.fn();
const mockGetMerchantPointOfSalesCatalog = jest.fn();

jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: ({ title, subTitle }: { title: string; subTitle: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{subTitle}</p>
    </div>
  ),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: {
    read: () => mockRead(),
  },
}));

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({
    setAlert: mockSetAlert,
  }),
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: () => mockUseAppSelector(),
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  intiativesListSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    replace: mockReplace,
  }),
  useLocation: () => mockUseLocation(),
}));

jest.mock('../../../utils/jwt-utils', () => ({
  parseJwt: jest.fn(),
}));

jest.mock('../../../services/merchantService', () => ({
  getMerchantPointOfSalesCatalog: (...args: Array<any>) => mockGetMerchantPointOfSalesCatalog(...args),
}));

jest.mock('../../../components/dataTable/DataTable', () => ({
  __esModule: true,
  default: ({
    rows,
    columns,
    onRowsPerPageChange,
    onSortModelChange,
    onPaginationPageChange,
  }: {
    rows: Array<any>;
    columns: Array<any>;
    onRowsPerPageChange?: (pageSize: number) => void;
    onSortModelChange?: (model: Array<{ field: string; sort: 'asc' | 'desc' }>) => void;
    onPaginationPageChange?: (page: number) => void;
  }) => (
    <div>
      <div data-testid="rows-count">{rows.length}</div>
      <button type="button" onClick={() => onRowsPerPageChange?.(10)}>
        change-rows
      </button>
      <button
        type="button"
        onClick={() => onSortModelChange?.([{ field: 'franchiseName', sort: 'desc' }])}
      >
        sort-rows
      </button>
      <button type="button" onClick={() => onSortModelChange?.([])}>
        clear-sort
      </button>
      <button type="button" onClick={() => onPaginationPageChange?.(1)}>
        next-page
      </button>
      <div data-testid="rendered-cells">
        {rows[0]
          ? columns.slice(0, 7).map((column: any) => (
              <div key={column.field}>
                {column.renderCell({
                  row: rows[0],
                  value:
                    column.field === 'contactName' ? rows[0].contactName : rows[0][column.field],
                })}
              </div>
            ))
          : null}
      </div>
      <div data-testid="open-drawer-cell">
        {rows[0] ? columns[7].renderCell({ row: rows[0], value: undefined }) : null}
      </div>
    </div>
  ),
}));

jest.mock('../PosCatalogFiltersDrawer', () => ({
  __esModule: true,
  PosCatalogFilters: ({
    onFiltersApplied,
    onFiltersReset,
  }: {
    onFiltersApplied: (values: any) => void;
    onFiltersReset: () => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onFiltersApplied({
            initiative: 'Bonus Decoder',
            type: 'PHYSICAL',
            city: 'Milano',
            address: 'Solferino',
            contactName: 'Mario',
            sort: 'asc',
          })
        }
      >
        apply-filters
      </button>
      <button type="button" onClick={onFiltersReset}>
        reset-filters
      </button>
    </div>
  ),
  PosCatalogDrawer: ({
    isOpen,
    selectedStore,
    onClose,
  }: {
    isOpen: boolean;
    selectedStore: { franchiseName?: string } | null;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="pos-drawer">
        <span>{selectedStore?.franchiseName}</span>
        <button type="button" onClick={onClose}>
          close-drawer
        </button>
      </div>
    ) : null,
}));

describe('PosCatalog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockUseAppSelector.mockReturnValue([
      { initiativeName: 'Bonus Decoder' },
      { initiativeName: 'Iniziativa 1' },
    ]);
    const { parseJwt } = jest.requireMock('../../../utils/jwt-utils');
    parseJwt.mockReturnValue({ merchant_id: 'merchant-id' });

    mockGetMerchantPointOfSalesCatalog.mockImplementation(
      async (_merchantId: string, filters: Record<string, unknown>) => {
        if (filters.initiative === 'Bonus Decoder') {
          return buildPosCatalogResponse({
            content: [
              {
                id: '3',
                type: 'PHYSICAL',
                franchiseName: 'Esercente point - de risi',
                city: 'Milano',
                address: 'Via Solferino 2',
                website: '',
                contactName: 'Mario',
                contactSurname: 'Verdi',
                contactEmail: 'mario.verdi@example.com',
                channelPhone: '0299988877',
              },
            ],
            totalElements: 1,
            totalPages: 1,
          });
        }

        return buildPosCatalogResponse({
          pageNumber: Number(filters.page ?? 0),
          pageSize: Number(filters.size ?? 10),
        });
      }
    );
  });

  it('shows success alert when coming from upload flow', async () => {
    mockUseLocation.mockReturnValue({ state: { showSuccessAlert: true }, pathname: '/pos' });

    render(<PosCatalog />);

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        text: 'pages.initiativeStores.pointOfSalesUploadSuccess',
        isOpen: true,
        severity: 'success',
      });
    });

    expect(mockReplace).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockRead).toHaveBeenCalled();
    });
    expect(screen.getByText('pages.posCatalog.title')).toBeInTheDocument();
    expect(screen.getByTestId('rows-count')).toHaveTextContent('10');
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('restores pagination from session storage and handles sorting, pagination and rows-per-page', async () => {
    mockUseLocation.mockReturnValue({ state: {}, pathname: '/pos' });
    sessionStorage.setItem(
      'storesPagination',
      JSON.stringify({
        pageNo: 1,
        pageSize: 5,
        totalElements: 15,
        sort: 'franchiseName,desc',
      })
    );

    render(<PosCatalog />);

    await waitFor(() => {
      expect(screen.getByText('sort-rows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('sort-rows'));
    await waitFor(() => {
      expect(sessionStorage.getItem('storesPagination')).toContain('franchiseName,desc');
    });

    fireEvent.click(screen.getByText('clear-sort'));

    await waitFor(() => {
      expect(screen.getByText('next-page')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('next-page'));
    await waitFor(() => {
      expect(sessionStorage.getItem('storesPagination')).toContain('"pageNo":1');
    });

    fireEvent.click(screen.getByText('change-rows'));
    await waitFor(() => {
      expect(screen.getByTestId('rows-count')).toHaveTextContent('10');
    });
  });

  it('applies filters, opens the drawer and closes it again', async () => {
    mockUseLocation.mockReturnValue({ state: {}, pathname: '/pos' });

    render(<PosCatalog />);

    await waitFor(() => {
      expect(screen.getByText('apply-filters')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('apply-filters'));

    await waitFor(() => {
      expect(screen.getByTestId('rows-count')).toHaveTextContent('1');
    });

    fireEvent.click(screen.getByTestId('3'));
    expect(screen.getByTestId('pos-drawer')).toBeInTheDocument();
    expect(screen.getAllByText('Esercente point - de risi')).toHaveLength(2);

    fireEvent.click(screen.getByText('close-drawer'));
    expect(screen.queryByTestId('pos-drawer')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('reset-filters'));
    await waitFor(() => {
      expect(screen.getByTestId('rows-count')).toHaveTextContent('10');
    });
  });

  it('shows empty states for no data and for filters without results', async () => {
    mockUseLocation.mockReturnValue({ state: {}, pathname: '/pos' });

    render(<PosCatalog />);

    await waitFor(() => {
      expect(screen.getByText('apply-filters')).toBeInTheDocument();
    });

    mockGetMerchantPointOfSalesCatalog.mockResolvedValue({
      content: [],
      pageNo: 0,
      pageSize: 0,
      totalElements: 0,
    });

    fireEvent.click(screen.getByText('apply-filters'));

    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.noStoresInitiative')).toBeInTheDocument();
    });

    mockGetMerchantPointOfSalesCatalog.mockResolvedValue({
      content: [],
      pageNo: 0,
      pageSize: 0,
      totalElements: 0,
    });

    fireEvent.click(screen.getByText('reset-filters'));

    await waitFor(() => {
      expect(screen.getByText('pages.posCatalog.noData')).toBeInTheDocument();
    });
  });

  it('removes stored pagination on unmount', () => {
    mockUseLocation.mockReturnValue({ state: {}, pathname: '/pos' });
    sessionStorage.setItem(
      'storesPagination',
      JSON.stringify({
        pageNo: 1,
        pageSize: 5,
        totalElements: 15,
      })
    );

    const { unmount } = render(<PosCatalog />);

    expect(sessionStorage.getItem('storesPagination')).toBeTruthy();

    unmount();

    expect(sessionStorage.getItem('storesPagination')).toBeNull();
  });
});
