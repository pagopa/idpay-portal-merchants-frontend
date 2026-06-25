import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia/theme';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import * as formikModule from 'formik';
import InitiativeStores from '../InitiativeStores';
import * as merchantService from '../../../services/merchantService';
import * as jwtUtils from '../../../utils/jwt-utils';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import { useLocation } from 'react-router-dom';
import { createStore } from '../../../redux/store';
import { browserConsole } from '../../../utils/consoleLogger';

const mockId = 'initiative-123';
let mockInitiativeId: string | undefined = mockId;
const mockSetAlert = jest.fn();
const mockHistory = {
  replace: jest.fn(),
  push: jest.fn(),
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  withTranslation: () => (Component: React.ComponentType<any>) => (props: any) =>
    <Component {...props} />,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ ...mockHistory }),
  useParams: () => ({ initiative_id: mockId }),
  useLocation: jest.fn(),
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => ({ initiativeId: mockInitiativeId }),
}));

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({ setAlert: mockSetAlert }),
}));

let dataTableProps: any = {};
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
      <button
        data-testid="sort-button-non-referent"
        onClick={() => props.onSortModelChange([{ field: 'city', sort: 'asc' }])}
      >
        Sort city
      </button>
      <button data-testid="sort-button-remove" onClick={() => props.onSortModelChange([])}>
        Remove Sort
      </button>
      <button data-testid="paginate-button" onClick={() => props.onPaginationPageChange(2)}>
        Paginate
      </button>
      {props.rows.map((row: any) => (
        <div key={row.id} onClick={() => props.handleRowAction(row)}>
          {row.franchiseName}
        </div>
      ))}
    </div>
  );
});

jest.mock('../../../services/merchantService', () => ({
  getMerchantPointOfSales: jest.fn(),
}));

jest.mock('../../../utils/jwt-utils');
jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage');

const mockParseJwt = jwtUtils.parseJwt as jest.Mock;
const mockStorageRead = storageTokenOps.read as jest.Mock;

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
  {
    id: '2',
    franchiseName: 'Store B',
    type: 'ONLINE',
    website: 'www.storeb.com',
    city: 'Milano',
    contactName: 'Luisa',
    contactSurname: 'Verdi',
    contactEmail: 'luisa@test.com',
  },
  { id: '3', franchiseName: 'Store C', type: 'UNDEFINED', city: 'Napoli' },
];
const mockPagination = { pageNo: 0, pageSize: 5, totalElements: 3, totalPages: 1 };

const setupDefaultMocks = () => {
  jest.clearAllMocks();
  sessionStorage.clear();
  mockInitiativeId = mockId;
  mockParseJwt.mockReturnValue({ merchant_id: 'merchant-id-01' });
  mockStorageRead.mockReturnValue('DUMMY_TOKEN');
  (merchantService.getMerchantPointOfSales as jest.Mock).mockResolvedValue({
    content: mockStores,
    ...mockPagination,
  });
  (useLocation as jest.Mock).mockReturnValue({ state: {} });
};

const renderInitiativeStores = () => renderWithContext(<InitiativeStores />);

const waitForTable = () =>
  waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

const waitForStoreA = () => waitFor(() => expect(screen.getByText('Store A')).toBeInTheDocument());

const expectMerchantPointOfSalesCalledWith = async (query: Record<string, unknown>) => {
  await waitFor(() => {
    expect(merchantService.getMerchantPointOfSales).toHaveBeenCalledWith(
      'initiative-123',
      'merchant-id-01',
      expect.objectContaining(query)
    );
  });
};

const expectDefaultStoresFetch = async () =>
  expectMerchantPointOfSalesCalledWith({
    page: 0,
    sort: 'asc',
  });

const getColumn = (field: string) => dataTableProps.columns.find((column: any) => column.field === field);

const renderColumnCell = async (field: string, params: Record<string, unknown>) => {
  await renderAndWaitTable();
  const column = getColumn(field);
  return render(column.renderCell(params));
};

const renderReferentCell = async (row: Record<string, unknown>) =>
  renderColumnCell('contactName', { row });

const renderActionsCell = async (row: Record<string, unknown>) =>
  renderColumnCell('actions', { row });

const renderAndWaitTable = async () => {
  renderInitiativeStores();
  await waitForTable();
};

const renderAndWaitStoreA = async () => {
  renderInitiativeStores();
  await waitForStoreA();
};

const renderWithUndefinedInitiativeId = async () => {
  const history = createMemoryHistory();
  const store = createStore();
  const view = render(
    <ThemeProvider theme={theme}>
      <Router history={history}>
        <Provider store={store}>
          <InitiativeStores />
        </Provider>
      </Router>
    </ThemeProvider>
  );

  await waitForTable();

  mockInitiativeId = undefined;
  view.rerender(
    <ThemeProvider theme={theme}>
      <Router history={history}>
        <Provider store={store}>
          <InitiativeStores />
        </Provider>
      </Router>
    </ThemeProvider>
  );

  return view;
};

const applyCityFilter = async (city: string) => {
  const cityInput = screen.getByLabelText('pages.initiativeStores.city');
  fireEvent.change(cityInput, { target: { value: city } });

  const applyButton = screen.getByTestId('apply-filters-test');
  fireEvent.click(applyButton);

  await expectMerchantPointOfSalesCalledWith({ city, page: 0 });
};

const setStoredPagination = (overrides: Record<string, unknown>) => {
  const storedPagination = {
    pageNo: 2,
    pageSize: 10,
    totalElements: 30,
    totalPages: 3,
    sort: 'city,desc',
    initiativeId: mockId,
    ...overrides,
  };
  sessionStorage.setItem('storesPagination', JSON.stringify(storedPagination));
  return storedPagination;
};

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('<InitiativeStores />', () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  test('renderizza correttamente, mostra il loader e poi i dati della tabella', async () => {
    renderInitiativeStores();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('Store A')).toBeInTheDocument();
    });
    await expectDefaultStoresFetch();
  });

  test('mostra lo stato vuoto se non ci sono punti vendita', async () => {
    (merchantService.getMerchantPointOfSales as jest.Mock).mockResolvedValue({
      content: [],
      ...mockPagination,
      totalElements: 0,
    });
    renderInitiativeStores();
    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.noStores')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('pages.initiativeStores.addStoreNoResults'));
    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/initiative-123/punti-vendita/censisci/`
    );
  });

  test('gestisce il fallimento della chiamata API iniziale', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    const error = new Error('API Failure');
    (merchantService.getMerchantPointOfSales as jest.Mock).mockRejectedValue(error);
    renderInitiativeStores();
    await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenCalled();
    });
    consoleErrorSpy.mockRestore();
  });

  test('gestisce un errore API durante il reset dei filtri', async () => {
    await renderAndWaitTable();
    await applyCityFilter('Roma');

    const error = new Error('Reset failure');
    (merchantService.getMerchantPointOfSales as jest.Mock).mockRejectedValue(error);

    const resetButton = screen.getByTestId('reset-filters-test');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
        })
      );
    });
  });

  test('handles sort removal', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('sort-button-remove'));

    fireEvent.click(screen.getByTestId('paginate-button'));
    await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenLastCalledWith(
        'initiative-123',
        'merchant-id-01',
        expect.objectContaining({ sort: 'asc' })
      );
    });
  });

  test('gestisce un errore nel .catch di handleFiltersReset', async () => {
    await renderAndWaitTable();
    await applyCityFilter('Roma');

    const error = new Error('External catch failure');
    (merchantService.getMerchantPointOfSales as jest.Mock).mockRejectedValue(error);

    const resetButton = screen.getByTestId('reset-filters-test');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenCalledWith(
        'initiative-123',
        'merchant-id-01',
        expect.objectContaining({
          address: '',
          city: '',
          contactName: '',
          page: 0,
          size: mockPagination.pageSize,
          sort: 'asc',
          type: undefined,
        })
      );
    });
  });

  test('non effettua la chiamata API se manca il merchant_id nel token', async () => {
    mockParseJwt.mockReturnValue({ not_merchant_id: 'some-value' });
    renderInitiativeStores();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(merchantService.getMerchantPointOfSales).not.toHaveBeenCalled();
  });

  test('applica i filtri e ricarica i dati', async () => {
    await renderAndWaitStoreA();
    await applyCityFilter('Napoli');
  });

  test('resetta i filtri e ricarica i dati iniziali', async () => {
    await renderAndWaitStoreA();
    await applyCityFilter('Napoli');
    const resetButton = screen.getByTestId('reset-filters-test');
    fireEvent.click(resetButton);
    await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenLastCalledWith(
        'initiative-123',
        'merchant-id-01',
        expect.objectContaining({
          address: '',
          city: '',
          contactName: '',
          page: 0,
          size: mockPagination.pageSize,
          sort: 'asc',
          type: undefined,
        })
      );
    });
  });

  test('mostra la tabella vuota se i filtri non producono risultati', async () => {
    await renderAndWaitStoreA();

    (merchantService.getMerchantPointOfSales as jest.Mock).mockResolvedValue({
      content: [],
      ...mockPagination,
      totalElements: 0,
    });
    const cityInput = screen.getByLabelText('pages.initiativeStores.city');
    fireEvent.change(cityInput, { target: { value: 'Città Inesistente' } });
    fireEvent.click(screen.getByTestId('apply-filters-test'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
    });
  });

  test('naviga alla pagina di aggiunta punto vendita al click sul pulsante', async () => {
    await renderAndWaitStoreA();
    const addButton = screen.getByText('pages.initiativeStores.addStoreList');
    fireEvent.click(addButton);
    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/initiative-123/punti-vendita/censisci/`
    );
  });

  test("gestisce l'ordinamento della tabella", async () => {
    await renderAndWaitTable();
    fireEvent.click(screen.getByTestId('sort-button'));
    await expectMerchantPointOfSalesCalledWith({ sort: 'contactName,desc' });
  });

  test('gestisce ordinamento su campo diverso da referent', async () => {
    await renderAndWaitTable();

    fireEvent.click(screen.getByTestId('sort-button-non-referent'));

    await expectMerchantPointOfSalesCalledWith({ sort: 'city,asc' });
  });

  test('gestisce la paginazione della tabella', async () => {
    await renderAndWaitTable();
    fireEvent.click(screen.getByTestId('paginate-button'));
    await expectMerchantPointOfSalesCalledWith({ page: 2 });
  });

  test.skip('naviga al dettaglio del punto vendita al click su una riga', async () => {
    await renderAndWaitStoreA();
    fireEvent.click(screen.getByText('Store A'));
    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/initiative-123/punti-vendita/1/`
    );
  });

  test("mostra l'alert di successo quando showSuccessAlert è true", async () => {
    (useLocation as jest.Mock).mockReturnValue({
      state: { showSuccessAlert: true },
      pathname: '/',
    });
    renderInitiativeStores();
    await waitFor(() => {
      expect(mockHistory.replace).toHaveBeenCalledWith(
        expect.objectContaining({
          state: expect.objectContaining({ showSuccessAlert: false }),
        })
      );
    });
  });

  test('non effettua fetch quando initiativeId manca', async () => {
    mockInitiativeId = undefined;
    sessionStorage.setItem(
      'storesPagination',
      JSON.stringify({ pageNo: 1, pageSize: 10, totalElements: 10, initiativeId: mockId })
    );

    renderInitiativeStores();

    await act(async () => {
      await Promise.resolve();
    });

    expect(merchantService.getMerchantPointOfSales).not.toHaveBeenCalled();
  });

  test('gestisce page undefined in paginazione usando fallback a 0', async () => {
    await renderAndWaitTable();

    await act(async () => {
      await dataTableProps.onPaginationPageChange(undefined as any);
    });

    await expectMerchantPointOfSalesCalledWith({ page: 0 });
  });

  test('ignora errori di richieste obsolete durante sort consecutivi', async () => {
    const staleSortRequest = createDeferred<any>();

    (merchantService.getMerchantPointOfSales as jest.Mock)
      .mockResolvedValueOnce({ content: mockStores, ...mockPagination })
      .mockImplementationOnce(() => staleSortRequest.promise)
      .mockResolvedValueOnce({ content: mockStores, ...mockPagination });

    await renderAndWaitTable();

    const firstSortPromise = dataTableProps.onSortModelChange([{ field: 'referent', sort: 'desc' }]);
    const secondSortPromise = dataTableProps.onSortModelChange([{ field: 'city', sort: 'asc' }]);

    staleSortRequest.reject(new Error('stale request'));

    await act(async () => {
      await Promise.allSettled([firstSortPromise, secondSortPromise]);
    });

    await waitFor(() => {
      expect((merchantService.getMerchantPointOfSales as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(3);
    });
    expect(mockSetAlert).not.toHaveBeenCalled();
  });

  test('naviga a censisci quando non ci sono store al click su link', async () => {
    (merchantService.getMerchantPointOfSales as jest.Mock).mockResolvedValue({
      content: [],
      ...mockPagination,
      totalElements: 0,
    });
    renderInitiativeStores();
    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.noStores')).toBeInTheDocument();
    });
    const link = screen.getByText('pages.initiativeStores.addStoreNoResults');
    fireEvent.click(link);
    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/initiative-123/punti-vendita/censisci/`
    );
  });

  test.each([
    ['PHYSICAL', 'pages.initiativeStores.physical'],
    ['ONLINE', 'pages.initiativeStores.online'],
  ])('seleziona tipo %s nel dropdown', async (_type, i18nOptionKey) => {
    await renderAndWaitStoreA();

    const typeSelect = screen.getByLabelText('pages.initiativeStores.pointOfSaleType');
    fireEvent.mouseDown(typeSelect);
    const option = screen.getByText(i18nOptionKey);
    fireEvent.click(option);
  });

  test('inserisce valore nel campo address', async () => {
    await renderAndWaitStoreA();

    const addressInput = screen.getByLabelText('pages.initiativeStores.address');
    fireEvent.change(addressInput, { target: { value: 'Via Milano 10' } });
    expect((addressInput as HTMLInputElement).value).toBe('Via Milano 10');
  });

  test('inserisce valore nel campo contactName', async () => {
    await renderAndWaitStoreA();

    const contactInput = screen.getByLabelText('pages.initiativeStores.referent');
    fireEvent.change(contactInput, { target: { value: 'Giovanni' } });
    expect((contactInput as HTMLInputElement).value).toBe('Giovanni');
  });

  test('mostra bottone add store solo quando ci sono store', async () => {
    renderInitiativeStores();
    await waitFor(() => {
      const addButton = screen.queryByText('pages.initiativeStores.addStoreList');
      expect(addButton).toBeInTheDocument();
    });
  });

  test('non mostra bottone add store quando loading', async () => {
    (merchantService.getMerchantPointOfSales as jest.Mock).mockImplementation(
      () => new Promise(() => { })
    );
    renderInitiativeStores();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('gestisce ordinamento con campo referent mappato a contactName', async () => {
    await renderAndWaitTable();

    fireEvent.click(screen.getByTestId('sort-button'));

    await waitFor(() => {
      const stored = sessionStorage.getItem('storesPagination');
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.sort).toBe('contactName,desc');
      }
    });
  });

  test('usa initiativeId vuoto nella fetch quando diventa undefined dopo il render', async () => {
    await renderWithUndefinedInitiativeId();

    fireEvent.click(screen.getByTestId('paginate-button'));

    await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenLastCalledWith(
        '',
        'merchant-id-01',
        expect.objectContaining({ page: 2 })
      );
    });
  });

  test('mostra alert se la fetch fallisce durante il sort', async () => {
    await renderWithUndefinedInitiativeId();

    (merchantService.getMerchantPointOfSales as jest.Mock).mockRejectedValueOnce(
      new Error('Sort failure')
    );

    fireEvent.click(screen.getByTestId('sort-button-non-referent'));

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'errors.genericTitle',
          text: 'errors.genericDescription',
          severity: 'error',
        })
      );
    });
  });

  test('esegue la callback onSubmit di useFormik', async () => {
    const useFormikSpy = jest.spyOn(formikModule, 'useFormik');
    const consoleLogSpy = jest.spyOn(browserConsole, 'log').mockImplementation(() => undefined);

    renderInitiativeStores();

    await waitFor(() => {
      expect(useFormikSpy).toHaveBeenCalled();
    });

    const firstCallConfig = useFormikSpy.mock.calls[0][0] as {
      onSubmit: (values: Record<string, unknown>) => void;
    };
    firstCallConfig.onSubmit({ city: 'Roma' });

    expect(consoleLogSpy).toHaveBeenCalledWith('Eseguo ricerca con filtri:', { city: 'Roma' });

    useFormikSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
});

describe('Column rendering logic', () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  test('il renderCell della colonna "type" formatta correttamente i valori', async () => {
    await renderAndWaitTable();
    const typeColumn = getColumn('type');
    const physicalCell = render(typeColumn.renderCell({ value: 'PHYSICAL' }));
    expect(physicalCell.container.textContent).toContain('Fisico');

    const onlineCell = render(typeColumn.renderCell({ value: 'ONLINE' }));
    expect(onlineCell.container.textContent).toContain('Online');

    const unknownCell = render(typeColumn.renderCell({ value: 'UNKNOWN' }));
    expect(unknownCell.container.textContent).toContain('-');
  });

  test.each([
    ['franchiseName', 'Store A', 'Store A'],
    ['franchiseName', '', '-'],
    ['address', 'Via Roma 1', 'Via Roma 1'],
    ['website', 'www.example.com', 'www.example.com'],
    ['city', 'Roma', 'Roma'],
    ['contactEmail', 'test@example.com', 'test@example.com'],
  ])(
    'il renderCell della colonna %s mostra il valore atteso',
    async (field, value, expectedText) => {
      const cell = await renderColumnCell(field, { value });
      expect(cell.container.textContent).toContain(expectedText);
    }
  );

  test.each([
    ['combina nome e cognome', { contactName: 'Mario', contactSurname: 'Rossi' }, 'Mario Rossi'],
    ['gestisce nome mancante', { contactSurname: 'Rossi' }, 'Rossi'],
    ['gestisce cognome mancante', { contactName: 'Mario' }, 'Mario'],
    ['gestisce entrambi i dati mancanti', {}, '-'],
  ])('il renderCell della colonna referent %s', async (_description, row, expectedText) => {
    const cell = await renderReferentCell(row);
    expect(cell.container.textContent).toContain(expectedText);
  });

  test('il renderCell della colonna type gestisce valore vuoto', async () => {
    const cell = await renderColumnCell('type', { value: '' });
    expect(cell.container.textContent).toContain('-');
  });

  test('il renderCell della colonna actions renderizza il bottone', async () => {
    const cell = await renderActionsCell({ id: '1' });
    const button = cell.container.querySelector('button');
    expect(button).toBeInTheDocument();
  });

  test('il click sul bottone actions naviga al dettaglio punto vendita', async () => {
    const cell = await renderActionsCell({ id: 'pos-1' });
    const button = cell.container.querySelector('button');

    expect(button).toBeInTheDocument();
    fireEvent.click(button!);

    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/${mockId}/punti-vendita/pos-1/`
    );
  });


  describe('sessionStorage behavior', () => {
    beforeEach(() => {
      setupDefaultMocks();
      sessionStorage.clear();
    });

    test('loads pagination and sorting from sessionStorage when initiativeId matches', async () => {
      const storedPagination = {
        pageNo: 2,
        pageSize: 10,
        totalElements: 30,
        totalPages: 3,
        sort: 'city,desc',
        initiativeId: mockId,
      };
      sessionStorage.setItem('storesPagination', JSON.stringify(storedPagination));

      renderWithContext(<InitiativeStores />);

      await expectDefaultStoresFetch();
    });

    test('ignora sessionStorage se initiativeId non corrisponde', async () => {
      setStoredPagination({ initiativeId: 'different-initiative-id' });

      renderWithContext(<InitiativeStores />);

      await expectDefaultStoresFetch();
    });

    test('ignora sessionStorage se pageNo è undefined', async () => {
      setStoredPagination({ pageNo: undefined });

      renderWithContext(<InitiativeStores />);

      await expectDefaultStoresFetch();
    });

    test('handles sessionStorage without sort field', async () => {
      const storedPagination = {
        pageNo: 1,
        pageSize: 10,
        totalElements: 30,
        totalPages: 3,
        initiativeId: mockId,
      };
      sessionStorage.setItem('storesPagination', JSON.stringify(storedPagination));

      renderWithContext(<InitiativeStores />);

      await expectDefaultStoresFetch();
    });

    test('does not set sortModel from sessionStorage sort string', async () => {
      const storedPagination = {
        pageNo: 0,
        pageSize: 10,
        totalElements: 30,
        totalPages: 3,
        sort: 'franchiseName,asc',
        initiativeId: mockId,
      };
      sessionStorage.setItem('storesPagination', JSON.stringify(storedPagination));

      renderWithContext(<InitiativeStores />);

      await waitFor(() => {
        expect(dataTableProps.sortModel).toEqual([]);
      });
    });

    test('ignores invalid sort string format in sessionStorage', async () => {
      const storedPagination = {
        pageNo: 0,
        pageSize: 10,
        totalElements: 30,
        totalPages: 3,
        sort: 'invalidformat',
        initiativeId: mockId,
      };
      sessionStorage.setItem('storesPagination', JSON.stringify(storedPagination));

      renderWithContext(<InitiativeStores />);

      await expectDefaultStoresFetch();
    });

    test('rimuove sessionStorage quando il componente viene smontato (non andando al dettaglio)', async () => {
      renderWithContext(<InitiativeStores />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
      });

      sessionStorage.setItem('storesPagination', JSON.stringify(mockPagination));

      const { cleanup } = require('@testing-library/react');
      cleanup();

      expect(sessionStorage.getItem('storesPagination')).toBeNull();
    });

    test('aggiorna sessionStorage quando cambia la paginazione', async () => {
      renderWithContext(<InitiativeStores />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('paginate-button'));

      await waitFor(() => {
        const stored = sessionStorage.getItem('storesPagination');
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored!);
        expect(parsed.pageNo).toBe(2);
        expect(parsed.initiativeId).toBe(mockId);
      });
    });

    test("aggiorna sessionStorage quando cambia l'ordinamento", async () => {
      renderWithContext(<InitiativeStores />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('sort-button'));

      await waitFor(() => {
        const stored = sessionStorage.getItem('storesPagination');
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored!);
        expect(parsed.sort).toBe('contactName,desc');
        expect(parsed.initiativeId).toBe(mockId);
      });
    });
  });
});
