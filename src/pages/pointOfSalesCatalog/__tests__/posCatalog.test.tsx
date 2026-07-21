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
const mockAssociatePos = jest.fn();
const mockExcludePos = jest.fn();
const mockParseJwt = jest.fn();
const mockStorageRead = jest.fn();
const mockUseFormik = jest.fn();
const mockBrowserConsoleLog = jest.fn();
const mockIsActionDisabled = jest.fn();

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

jest.mock('../../../hooks/useUserPermissions', () => ({
  PERMISSION_KEYS: {
    POS_CATALOG_ASSOCIATE: 'POS_CATALOG_ASSOCIATE',
    POS_CATALOG_EXCLUDE: 'POS_CATALOG_EXCLUDE',
  },
  useUserPermissions: () => ({
    isActionDisabled: mockIsActionDisabled,
  }),
}));

jest.mock('formik', () => ({
  useFormik: (...args: Array<unknown>) => mockUseFormik(...args),
}));

const mockUseAppSelector = jest.fn(() => [
  { initiativeId: 'initiative-1', initiativeName: 'Initiative One', status: 'PUBLISHED' },
  { initiativeId: 'initiative-2', initiativeName: 'Initiative Two', status: 'PUBLISHED' },
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
      <button data-testid="page-button" onClick={() => props.onPaginationPageChange(3)}>
        page
      </button>
      <button data-testid="rows-button" onClick={() => props.onRowsPerPageChange(25)}>
        rows
      </button>
      <button
        data-testid="selection-button"
        onClick={() => props.onSelectionModelChange(['store-1', 'store-2'])}
      >
        selection
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

jest.mock('../../../components/pointsOfSale/PointOfSalesFilters', () => ({
  __esModule: true,
  ASSOCIATED_FILTER_YES: 'YES',
  ASSOCIATED_FILTER_NO: 'NO',
  ALL_INITIATIVES_VALUE: 'ALL_INITIATIVES',
  NO_INITIATIVE_VALUE: 'NO_INITIATIVE',
  default: (props: any) => {
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
  },
}));

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
        <div data-testid="drawer-published-initiative-options">
          {props.publishedInitiativeOptions.length}
        </div>
      </div>
    ) : null;
  },
}));

jest.mock('../../../services/merchantService', () => ({
  getMerchantPointOfSalesCatalog: (...args: Array<unknown>) =>
    mockGetMerchantPointOfSalesCatalog(...args),
  associatePos: (...args: Array<unknown>) => mockAssociatePos(...args),
  excludePos: (...args: Array<unknown>) => mockExcludePos(...args),
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
  sortModel: [{ field: 'franchiseName', sort: 'asc' }],
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
  page: 0,
  size: 10,
  sort: 'franchiseName,asc',
};

const renderComponent = () =>
  render(
    <ThemeProvider theme={theme}>
      <PosCatalog />
    </ThemeProvider>
  );

const expectEmptyStateMessage = () => {
  expect(
    screen.getByText(
      (_, element) =>
        element?.tagName.toLowerCase() === 'p' &&
        element?.textContent ===
          'pages.initiativeStores.noStorespages.initiativeStores.addStoreNoResults.'
    )
  ).toBeInTheDocument();
};

describe('<PosCatalog />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dataTableProps = {};
    filtersProps = {};
    drawerProps = {};
    mockUseAppSelector.mockReturnValue([
      { initiativeId: 'initiative-1', initiativeName: 'Initiative One', status: 'PUBLISHED' },
      { initiativeId: 'initiative-2', initiativeName: 'Initiative Two', status: 'PUBLISHED' },
    ]);
    mockStorageRead.mockReturnValue('mock-token');
    mockIsActionDisabled.mockReturnValue(false);
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
    mockAssociatePos.mockResolvedValue({
      associated: [{ pointOfSaleId: 'store-1', franchiseName: 'Store One' }],
      notAssociated: [],
    });
    mockExcludePos.mockResolvedValue({
      excludedPointOfSales: [{ pointOfSaleId: 'store-1', franchiseName: 'Store One' }],
      notExcludedPointOfSales: [],
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

    expect(mockUsePointOfSalesTable).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValues: expect.objectContaining({
          sort: 'franchiseName,asc',
        }),
      })
    );
    expect(screen.getByText('pages.posCatalog.title')).toBeInTheDocument();
    expect(screen.getByText('pages.posCatalog.subtitle')).toBeInTheDocument();
    expect(screen.queryByText('pages.posCatalog.actions.exclude')).not.toBeInTheDocument();
    expect(screen.queryByText('pages.posCatalog.actions.associate')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-filters')).toBeInTheDocument();
    expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
    expect(screen.getByTestId('initiative-options-count')).toBeInTheDocument();
    expect(filtersProps.fields).toEqual(['associated', 'initiative', 'type', 'city', 'address']);
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

    expectEmptyStateMessage();
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
    expectEmptyStateMessage();
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
    expectEmptyStateMessage();
  });

  it('shows filters and table when only the associated filter is set', () => {
    mockUsePointOfSalesTable.mockReturnValue({
      ...defaultHookValue,
      stores: [],
      filtersAppliedOnce: false,
    });
    mockUseFormik.mockImplementation(({ onSubmit }: any) => ({
      values: {
        ...defaultFormikValues,
        associated: 'YES',
      },
      setFieldValue: jest.fn(),
      submitForm: () =>
        onSubmit({
          ...defaultFormikValues,
          associated: 'YES',
        }),
    }));

    renderComponent();

    expect(screen.getByTestId('mock-filters')).toBeInTheDocument();
    expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
    expectEmptyStateMessage();
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

  it('clears the initiative before applying filters when associated is set to NO', () => {
    mockUseFormik.mockImplementation(({ onSubmit }: any) => ({
      values: {
        ...defaultFormikValues,
        associated: 'NO',
        initiative: 'initiative-1',
      },
      setFieldValue: jest.fn(),
      submitForm: () =>
        onSubmit({
          ...defaultFormikValues,
          associated: 'NO',
          initiative: 'initiative-1',
        }),
    }));

    renderComponent();
    fireEvent.click(screen.getByTestId('apply-filters'));

    expect(mockHandleFiltersApplied).toHaveBeenCalledWith({
      ...defaultFormikValues,
      associated: 'NO',
      initiative: '',
    });
  });

  it('shows selection actions and opens the association modal with initiative options', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('selection-button'));

    expect(screen.getByText('pages.posCatalog.actions.exclude (2)')).toBeInTheDocument();
    const associateButton = screen.getByText('pages.posCatalog.actions.associate (2)');
    expect(associateButton).toBeInTheDocument();

    fireEvent.click(associateButton);

    const modal = screen.getByTestId('associate-selected-pos-modal');
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText('pages.posCatalog.associateModal.title')).toBeInTheDocument();
    expect(
      within(modal).getByText('pages.posCatalog.associateModal.description')
    ).toBeInTheDocument();
    expect(
      within(modal).getByText('pages.posCatalog.associateModal.infoBanner')
    ).toBeInTheDocument();
    expect(
      within(modal).getAllByText('pages.posCatalog.associateModal.initiativeLabel').length
    ).toBeGreaterThan(0);
    expect(within(modal).getByText('actions.cancel')).toBeInTheDocument();
    expect(within(modal).getByText('actions.confirm')).toBeInTheDocument();
    expect(filtersProps.initiativeOptions).toEqual([
      { value: 'initiative-1', label: 'Initiative One' },
      { value: 'initiative-2', label: 'Initiative Two' },
    ]);
  });

  it('keeps closed initiatives in filters and removes them from association options', () => {
    mockUseAppSelector.mockReturnValue([
      { initiativeId: 'initiative-1', initiativeName: 'Initiative One', status: 'PUBLISHED' },
      { initiativeId: 'initiative-2', initiativeName: 'Initiative Two', status: 'CLOSED' },
    ]);

    renderComponent();

    expect(filtersProps.initiativeOptions).toEqual([
      { value: 'initiative-1', label: 'Initiative One' },
      { value: 'initiative-2', label: 'Initiative Two' },
    ]);
    expect(drawerProps.initiativeOptions).toEqual([
      { value: 'initiative-1', label: 'Initiative One' },
      { value: 'initiative-2', label: 'Initiative Two' },
    ]);
    expect(drawerProps.publishedInitiativeOptions).toEqual([
      { value: 'initiative-1', label: 'Initiative One' },
    ]);
    expect(drawerProps.actionsDisabled).toBe(false);
  });

  it('disables catalog and drawer actions when there are no onboarded initiatives', () => {
    mockUseAppSelector.mockReturnValue([]);

    renderComponent();

    fireEvent.click(screen.getByTestId('row-action-store-1'));
    fireEvent.click(screen.getByTestId('selection-button'));

    expect(screen.getByText('pages.posCatalog.actions.exclude (2)')).toBeDisabled();
    expect(screen.getByText('pages.posCatalog.actions.associate (2)')).toBeDisabled();
    expect(drawerProps.actionsDisabled).toBe(true);
    expect(drawerProps.publishedInitiativeOptions).toEqual([]);
  });

  it('associates selected stores to the selected initiative on confirm', async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('row-action-store-1'));
    expect(screen.getByTestId('pos-catalog-drawer')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('selection-button'));
    fireEvent.click(screen.getByText('pages.posCatalog.actions.associate (2)'));

    fireEvent.mouseDown(
      screen.getByRole('combobox', {
        name: /pages.posCatalog.associateModal.initiativeLabel/,
      })
    );
    fireEvent.click(screen.getByText('Initiative One'));
    fireEvent.click(screen.getByText('actions.confirm'));

    await waitFor(() => {
      expect(mockAssociatePos).toHaveBeenCalledWith('initiative-1', 'merchant-123', [
        'store-1',
        'store-2',
      ]);
    });
    expect(mockSetAlert).toHaveBeenCalledWith({
      text: 'pages.posCatalog.associateSuccess',
      isOpen: true,
      severity: 'success',
      timeout: 6000,
    });
    expect(mockHandleFiltersApplied).toHaveBeenCalledWith(defaultFormikValues);
    expect(screen.queryByTestId('associate-selected-pos-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pos-catalog-drawer')).not.toBeInTheDocument();
  });

  it('excludes selected stores from the selected initiative on confirm', async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('selection-button'));
    fireEvent.click(screen.getByText('pages.posCatalog.actions.exclude (2)'));

    const modal = screen.getByTestId('exclude-selected-pos-modal');
    expect(within(modal).getByText('pages.posCatalog.excludeModal.title')).toBeInTheDocument();
    expect(
      within(modal).getByText('pages.posCatalog.excludeModal.description')
    ).toBeInTheDocument();
    expect(within(modal).getByText('pages.posCatalog.excludeModal.infoBanner')).toBeInTheDocument();

    fireEvent.mouseDown(
      screen.getByRole('combobox', {
        name: /pages.posCatalog.excludeModal.initiativeLabel/,
      })
    );
    fireEvent.click(screen.getByText('Initiative One'));
    fireEvent.click(within(modal).getByText('pages.posCatalog.actions.exclude'));

    await waitFor(() => {
      expect(mockExcludePos).toHaveBeenCalledWith('initiative-1', 'merchant-123', [
        'store-1',
        'store-2',
      ]);
    });
    expect(mockSetAlert).toHaveBeenCalledWith({
      text: 'pages.posCatalog.excludeSuccess',
      isOpen: true,
      severity: 'success',
      timeout: 6000,
    });
    expect(mockHandleFiltersApplied).toHaveBeenCalledWith(defaultFormikValues);
    expect(screen.queryByTestId('exclude-selected-pos-modal')).not.toBeInTheDocument();
  });

  it('shows the exclusion result modal and refreshes after close when no selected store is excluded', async () => {
    mockExcludePos.mockResolvedValueOnce({
      excludedPointOfSales: [],
      notExcludedPointOfSales: [
        { pointOfSaleId: 'store-1', reason: 'ALREADY_EXCLUDED' },
        { pointOfSaleId: 'store-2', reason: 'HAS_TRANSACTIONS' },
        { pointOfSaleId: 'store-3', reason: 'NOT_FOUND' },
      ],
    });

    renderComponent();

    fireEvent.click(screen.getByTestId('selection-button'));
    fireEvent.click(screen.getByText('pages.posCatalog.actions.exclude (2)'));

    fireEvent.mouseDown(
      screen.getByRole('combobox', {
        name: /pages.posCatalog.excludeModal.initiativeLabel/,
      })
    );
    fireEvent.click(screen.getByText('Initiative One'));
    fireEvent.click(
      within(screen.getByTestId('exclude-selected-pos-modal')).getByText(
        'pages.posCatalog.actions.exclude'
      )
    );

    await waitFor(() => {
      expect(mockExcludePos).toHaveBeenCalledWith('initiative-1', 'merchant-123', [
        'store-1',
        'store-2',
      ]);
    });
    const exclusionResultModal = await screen.findByTestId('point-of-sale-exclusion-result-modal');
    expect(
      within(exclusionResultModal).getByText(
        'pages.posCatalog.exclusionResultModal.notCompletedTitle'
      )
    ).toBeInTheDocument();
    expect(
      within(exclusionResultModal).getByText(
        'pages.posCatalog.exclusionResultModal.reasons.ALREADY_EXCLUDED'
      )
    ).toBeInTheDocument();
    expect(
      within(exclusionResultModal).getByText(
        'pages.posCatalog.exclusionResultModal.reasons.HAS_TRANSACTIONS'
      )
    ).toBeInTheDocument();
    expect(
      within(exclusionResultModal).queryByText(
        'pages.posCatalog.exclusionResultModal.reasons.NOT_FOUND'
      )
    ).not.toBeInTheDocument();

    fireEvent.click(within(exclusionResultModal).getByText('actions.okClose'));

    await waitFor(() => {
      expect(mockHandleFiltersApplied).toHaveBeenCalledWith(defaultFormikValues);
    });
    expect(mockSetAlert).not.toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'pages.posCatalog.excludeSuccess',
        severity: 'success',
      })
    );
  });

  it('shows already associated stores before the success alert when the response contains them', async () => {
    mockAssociatePos.mockResolvedValueOnce({
      associated: [{ pointOfSaleId: 'store-1', franchiseName: 'Store One' }],
      notAssociated: [
        {
          pointOfSaleId: 'store-2',
          franchiseName: 'Store Already',
          reason: 'ALREADY_ASSOCIATED',
          address: 'Via Roma',
          streetNumber: '10',
          city: 'Rome',
          type: 'PHYSICAL',
        },
        {
          pointOfSaleId: 'store-3',
          franchiseName: 'Store Online',
          reason: 'ALREADY_ASSOCIATED',
          website: 'www.shop.it',
          type: 'ONLINE',
        },
        {
          pointOfSaleId: 'store-4',
          franchiseName: 'Store Invalid',
          reason: 'INVALID',
          address: 'Via Torino',
          streetNumber: '20',
          city: 'Turin',
          type: 'PHYSICAL',
        },
      ],
    });

    renderComponent();

    fireEvent.click(screen.getByTestId('selection-button'));
    fireEvent.click(screen.getByText('pages.posCatalog.actions.associate (2)'));

    fireEvent.mouseDown(
      screen.getByRole('combobox', {
        name: /pages.posCatalog.associateModal.initiativeLabel/,
      })
    );
    fireEvent.click(screen.getByText('Initiative One'));
    fireEvent.click(screen.getByText('actions.confirm'));

    const alreadyAssociatedModal = await screen.findByTestId('already-associated-pos-modal');

    expect(
      within(alreadyAssociatedModal).getByText('pages.posCatalog.alreadyAssociatedModal.title')
    ).toBeInTheDocument();
    expect(
      within(alreadyAssociatedModal).getByText(
        'pages.posCatalog.alreadyAssociatedModal.description'
      )
    ).toBeInTheDocument();
    expect(
      within(alreadyAssociatedModal).getByText('Store Already - Via Roma 10, Rome')
    ).toBeInTheDocument();
    expect(
      within(alreadyAssociatedModal).getByText('Store Online - www.shop.it')
    ).toBeInTheDocument();
    expect(
      within(alreadyAssociatedModal).queryByText('Store Invalid - Via Torino 20, Turin')
    ).not.toBeInTheDocument();
    expect(mockSetAlert).not.toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(mockHandleFiltersApplied).not.toHaveBeenCalled();

    fireEvent.click(within(alreadyAssociatedModal).getByText('actions.okClose'));

    await waitFor(() => {
      expect(screen.queryByTestId('already-associated-pos-modal')).not.toBeInTheDocument();
    });
    expect(mockHandleFiltersApplied).toHaveBeenCalledWith(defaultFormikValues);
    expect(mockSetAlert).toHaveBeenCalledWith({
      text: 'pages.posCatalog.associateSuccess',
      isOpen: true,
      severity: 'success',
      timeout: 6000,
    });
  });

  it('shows the compact already associated modal without success alert when no store is associated', async () => {
    mockAssociatePos.mockResolvedValueOnce({
      associated: [],
      notAssociated: [
        {
          pointOfSaleId: 'store-1',
          franchiseName: 'Store Already',
          reason: 'ALREADY_ASSOCIATED',
          address: 'Via Roma',
          streetNumber: '10',
          city: 'Rome',
          type: 'PHYSICAL',
        },
      ],
    });

    renderComponent();

    fireEvent.click(screen.getByTestId('selection-button'));
    fireEvent.click(screen.getByText('pages.posCatalog.actions.associate (2)'));

    fireEvent.mouseDown(
      screen.getByRole('combobox', {
        name: /pages.posCatalog.associateModal.initiativeLabel/,
      })
    );
    fireEvent.click(screen.getByText('Initiative One'));
    fireEvent.click(screen.getByText('actions.confirm'));

    const alreadyAssociatedModal = await screen.findByTestId('already-associated-pos-modal');

    expect(
      within(alreadyAssociatedModal).getByText(
        'pages.posCatalog.alreadyAssociatedModal.description'
      )
    ).toBeInTheDocument();
    expect(
      within(alreadyAssociatedModal).queryByText('Store Already - Via Roma 10, Rome')
    ).not.toBeInTheDocument();

    fireEvent.click(within(alreadyAssociatedModal).getByText('actions.okClose'));

    await waitFor(() => {
      expect(screen.queryByTestId('already-associated-pos-modal')).not.toBeInTheDocument();
    });
    expect(mockHandleFiltersApplied).toHaveBeenCalledWith(defaultFormikValues);
    expect(mockSetAlert).not.toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('clears the initiative field through formik when associated is NO', () => {
    const setFieldValue = jest.fn();

    mockUseFormik.mockImplementation(({ onSubmit }: any) => ({
      values: {
        ...defaultFormikValues,
        associated: 'NO',
        initiative: 'initiative-1',
      },
      setFieldValue,
      submitForm: () =>
        onSubmit({
          ...defaultFormikValues,
          associated: 'NO',
          initiative: 'initiative-1',
        }),
    }));

    renderComponent();

    expect(setFieldValue).toHaveBeenCalledWith('initiative', '');
  });

  it('maps associated YES with a non-filter initiative to ALL_INITIATIVES plus initiativeId', async () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];

    await hookArgs.fetchStores({
      associated: 'YES',
      initiative: 'initiative-2',
      type: 'ONLINE',
      city: 'Bologna',
      address: 'Via Indipendenza',
      page: 6,
      size: 18,
      sort: 'name,asc',
    });

    expect(mockGetMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant-123', {
      initiativeFilter: 'ALL_INITIATIVES',
      initiativeId: 'initiative-2',
      type: 'ONLINE',
      city: 'Bologna',
      address: 'Via Indipendenza',
      sort: 'name,asc',
      page: 6,
      size: 18,
    });
  });

  it('shows a generic error and does not call associate service when merchant id is missing', async () => {
    mockParseJwt.mockReturnValue({});

    renderComponent();

    fireEvent.click(screen.getByTestId('selection-button'));
    fireEvent.click(screen.getByText('pages.posCatalog.actions.associate (2)'));

    fireEvent.mouseDown(
      screen.getByRole('combobox', {
        name: /pages.posCatalog.associateModal.initiativeLabel/,
      })
    );
    fireEvent.click(screen.getByText('Initiative One'));
    fireEvent.click(screen.getByText('actions.confirm'));

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        title: 'errors.genericTitle',
        text: 'errors.genericDescription',
        isOpen: true,
        severity: 'error',
      });
    });
    expect(mockAssociatePos).not.toHaveBeenCalled();
    expect(screen.queryByTestId('associate-selected-pos-modal')).not.toBeInTheDocument();
  });

  it('closes the association modal when association fails', async () => {
    mockAssociatePos.mockRejectedValueOnce(new Error('association failed'));

    renderComponent();

    fireEvent.click(screen.getByTestId('selection-button'));
    fireEvent.click(screen.getByText('pages.posCatalog.actions.associate (2)'));

    fireEvent.mouseDown(
      screen.getByRole('combobox', {
        name: /pages.posCatalog.associateModal.initiativeLabel/,
      })
    );
    fireEvent.click(screen.getByText('Initiative One'));
    fireEvent.click(screen.getByText('actions.confirm'));

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        title: 'errors.genericTitle',
        text: 'errors.genericDescription',
        isOpen: true,
        severity: 'error',
      });
    });
    expect(screen.queryByTestId('associate-selected-pos-modal')).not.toBeInTheDocument();
  });

  it('hides selection actions when filters are applied or reset', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('selection-button'));
    expect(screen.getByText('pages.posCatalog.actions.exclude (2)')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('apply-filters'));
    expect(screen.queryByText('pages.posCatalog.actions.exclude')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('selection-button'));
    expect(screen.getByText('pages.posCatalog.actions.associate (2)')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('reset-filters'));
    expect(screen.queryByText('pages.posCatalog.actions.associate')).not.toBeInTheDocument();
  });

  it('hides selection actions when page changes', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('selection-button'));
    expect(screen.getByText('pages.posCatalog.actions.associate (2)')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('page-button'));

    expect(screen.queryByText('pages.posCatalog.actions.associate')).not.toBeInTheDocument();
    expect(mockHandlePaginationPageChange).toHaveBeenCalledWith(3);
  });

  it('hides selection actions when rows per page or sort changes', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('selection-button'));
    expect(screen.getByText('pages.posCatalog.actions.associate (2)')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('rows-button'));
    expect(screen.queryByText('pages.posCatalog.actions.associate')).not.toBeInTheDocument();
    expect(mockHandleRowsPerPageChange).toHaveBeenCalledWith(25);

    fireEvent.click(screen.getByTestId('selection-button'));
    expect(screen.getByText('pages.posCatalog.actions.exclude (2)')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('sort-button'));
    expect(screen.queryByText('pages.posCatalog.actions.exclude')).not.toBeInTheDocument();
    expect(mockHandleSortModelChange).toHaveBeenCalledWith([{ field: 'referent', sort: 'desc' }]);
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

  it('refreshes the catalog through the drawer operation callback', () => {
    renderComponent();

    drawerProps.onOperationCompleted();

    expect(mockHandleFiltersApplied).toHaveBeenCalledWith(defaultFormikValues);
  });

  it('builds the columns with action callback', () => {
    renderComponent();

    expect(mockBuildPointOfSalesColumns).toHaveBeenCalledWith(
      expect.objectContaining({
        onActionClick: expect.any(Function),
        t: expect.any(Function),
      })
    );
    expect(dataTableProps.checkable).toBe(true);
    expect(dataTableProps.isRowSelectable).toBeUndefined();
    expect(dataTableProps.onSelectionModelChange).toEqual(expect.any(Function));
    expect(dataTableProps.selectionModel).toEqual([]);
  });

  it('provides a fetchStores callback to the table hook that returns an empty result without merchant id', async () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];
    mockParseJwt.mockReturnValueOnce({});

    const result = await hookArgs.fetchStores({
      associated: 'YES',
      initiative: 'initiative-1',
      type: 'ONLINE',
      city: 'Rome',
      address: 'Street',
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
      associated: 'YES',
      initiative: 'initiative-1',
      type: 'PHYSICAL',
      city: 'Milan',
      address: 'Via Milano',
      page: 2,
      size: 30,
      sort: 'name,asc',
    });

    expect(mockStorageRead).toHaveBeenCalled();
    expect(mockParseJwt).toHaveBeenCalledWith('mock-token');
    expect(mockGetMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant-123', {
      initiativeFilter: 'ALL_INITIATIVES',
      initiativeId: 'initiative-1',
      type: 'PHYSICAL',
      city: 'Milan',
      address: 'Via Milano',
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

  it('maps missing initiative id and name to empty option values', () => {
    mockUseAppSelector.mockReturnValue([
      { initiativeId: undefined, initiativeName: undefined, status: 'PUBLISHED' },
    ]);

    renderComponent();

    expect(filtersProps.initiativeOptions).toEqual([{ value: '', label: '' }]);
    expect(drawerProps.initiativeOptions).toEqual([{ value: '', label: '' }]);
    expect(drawerProps.publishedInitiativeOptions).toEqual([{ value: '', label: '' }]);
  });

  it('uses default pagination values without initiative filter when no initiative is selected', async () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];

    await hookArgs.fetchStores({
      initiative: '',
      type: undefined,
      city: '',
      address: '',
      sort: 'franchiseName,asc',
    });

    expect(mockGetMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant-123', {
      type: undefined,
      city: '',
      address: '',
      sort: 'franchiseName,asc',
      page: 0,
      size: 10,
    });
  });

  it('maps associated YES to ALL_INITIATIVES when no single initiative is selected', async () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];

    await hookArgs.fetchStores({
      associated: 'YES',
      initiative: '',
      type: 'PHYSICAL',
      city: 'Milan',
      address: 'Via Milano',
      page: 2,
      size: 30,
      sort: 'name,asc',
    });

    expect(mockGetMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant-123', {
      initiativeFilter: 'ALL_INITIATIVES',
      type: 'PHYSICAL',
      city: 'Milan',
      address: 'Via Milano',
      sort: 'name,asc',
      page: 2,
      size: 30,
    });
  });

  it('maps associated YES and ALL_INITIATIVES selection to the initiative filter only', async () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];

    await hookArgs.fetchStores({
      associated: 'YES',
      initiative: 'ALL_INITIATIVES',
      type: 'PHYSICAL',
      city: 'Milan',
      address: 'Via Milano',
      page: 2,
      size: 30,
      sort: 'name,asc',
    });

    expect(mockGetMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant-123', {
      initiativeFilter: 'ALL_INITIATIVES',
      type: 'PHYSICAL',
      city: 'Milan',
      address: 'Via Milano',
      sort: 'name,asc',
      page: 2,
      size: 30,
    });
  });

  it('maps associated YES and NO_INITIATIVE selection to the initiative filter only', async () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];

    await hookArgs.fetchStores({
      associated: 'YES',
      initiative: 'NO_INITIATIVE',
      type: 'ONLINE',
      city: 'Rome',
      address: 'Via Roma',
      page: 1,
      size: 20,
      sort: 'name,desc',
    });

    expect(mockGetMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant-123', {
      initiativeFilter: 'NO_INITIATIVE',
      type: 'ONLINE',
      city: 'Rome',
      address: 'Via Roma',
      sort: 'name,desc',
      page: 1,
      size: 20,
    });
  });

  it('maps associated NO to NO_INITIATIVE when fetching stores', async () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];

    await hookArgs.fetchStores({
      associated: 'NO',
      initiative: '',
      type: 'ONLINE',
      city: 'Rome',
      address: 'Via Roma',
      page: 1,
      size: 20,
      sort: 'name,desc',
    });

    expect(mockGetMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant-123', {
      initiativeFilter: 'NO_INITIATIVE',
      type: 'ONLINE',
      city: 'Rome',
      address: 'Via Roma',
      sort: 'name,desc',
      page: 1,
      size: 20,
    });
  });

  it('maps a selected NO_INITIATIVE filter without association to the initiative filter only', async () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];

    await hookArgs.fetchStores({
      initiative: 'NO_INITIATIVE',
      type: 'ONLINE',
      city: 'Naples',
      address: 'Via Toledo',
      page: 4,
      size: 15,
      sort: 'name,asc',
    });

    expect(mockGetMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant-123', {
      initiativeFilter: 'NO_INITIATIVE',
      type: 'ONLINE',
      city: 'Naples',
      address: 'Via Toledo',
      sort: 'name,asc',
      page: 4,
      size: 15,
    });
  });

  it('maps a selected initiative without association to the initiative id only', async () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];

    await hookArgs.fetchStores({
      initiative: 'initiative-2',
      type: 'PHYSICAL',
      city: 'Florence',
      address: 'Via de Tornabuoni',
      page: 7,
      size: 14,
      sort: 'name,asc',
    });

    expect(mockGetMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant-123', {
      initiativeId: 'initiative-2',
      type: 'PHYSICAL',
      city: 'Florence',
      address: 'Via de Tornabuoni',
      sort: 'name,asc',
      page: 7,
      size: 14,
    });
  });

  it('maps ALL_INITIATIVES selection without association to the initiative filter only', async () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];

    await hookArgs.fetchStores({
      initiative: 'ALL_INITIATIVES',
      type: 'PHYSICAL',
      city: 'Turin',
      address: 'Corso Francia',
      page: 5,
      size: 12,
      sort: 'name,desc',
    });

    expect(mockGetMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant-123', {
      initiativeFilter: 'ALL_INITIATIVES',
      type: 'PHYSICAL',
      city: 'Turin',
      address: 'Corso Francia',
      sort: 'name,desc',
      page: 5,
      size: 12,
    });
  });

  it('passes an empty merchant id to the drawer when the token has no merchant_id', () => {
    mockParseJwt.mockReturnValue({});

    renderComponent();

    fireEvent.click(screen.getByTestId('row-action-store-1'));

    expect(screen.getByTestId('drawer-merchant-id')).toHaveTextContent('');
  });

  it('disables single actions based on user permissions', () => {
    mockIsActionDisabled.mockImplementation((permissionKey: string) =>
      permissionKey === 'POS_CATALOG_ASSOCIATE'
    );

    renderComponent();

    fireEvent.click(screen.getByTestId('selection-button'));

    expect(screen.getByText('pages.posCatalog.actions.associate (2)')).toBeDisabled();
    expect(screen.getByText('pages.posCatalog.actions.exclude (2)')).not.toBeDisabled();
  });

  it('handles exclusion failures by closing the modal and showing the generic error', async () => {
    mockExcludePos.mockRejectedValueOnce(new Error('exclusion failed'));

    renderComponent();

    fireEvent.click(screen.getByTestId('selection-button'));
    fireEvent.click(screen.getByText('pages.posCatalog.actions.exclude (2)'));

    fireEvent.mouseDown(
      screen.getByRole('combobox', {
        name: /pages.posCatalog.excludeModal.initiativeLabel/,
      })
    );
    fireEvent.click(screen.getByText('Initiative One'));
    fireEvent.click(
      within(screen.getByTestId('exclude-selected-pos-modal')).getByText(
        'pages.posCatalog.actions.exclude'
      )
    );

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        title: 'errors.genericTitle',
        text: 'errors.genericDescription',
        isOpen: true,
        severity: 'error',
      });
    });
    expect(screen.queryByTestId('exclude-selected-pos-modal')).not.toBeInTheDocument();
  });

  it('shows the partial exclusion title and success alert after closing the result modal', async () => {
    mockExcludePos.mockResolvedValueOnce({
      excludedPointOfSales: [{ pointOfSaleId: 'store-1', franchiseName: 'Store One' }],
      notExcludedPointOfSales: [{ pointOfSaleId: 'store-2', reason: 'ALREADY_EXCLUDED' }],
    });

    renderComponent();

    fireEvent.click(screen.getByTestId('selection-button'));
    fireEvent.click(screen.getByText('pages.posCatalog.actions.exclude (2)'));

    fireEvent.mouseDown(
      screen.getByRole('combobox', {
        name: /pages.posCatalog.excludeModal.initiativeLabel/,
      })
    );
    fireEvent.click(screen.getByText('Initiative One'));
    fireEvent.click(
      within(screen.getByTestId('exclude-selected-pos-modal')).getByText(
        'pages.posCatalog.actions.exclude'
      )
    );

    const exclusionResultModal = await screen.findByTestId('point-of-sale-exclusion-result-modal');
    expect(
      within(exclusionResultModal).getByText(
        'pages.posCatalog.exclusionResultModal.partialTitle'
      )
    ).toBeInTheDocument();

    fireEvent.click(within(exclusionResultModal).getByText('actions.okClose'));

    await waitFor(() => {
      expect(mockHandleFiltersApplied).toHaveBeenCalledWith(defaultFormikValues);
    });
    expect(mockSetAlert).toHaveBeenCalledWith({
      text: 'pages.posCatalog.excludeSuccess',
      isOpen: true,
      severity: 'success',
      timeout: 6000,
    });
  });

  it('handles an undefined initiatives list by passing no options to children', () => {
    mockUseAppSelector.mockReturnValue(undefined);

    renderComponent();

    expect(screen.getByTestId('initiative-options-count')).toHaveTextContent('0');
  });
});
