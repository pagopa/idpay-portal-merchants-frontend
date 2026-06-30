import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia/theme';
import PosCatalog from '../posCatalog';

const mockSetAlert = jest.fn();
const mockReplace = jest.fn();
const mockUsePointOfSalesTable = jest.fn();
const mockBuildPointOfSalesColumns = jest.fn();
const mockGetMerchantPointOfSalesCatalog = jest.fn();
const mockParseJwt = jest.fn();
const mockStorageRead = jest.fn();
const mockUseFormik = jest.fn();
const mockBrowserConsoleLog = jest.fn();

let dataTableProps: any = {};
let filtersProps: any = {};
let drawerProps: any = {};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    replace: mockReplace,
  }),
  useLocation: jest.fn(() => ({ state: {}, pathname: '/pos-catalog' })),
}));

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({
    setAlert: mockSetAlert,
  }),
}));

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('formik', () => ({
  useFormik: (...args: Array<unknown>) => mockUseFormik(...args),
}));

const mockUseAppSelector = jest.fn(() => [
  { initiativeId: 'initiative-1', initiativeName: 'Initiative One' },
  { initiativeId: 'initiative-2', initiativeName: 'Initiative Two' },
]);

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: (...args: Array<unknown>) => mockUseAppSelector(...args),
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  intiativesListSelector: jest.fn(),
}));

jest.mock('../../../components/pointsOfSale/usePointOfSalesTable', () => ({
  __esModule: true,
  default: (...args: Array<unknown>) => mockUsePointOfSalesTable(...args),
}));

jest.mock('../../../components/pointsOfSale/pointOfSalesColumns', () => ({
  __esModule: true,
  default: (...args: Array<unknown>) => mockBuildPointOfSalesColumns(...args),
}));

jest.mock('../../../components/dataTable/DataTable', () => (props: any) => {
  dataTableProps = props;
  return (
    <div data-testid="mock-datatable">
      <button
        data-testid="sort-button"
        onClick={() => props.onSortModelChange([{ field: 'referent', sort: 'desc' }])}
      >
        sort
      </button>
      <button
        data-testid="page-button"
        onClick={() => props.onPaginationPageChange(3)}
      >
        page
      </button>
      <button
        data-testid="rows-button"
        onClick={() => props.onRowsPerPageChange(25)}
      >
        rows
      </button>
      {props.rows.map((row: any) => (
        <button
          key={row.id}
          data-testid={`row-action-${row.id}`}
          onClick={() => props.columns[0]?.renderCell?.({ row })}
        >
          {row.franchiseName}
        </button>
      ))}
    </div>
  );
});

jest.mock('../../../components/pointsOfSale/PointOfSalesFilters', () => (props: any) => {
  filtersProps = props;
  return (
    <div data-testid="mock-filters">
      <button
        data-testid="apply-filters"
        onClick={() => props.onFiltersApplied(props.formik.values)}
      >
        apply
      </button>
      <button data-testid="reset-filters" onClick={() => props.onFiltersReset()}>
        reset
      </button>
      <div data-testid="filters-applied-once">{String(props.filtersAppliedOnce)}</div>
      <div data-testid="initiative-options-count">{props.initiativeOptions.length}</div>
    </div>
  );
});

jest.mock('../PosCatalogFiltersDrawer', () => ({
  PosCatalogDrawer: (props: any) => {
    drawerProps = props;
    return props.isOpen ? (
      <div data-testid="pos-catalog-drawer">
        <div>{props.selectedStore?.franchiseName}</div>
        <button data-testid="close-drawer" onClick={props.onClose}>
          close
        </button>
        <div data-testid="drawer-merchant-id">{props.merchantId}</div>
        <div data-testid="drawer-initiative-options">{props.initiativeOptions.length}</div>
      </div>
    ) : null;
  },
}));

jest.mock('../../../services/merchantService', () => ({
  getMerchantPointOfSalesCatalog: (...args: Array<unknown>) =>
    mockGetMerchantPointOfSalesCatalog(...args),
}));

jest.mock('../../../utils/jwt-utils', () => ({
  parseJwt: (...args: Array<unknown>) => mockParseJwt(...args),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: {
    read: () => mockStorageRead(),
  },
}));

jest.mock('../../../utils/consoleLogger', () => ({
  browserConsole: {
    log: (...args: Array<unknown>) => mockBrowserConsoleLog(...args),
  },
}));

const mockStores = [
  {
    id: 'store-1',
    franchiseName: 'Store One',
    type: 'PHYSICAL',
    city: 'Rome',
    address: 'Via Roma 1',
    contactName: 'Mario',
  },
];

const mockHandleFiltersApplied = jest.fn();
const mockHandleFiltersReset = jest.fn();
const mockHandleSortModelChange = jest.fn();
const mockHandlePaginationPageChange = jest.fn();
const mockHandleRowsPerPageChange = jest.fn();

const defaultHookValue = {
  stores: mockStores,
  storesPagination: { pageNo: 0, pageSize: 10, totalElements: 1 },
  storesLoading: false,
  rowsPerPage: 10,
  sortModel: [],
  filtersAppliedOnce: false,
  handleFiltersApplied: mockHandleFiltersApplied,
  handleFiltersReset: mockHandleFiltersReset,
  handleSortModelChange: mockHandleSortModelChange,
  handlePaginationPageChange: mockHandlePaginationPageChange,
  handleRowsPerPageChange: mockHandleRowsPerPageChange,
};

const defaultFormikValues = {
  initiative: '',
  type: undefined,
  city: '',
  address: '',
  contactName: '',
  page: 0,
  size: 10,
  sort: 'asc',
};

const renderComponent = () =>
  render(
    <ThemeProvider theme={theme}>
      <PosCatalog />
    </ThemeProvider>
  );

describe('<PosCatalog />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dataTableProps = {};
    filtersProps = {};
    drawerProps = {};
    mockStorageRead.mockReturnValue('mock-token');
    mockParseJwt.mockReturnValue({ merchant_id: 'merchant-123' });
    mockUseFormik.mockImplementation(({ initialValues, onSubmit }: any) => ({
      values: initialValues ?? defaultFormikValues,
      submitForm: () => onSubmit(initialValues ?? defaultFormikValues),
    }));
    mockGetMerchantPointOfSalesCatalog.mockResolvedValue({
      content: mockStores,
      pageNo: 0,
      pageSize: 10,
      totalElements: 1,
    });
    mockUsePointOfSalesTable.mockReturnValue(defaultHookValue);
    mockBuildPointOfSalesColumns.mockImplementation(({ onActionClick }: any) => [
      {
        field: 'actions',
        renderCell: ({ row }: any) => {
          onActionClick(row);
          return row.franchiseName;
        },
      },
    ]);
    const { useLocation } = jest.requireMock('react-router-dom');
    useLocation.mockReturnValue({ state: {}, pathname: '/pos-catalog' });
  });

  it('renders title, filters and table when stores are available', () => {
    renderComponent();

    expect(screen.getByText('pages.posCatalog.title')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('mock-filters')).toBeInTheDocument();
    expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
    expect(screen.getByTestId('initiative-options-count')).toBeInTheDocument();
    expect(filtersProps.fields).toEqual([
      'initiative',
      'type',
      'city',
      'address',
      'contactName',
    ]);
    expect(filtersProps.t('translation.key')).toBe('translation.key');
  });

  it('shows the loader while stores are loading', () => {
    mockUsePointOfSalesTable.mockReturnValue({
      ...defaultHookValue,
      stores: [],
      storesLoading: true,
    });

    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-datatable')).not.toBeInTheDocument();
  });

  it('shows the default empty state when no stores are available and no filters were applied', () => {
    mockUsePointOfSalesTable.mockReturnValue({
      ...defaultHookValue,
      stores: [],
      filtersAppliedOnce: false,
    });

    renderComponent();

    expect(screen.getByText('pages.posCatalog.noData')).toBeInTheDocument();
    expect(screen.queryByText('pages.initiativeStores.noStoresInitiative')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-filters')).not.toBeInTheDocument();
  });

  it('shows filters, table and filtered empty state when filters were already applied', () => {
    mockUsePointOfSalesTable.mockReturnValue({
      ...defaultHookValue,
      stores: [],
      filtersAppliedOnce: true,
    });

    renderComponent();

    expect(screen.getByTestId('mock-filters')).toBeInTheDocument();
    expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
    expect(screen.getByText('pages.initiativeStores.noStoresInitiative')).toBeInTheDocument();
  });

  it('shows filters and table when form values are set even with no stores', () => {
    mockUsePointOfSalesTable.mockReturnValue({
      ...defaultHookValue,
      stores: [],
      filtersAppliedOnce: false,
    });
    mockUseFormik.mockImplementation(({ onSubmit }: any) => ({
      values: {
        ...defaultFormikValues,
        city: 'Rome',
      },
      submitForm: () =>
        onSubmit({
          ...defaultFormikValues,
          city: 'Rome',
        }),
    }));

    renderComponent();

    expect(screen.getByTestId('mock-filters')).toBeInTheDocument();
    expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.noData')).toBeInTheDocument();
  });

  it('passes hook handlers to filters and table callbacks', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('apply-filters'));
    fireEvent.click(screen.getByTestId('reset-filters'));
    fireEvent.click(screen.getByTestId('sort-button'));
    fireEvent.click(screen.getByTestId('page-button'));
    fireEvent.click(screen.getByTestId('rows-button'));

    expect(mockHandleFiltersApplied).toHaveBeenCalled();
    expect(mockHandleFiltersReset).toHaveBeenCalled();
    expect(mockHandleSortModelChange).toHaveBeenCalledWith([{ field: 'referent', sort: 'desc' }]);
    expect(mockHandlePaginationPageChange).toHaveBeenCalledWith(3);
    expect(mockHandleRowsPerPageChange).toHaveBeenCalledWith(25);
  });

  it('opens and closes the drawer from the table action and passes merchant data', async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('row-action-store-1'));

    const drawer = screen.getByTestId('pos-catalog-drawer');
    expect(drawer).toBeInTheDocument();
    expect(within(drawer).getByText('Store One')).toBeInTheDocument();
    expect(within(drawer).getByTestId('drawer-merchant-id')).toHaveTextContent('merchant-123');
    expect(within(drawer).getByTestId('drawer-initiative-options')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('close-drawer'));

    await waitFor(() => {
      expect(screen.queryByTestId('pos-catalog-drawer')).not.toBeInTheDocument();
    });
  });

  it('shows success alert and clears location state when requested', () => {
    const { useLocation } = jest.requireMock('react-router-dom');
    useLocation.mockReturnValue({
      state: { showSuccessAlert: true },
      pathname: '/pos-catalog',
    });

    renderComponent();

    expect(mockSetAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'pages.initiativeStores.pointOfSalesUploadSuccess',
        severity: 'success',
        isOpen: true,
      })
    );
    expect(mockReplace).toHaveBeenCalledWith(
      expect.objectContaining({
        state: expect.objectContaining({ showSuccessAlert: false }),
      })
    );
  });

  it('builds the columns with catalog mode and action callback', () => {
    renderComponent();

    expect(mockBuildPointOfSalesColumns).toHaveBeenCalledWith(
      expect.objectContaining({
        addressMode: 'catalog',
        onActionClick: expect.any(Function),
        t: expect.any(Function),
      })
    );
    expect(dataTableProps.checkable).toBe(true);
    expect(dataTableProps.isRowSelectable()).toBe(false);
  });

  it('provides a fetchStores callback to the table hook that returns an empty result without merchant id', async () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];
    mockParseJwt.mockReturnValueOnce({});

    const result = await hookArgs.fetchStores({
      initiative: 'initiative-1',
      type: 'ONLINE',
      city: 'Rome',
      address: 'Street',
      contactName: 'Mario',
      page: 1,
      size: 20,
      sort: 'desc',
    });

    expect(result).toEqual({
      content: [],
      pageNo: 0,
      pageSize: 20,
      totalElements: 0,
    });
    expect(mockGetMerchantPointOfSalesCatalog).not.toHaveBeenCalled();
  });

  it('provides a fetchStores callback to the table hook that calls the merchant service', async () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];

    await hookArgs.fetchStores({
      initiative: 'initiative-1',
      type: 'PHYSICAL',
      city: 'Milan',
      address: 'Via Milano',
      contactName: 'Luigi',
      page: 2,
      size: 30,
      sort: 'name,asc',
    });

    expect(mockStorageRead).toHaveBeenCalled();
    expect(mockParseJwt).toHaveBeenCalledWith('mock-token');
    expect(mockGetMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant-123', {
      initiativeId: 'initiative-1',
      type: 'PHYSICAL',
      city: 'Milan',
      address: 'Via Milano',
      contactName: 'Luigi',
      sort: 'name,asc',
      page: 2,
      size: 30,
    });
  });

  it('provides an onFetchError callback that opens a generic error alert', () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];
    hookArgs.onFetchError();

    expect(mockSetAlert).toHaveBeenLastCalledWith({
      title: 'errors.genericTitle',
      text: 'errors.genericDescription',
      isOpen: true,
      severity: 'error',
    });
  });

  it('configures formik submit to log the submitted filters', () => {
    renderComponent();

    const formikArgs = mockUseFormik.mock.calls[0][0];
    formikArgs.onSubmit({
      ...defaultFormikValues,
      initiative: 'initiative-1',
    });

    expect(mockBrowserConsoleLog).toHaveBeenCalledWith('Eseguo ricerca con filtri:', {
      ...defaultFormikValues,
      initiative: 'initiative-1',
    });
  });

  it('handles an undefined initiatives list by passing no options to children', () => {
    mockUseAppSelector.mockReturnValueOnce(undefined);

    renderComponent();

    expect(screen.getByTestId('initiative-options-count')).toHaveTextContent('0');
  });
});
