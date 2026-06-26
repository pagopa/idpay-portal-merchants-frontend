import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia/theme';
import InitiativeStores from '../InitiativeStores';
import { browserConsole } from '../../../utils/consoleLogger';

const mockId = 'initiative-123';
const mockSetAlert = jest.fn();
const mockHistory = {
  replace: jest.fn(),
  push: jest.fn(),
};

const mockHandleFiltersApplied = jest.fn();
const mockHandleFiltersReset = jest.fn();
const mockHandleSortModelChange = jest.fn();
const mockHandlePaginationPageChange = jest.fn();
const mockHandleRowsPerPageChange = jest.fn();
const mockUsePointOfSalesTable = jest.fn();
const mockBuildPointOfSalesColumns = jest.fn();

let dataTableProps: any = {};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  withTranslation: () => (Component: React.ComponentType<any>) => (props: any) =>
    <Component {...props} />,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ ...mockHistory }),
  useLocation: jest.fn(() => ({ state: {}, pathname: '/' })),
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => ({ initiativeId: mockId }),
}));

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({ setAlert: mockSetAlert }),
}));

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key: string) => key,
    isLoading: false,
    initiativeName: undefined,
  }),
}));

jest.mock('../../../components/pointsOfSale/usePointOfSalesTable', () => ({
  __esModule: true,
  default: (...args: Array<unknown>) => mockUsePointOfSalesTable(...args),
}));

jest.mock('../../../components/pointsOfSale/pointOfSalesColumns', () => ({
  __esModule: true,
  default: (...args: Array<unknown>) => mockBuildPointOfSalesColumns(...args),
}));

jest.mock('../../../components/pointsOfSale/PointOfSalesFilters', () => (props: any) => (
  <div data-testid="mock-filters">
    <button data-testid="apply-filters-test" onClick={() => props.onFiltersApplied(props.formik.values)}>
      Apply
    </button>
    <button data-testid="reset-filters-test" onClick={() => props.onFiltersReset()}>
      Reset
    </button>
  </div>
));

jest.mock('../../../components/dataTable/DataTable', () => (props: any) => {
  dataTableProps = props;
  return (
    <div data-testid="mock-datatable">
      <button
        data-testid="sort-button"
        onClick={() => props.onSortModelChange([{ field: 'referent', sort: 'desc' }])}
      >
        Sort
      </button>
      <button data-testid="paginate-button" onClick={() => props.onPaginationPageChange(2)}>
        Paginate
      </button>
      <button data-testid="page-size-button" onClick={() => props.onRowsPerPageChange(25)}>
        Change page size
      </button>
      {props.rows.map((row: any) => (
        <div key={row.id} onClick={() => props.columns[0]?.renderCell?.({ row })}>
          {row.franchiseName}
        </div>
      ))}
    </div>
  );
});

const mockStores = [
  {
    id: '1',
    franchiseName: 'Store A',
    type: 'PHYSICAL',
    address: 'Via Roma 1',
    city: 'Roma',
    contactName: 'Mario',
    contactSurname: 'Rossi',
    contactEmail: 'mario@test.com',
    website: 'www.storea.com',
  },
];

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

const renderComponent = () =>
  render(
    <ThemeProvider theme={theme}>
      <InitiativeStores />
    </ThemeProvider>
  );

describe('<InitiativeStores />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dataTableProps = {};
    const { useLocation } = jest.requireMock('react-router-dom');
    useLocation.mockReturnValue({ state: {}, pathname: '/' });
    mockUsePointOfSalesTable.mockReturnValue(defaultHookValue);
    mockBuildPointOfSalesColumns.mockReturnValue([
      {
        field: 'franchiseName',
        renderCell: ({ row }: any) => row.franchiseName,
      },
      {
        field: 'actions',
        renderCell: ({ row }: any) => (
          <button onClick={() => mockHistory.push(`/portale-esercenti/${mockId}/punti-vendita/${row.id}/`)}>
            action
          </button>
        ),
      },
    ]);
  });

  test('renderizza titolo, filtri, tabella e bottone aggiungi quando ci sono store', () => {
    renderComponent();

    expect(screen.getByText('pages.initiativeStores.title')).toBeInTheDocument();
    expect(screen.getByTestId('mock-filters')).toBeInTheDocument();
    expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
    expect(screen.getByText('pages.initiativeStores.addStoreList')).toBeInTheDocument();
    expect(screen.getByText('Store A')).toBeInTheDocument();
  });

  test('mostra il loader quando storesLoading è true', () => {
    mockUsePointOfSalesTable.mockReturnValue({
      ...defaultHookValue,
      stores: [],
      storesLoading: true,
    });

    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-datatable')).not.toBeInTheDocument();
  });

  test('mostra lo stato vuoto e naviga alla pagina di censimento se non ci sono store', () => {
    mockUsePointOfSalesTable.mockReturnValue({
      ...defaultHookValue,
      stores: [],
      storesLoading: false,
      filtersAppliedOnce: false,
    });

    renderComponent();

    expect(screen.getByText('pages.initiativeStores.noStores')).toBeInTheDocument();
    fireEvent.click(screen.getByText('pages.initiativeStores.addStoreNoResults'));

    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/${mockId}/punti-vendita/censisci/`
    );
  });

  test('mostra lo stato vuoto per filtri applicati senza link di censimento', () => {
    mockUsePointOfSalesTable.mockReturnValue({
      ...defaultHookValue,
      stores: [],
      storesLoading: false,
      filtersAppliedOnce: true,
    });

    renderComponent();

    expect(screen.getByText('pages.initiativeStores.noStoresInitiative')).toBeInTheDocument();
    expect(screen.queryByText('pages.initiativeStores.addStoreNoResults')).not.toBeInTheDocument();
  });

  test('invoca gli handler del hook tramite filtri e tabella', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('apply-filters-test'));
    fireEvent.click(screen.getByTestId('reset-filters-test'));
    fireEvent.click(screen.getByTestId('sort-button'));
    fireEvent.click(screen.getByTestId('paginate-button'));
    fireEvent.click(screen.getByTestId('page-size-button'));

    expect(mockHandleFiltersApplied).toHaveBeenCalled();
    expect(mockHandleFiltersReset).toHaveBeenCalled();
    expect(mockHandleSortModelChange).toHaveBeenCalledWith([{ field: 'referent', sort: 'desc' }]);
    expect(mockHandlePaginationPageChange).toHaveBeenCalledWith(2);
    expect(mockHandleRowsPerPageChange).toHaveBeenCalledWith(25);
  });

  test('naviga alla pagina di aggiunta punto vendita dal bottone principale', () => {
    renderComponent();

    fireEvent.click(screen.getByText('pages.initiativeStores.addStoreList'));

    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/${mockId}/punti-vendita/censisci/`
    );
  });

  test('mostra alert di successo e resetta lo state di location', () => {
    const { useLocation } = jest.requireMock('react-router-dom');
    useLocation.mockReturnValue({
      state: { showSuccessAlert: true },
      pathname: '/',
    });

    renderComponent();

    expect(mockSetAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'pages.initiativeStores.pointOfSalesUploadSuccess',
        severity: 'success',
      })
    );
    expect(mockHistory.replace).toHaveBeenCalledWith(
      expect.objectContaining({
        state: expect.objectContaining({ showSuccessAlert: false }),
      })
    );
  });

  test('mantiene il componente renderizzabile anche con spy sul logger', () => {
    const consoleLogSpy = jest.spyOn(browserConsole, 'log').mockImplementation(() => undefined);

    renderComponent();

    expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
    consoleLogSpy.mockRestore();
  });

  test('passa le colonne costruite al DataTable', () => {
    renderComponent();

    expect(mockBuildPointOfSalesColumns).toHaveBeenCalledWith(
      expect.objectContaining({
        addressMode: 'initiative',
        onActionClick: expect.any(Function),
      })
    );
    expect(dataTableProps.columns).toHaveLength(2);
  });
});
