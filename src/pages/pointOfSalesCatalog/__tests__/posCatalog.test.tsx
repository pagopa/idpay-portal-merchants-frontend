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
  associatePos: (...args: Array<unknown>) => mockAssociatePos(...args),
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
  contactName: '',
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
    screen.getByText((_, element) =>
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
      { initiativeId: 'initiative-1', initiativeName: 'Initiative One' },
      { initiativeId: 'initiative-2', initiativeName: 'Initiative Two' },
    ]);
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
    mockAssociatePos.mockResolvedValue({
      associated: [{ pointOfSaleId: 'store-1', pointOfSaleName: 'Store One' }],
      notAssociated: [],
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
    expect(filtersProps.fields).toEqual(['initiative', 'type', 'city', 'address', 'contactName']);
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
    });
    expect(mockHandleFiltersApplied).toHaveBeenCalledWith(defaultFormikValues);
    expect(screen.queryByTestId('associate-selected-pos-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pos-catalog-drawer')).not.toBeInTheDocument();
  });

  it('shows already associated stores before the success alert when the response contains them', async () => {
    mockAssociatePos.mockResolvedValueOnce({
      associated: [{ pointOfSaleId: 'store-1', pointOfSaleName: 'Store One' }],
      notAssociated: [
        {
          pointOfSaleId: 'store-2',
          pointOfSaleName: 'Store Already',
          reason: 'ALREADY_ASSOCIATED',
          address: 'Via Roma',
          streetNumber: '10',
          city: 'Rome',
          type: 'PHYSICAL',
        },
        {
          pointOfSaleId: 'store-3',
          pointOfSaleName: 'Store Online',
          reason: 'ALREADY_ASSOCIATED',
          website: 'www.shop.it',
          type: 'ONLINE',
        },
        {
          pointOfSaleId: 'store-4',
          pointOfSaleName: 'Store Invalid',
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

  it('maps missing initiative id and name to empty option values', () => {
    mockUseAppSelector.mockReturnValueOnce([
      { initiativeId: undefined, initiativeName: undefined },
    ]);

    renderComponent();

    expect(filtersProps.initiativeOptions).toEqual([{ value: '', label: '' }]);
    expect(drawerProps.initiativeOptions).toEqual([{ value: '', label: '' }]);
  });

  it('uses default pagination values when fetch filters omit page and size', async () => {
    renderComponent();

    const hookArgs = mockUsePointOfSalesTable.mock.calls[0][0];

    await hookArgs.fetchStores({
      initiative: '',
      type: undefined,
      city: '',
      address: '',
      contactName: '',
      sort: 'franchiseName,asc',
    });

    expect(mockGetMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant-123', {
      initiativeId: '',
      type: undefined,
      city: '',
      address: '',
      contactName: '',
      sort: 'franchiseName,asc',
      page: 0,
      size: 10,
    });
  });

  it('passes an empty merchant id to the drawer when the token has no merchant_id', () => {
    mockParseJwt.mockReturnValue({});

    renderComponent();

    fireEvent.click(screen.getByTestId('row-action-store-1'));

    expect(screen.getByTestId('drawer-merchant-id')).toHaveTextContent('');
  });

  it('handles an undefined initiatives list by passing no options to children', () => {
    mockUseAppSelector.mockReturnValueOnce(undefined);

    renderComponent();

    expect(screen.getByTestId('initiative-options-count')).toHaveTextContent('0');
  });
});
