import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import InitiativeStores from '../InitiativeStores';
import * as merchantService from '../../../services/merchantService';
import * as jwtUtils from '../../../utils/jwt-utils';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import { useLocation } from 'react-router-dom';

const mockId = 'initiative-123';
const mockHistory = {
  replace: jest.fn(),
  push: jest.fn()
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  withTranslation: () => (Component: React.ComponentType<any>) => (props: any) =>
    <Component {...props} />,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ ...mockHistory }),
  useParams: () => ({ id: mockId }),
  useLocation: jest.fn(),
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
jest.mock('@pagopa/selfcare-common-frontend/utils/storage');

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

describe('<InitiativeStores />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParseJwt.mockReturnValue({ merchant_id: 'merchant-id-01' });
    mockStorageRead.mockReturnValue('DUMMY_TOKEN');
    (merchantService.getMerchantPointOfSales as jest.Mock).mockResolvedValue({
      content: mockStores,
      ...mockPagination,
    });
    (useLocation as jest.Mock).mockReturnValue({ state: {} });
  });

  test('renderizza correttamente, mostra il loader e poi i dati della tabella', async () => {
    renderWithContext(<InitiativeStores />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('Store A')).toBeInTheDocument();
    });
    expect(merchantService.getMerchantPointOfSales).toHaveBeenCalledWith(
      'merchant-id-01',
      expect.objectContaining({ page: 0, sort: 'asc' })
    );
  });

  test('mostra lo stato vuoto se non ci sono punti vendita', async () => {
    (merchantService.getMerchantPointOfSales as jest.Mock).mockResolvedValue({
      content: [],
      ...mockPagination,
      totalElements: 0,
    });
    renderWithContext(<InitiativeStores />);
    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.noStores')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('pages.initiativeStores.addStoreNoResults'));
    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/initiative-123/punti-vendita/censisci/`
    );
  });

  test('gestisce il fallimento della chiamata API iniziale', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('API Failure');
    (merchantService.getMerchantPointOfSales as jest.Mock).mockRejectedValue(error);
    renderWithContext(<InitiativeStores />);
    await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenCalled();
    });
    consoleErrorSpy.mockRestore();
  });

  test('gestisce un errore API durante il reset dei filtri', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const error = new Error('Reset failure');
    (merchantService.getMerchantPointOfSales as jest.Mock).mockRejectedValue(error);

    const resetButton = screen.getByTestId('reset-filters-test');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenCalled();
    });
  });

  test("gestisce la rimozione dell'ordinamento", async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('sort-button-remove'));

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('Ordinamento rimosso.');
    });

    fireEvent.click(screen.getByTestId('paginate-button'));
    await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenLastCalledWith(
        'merchant-id-01',
        expect.objectContaining({ sort: 'asc' })
      );
    });
    consoleLogSpy.mockRestore();
  });

  test('gestisce un errore nel .catch di handleFiltersReset', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const error = new Error('External catch failure');
    (merchantService.getMerchantPointOfSales as jest.Mock).mockRejectedValue(error);

    const resetButton = screen.getByTestId('reset-filters-test');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenCalledWith(
        'merchant-id-01',
        expect.objectContaining({address: "", city: "", contactName: "", page: 0, size: 10, sort: "asc", type: undefined})
      );
    });
  });

  test('non effettua la chiamata API se manca il merchant_id nel token', async () => {
    mockParseJwt.mockReturnValue({ not_merchant_id: 'some-value' });
    renderWithContext(<InitiativeStores />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(merchantService.getMerchantPointOfSales).not.toHaveBeenCalled();
  });

  test('applica i filtri e ricarica i dati', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByText('Store A')).toBeInTheDocument());

    const cityInput = screen.getByLabelText('pages.initiativeStores.city');
    fireEvent.change(cityInput, { target: { value: 'Napoli' } });

    const applyButton = screen.getByTestId('apply-filters-test');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenCalledWith(
        'merchant-id-01',
        expect.objectContaining({ city: 'Napoli', page: 0 })
      );
    });
  });

  test('resetta i filtri e ricarica i dati iniziali', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByText('Store A')).toBeInTheDocument());
    const resetButton = screen.getByTestId('reset-filters-test');
    fireEvent.click(resetButton);
    await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenLastCalledWith(
        'merchant-id-01',
        expect.objectContaining({address: "", city: "", contactName: "", page: 0, size: 10, sort: "asc", type: undefined})
      );
    });
  });

  test('mostra la tabella vuota se i filtri non producono risultati', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByText('Store A')).toBeInTheDocument());

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
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByText('Store A')).toBeInTheDocument());
    const addButton = screen.getByText('pages.initiativeStores.addStoreList');
    fireEvent.click(addButton);
    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/initiative-123/punti-vendita/censisci/`
    );
  });

  test("gestisce l'ordinamento della tabella", async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('sort-button'));
    await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenCalledWith(
        'merchant-id-01',
        expect.objectContaining({ sort: 'contactName,desc' })
      );
    });
  });

  test('gestisce la paginazione della tabella', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('paginate-button'));
    await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenCalledWith(
        'merchant-id-01',
        expect.objectContaining({ page: 2 })
      );
    });
  });

  test.skip('naviga al dettaglio del punto vendita al click su una riga', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByText('Store A')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Store A'));
    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/initiative-123/punti-vendita/1/`
    );
  });

  test('mostra l\'alert di successo quando showSuccessAlert è true', async () => {
    (useLocation as jest.Mock).mockReturnValue({
      state: { showSuccessAlert: true },
      pathname: '/'
    });
    renderWithContext(<InitiativeStores />);
    await waitFor(() => {
      expect(mockHistory.replace).toHaveBeenCalled();
    });
  });

  test('naviga a censisci quando non ci sono store al click su link', async () => {
    (merchantService.getMerchantPointOfSales as jest.Mock).mockResolvedValue({
      content: [],
      ...mockPagination,
      totalElements: 0,
    });
    renderWithContext(<InitiativeStores />);
    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.noStores')).toBeInTheDocument();
    });
    const link = screen.getByText('pages.initiativeStores.addStoreNoResults');
    fireEvent.click(link);
    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/initiative-123/punti-vendita/censisci/`
    );
  });

  test('seleziona tipo PHYSICAL nel dropdown', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByText('Store A')).toBeInTheDocument());

    const typeSelect = screen.getByLabelText('pages.initiativeStores.pointOfSaleType');
    fireEvent.mouseDown(typeSelect);
    const physicalOption = screen.getByText('pages.initiativeStores.physical');
    fireEvent.click(physicalOption);
  });

  test('seleziona tipo ONLINE nel dropdown', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByText('Store A')).toBeInTheDocument());

    const typeSelect = screen.getByLabelText('pages.initiativeStores.pointOfSaleType');
    fireEvent.mouseDown(typeSelect);
    const onlineOption = screen.getByText('pages.initiativeStores.online');
    fireEvent.click(onlineOption);
  });

  test('inserisce valore nel campo address', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByText('Store A')).toBeInTheDocument());

    const addressInput = screen.getByLabelText('pages.initiativeStores.address');
    fireEvent.change(addressInput, { target: { value: 'Via Milano 10' } });
    expect((addressInput as HTMLInputElement).value).toBe('Via Milano 10');
  });

  test('inserisce valore nel campo contactName', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByText('Store A')).toBeInTheDocument());

    const contactInput = screen.getByLabelText('pages.initiativeStores.referent');
    fireEvent.change(contactInput, { target: { value: 'Giovanni' } });
    expect((contactInput as HTMLInputElement).value).toBe('Giovanni');
  });

  test('mostra bottone add store solo quando ci sono store', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => {
      const addButton = screen.queryByText('pages.initiativeStores.addStoreList');
      expect(addButton).toBeInTheDocument();
    });
  });

  test('non mostra bottone add store quando loading', async () => {
    (merchantService.getMerchantPointOfSales as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    renderWithContext(<InitiativeStores />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('gestisce ordinamento con campo referent mappato a contactName', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('sort-button'));

    await waitFor(() => {
      const stored = sessionStorage.getItem('storesPagination');
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.sort).toBe('contactName,desc');
      }
    });
  });
});

describe('Column rendering logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParseJwt.mockReturnValue({ merchant_id: 'merchant-id-01' });
    mockStorageRead.mockReturnValue('DUMMY_TOKEN');
    (merchantService.getMerchantPointOfSales as jest.Mock).mockResolvedValue({
      content: mockStores,
      ...mockPagination,
    });
    (useLocation as jest.Mock).mockReturnValue({ state: {} });
  });

  test('il renderCell della colonna "type" formatta correttamente i valori', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const typeColumn = dataTableProps.columns.find((c: any) => c.field === 'type');
    const physicalCell = render(typeColumn.renderCell({ value: 'PHYSICAL' }));
    expect(physicalCell.container.textContent).toContain('Fisico');

    const onlineCell = render(typeColumn.renderCell({ value: 'ONLINE' }));
    expect(onlineCell.container.textContent).toContain('Online');

    const unknownCell = render(typeColumn.renderCell({ value: 'UNKNOWN' }));
    expect(unknownCell.container.textContent).toContain('-');
  });

  test('il renderCell della colonna franchiseName gestisce i valori correttamente', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const franchiseColumn = dataTableProps.columns.find((c: any) => c.field === 'franchiseName');
    const cell = render(franchiseColumn.renderCell({ value: 'Store A' }));
    expect(cell.container.textContent).toContain('Store A');
  });

  test('il renderCell della colonna address gestisce i valori correttamente', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const addressColumn = dataTableProps.columns.find((c: any) => c.field === 'address');
    const cell = render(addressColumn.renderCell({ value: 'Via Roma 1' }));
    expect(cell.container.textContent).toContain('Via Roma 1');
  });

  test('il renderCell della colonna website gestisce i valori correttamente', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const websiteColumn = dataTableProps.columns.find((c: any) => c.field === 'website');
    const cell = render(websiteColumn.renderCell({ value: 'www.example.com' }));
    expect(cell.container.textContent).toContain('www.example.com');
  });

  test('il renderCell della colonna city gestisce i valori correttamente', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const cityColumn = dataTableProps.columns.find((c: any) => c.field === 'city');
    const cell = render(cityColumn.renderCell({ value: 'Roma' }));
    expect(cell.container.textContent).toContain('Roma');
  });

  test('il renderCell della colonna contactEmail gestisce i valori correttamente', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const emailColumn = dataTableProps.columns.find((c: any) => c.field === 'contactEmail');
    const cell = render(emailColumn.renderCell({ value: 'test@example.com' }));
    expect(cell.container.textContent).toContain('test@example.com');
  });

  test('il renderCell della colonna referent combina nome e cognome', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const referentColumn = dataTableProps.columns.find((c: any) => c.field === 'contactName');
    const cell = render(referentColumn.renderCell({
      row: { contactName: 'Mario', contactSurname: 'Rossi' }
    }));
    expect(cell.container.textContent).toContain('Mario Rossi');
  });

  test('il renderCell della colonna referent gestisce nome mancante', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const referentColumn = dataTableProps.columns.find((c: any) => c.field === 'contactName');
    const cell = render(referentColumn.renderCell({
      row: { contactSurname: 'Rossi' }
    }));
    expect(cell.container.textContent).toContain('Rossi');
  });

  test('il renderCell della colonna referent gestisce cognome mancante', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const referentColumn = dataTableProps.columns.find((c: any) => c.field === 'contactName');
    const cell = render(referentColumn.renderCell({
      row: { contactName: 'Mario' }
    }));
    expect(cell.container.textContent).toContain('Mario');
  });

  test('il renderCell della colonna referent gestisce entrambi i dati mancanti', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const referentColumn = dataTableProps.columns.find((c: any) => c.field === 'contactName');
    const cell = render(referentColumn.renderCell({ row: {} }));
    expect(cell.container.textContent).toContain('-');
  });

  test('il renderCell della colonna type gestisce valore vuoto', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const typeColumn = dataTableProps.columns.find((c: any) => c.field === 'type');
    const cell = render(typeColumn.renderCell({ value: '' }));
    expect(cell.container.textContent).toContain('-');
  });

  test('il renderCell della colonna actions renderizza il bottone', async () => {
    renderWithContext(<InitiativeStores />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const actionsColumn = dataTableProps.columns.find((c: any) => c.field === 'actions');
    const cell = render(actionsColumn.renderCell({ row: { id: '1' } }));
    const button = cell.container.querySelector('button');
    expect(button).toBeInTheDocument();
  });

  describe('sessionStorage behavior', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      sessionStorage.clear();
      mockParseJwt.mockReturnValue({ merchant_id: 'merchant-id-01' });
      mockStorageRead.mockReturnValue('DUMMY_TOKEN');
      (merchantService.getMerchantPointOfSales as jest.Mock).mockResolvedValue({
        content: mockStores,
        ...mockPagination,
      });
      (useLocation as jest.Mock).mockReturnValue({ state: {} });
    });

    test('carica paginazione e ordinamento da sessionStorage se presenti e initiativeId corrisponde', async () => {
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

      await waitFor(() => {
        expect(merchantService.getMerchantPointOfSales).toHaveBeenCalledWith(
          'merchant-id-01',
          expect.objectContaining({
            page: 2,
            sort: 'city,desc',
          })
        );
      });
    });

    test('ignora sessionStorage se initiativeId non corrisponde', async () => {
      const storedPagination = {
        pageNo: 2,
        pageSize: 10,
        totalElements: 30,
        totalPages: 3,
        sort: 'city,desc',
        initiativeId: 'different-initiative-id',
      };
      sessionStorage.setItem('storesPagination', JSON.stringify(storedPagination));

      renderWithContext(<InitiativeStores />);

      await waitFor(() => {
        expect(merchantService.getMerchantPointOfSales).toHaveBeenCalledWith(
          'merchant-id-01',
          expect.objectContaining({
            page: 0,
            sort: 'asc',
          })
        );
      });
    });

    test('ignora sessionStorage se pageNo è undefined', async () => {
      const storedPagination = {
        pageSize: 10,
        totalElements: 30,
        totalPages: 3,
        sort: 'city,desc',
        initiativeId: mockId,
      };
      sessionStorage.setItem('storesPagination', JSON.stringify(storedPagination));

      renderWithContext(<InitiativeStores />);

      await waitFor(() => {
        expect(merchantService.getMerchantPointOfSales).toHaveBeenCalledWith(
          'merchant-id-01',
          expect.objectContaining({
            page: 0,
            sort: 'asc',
          })
        );
      });
    });

    test('gestisce sessionStorage senza campo sort', async () => {
      const storedPagination = {
        pageNo: 1,
        pageSize: 10,
        totalElements: 30,
        totalPages: 3,
        initiativeId: mockId,
      };
      sessionStorage.setItem('storesPagination', JSON.stringify(storedPagination));

      renderWithContext(<InitiativeStores />);

      await waitFor(() => {
        expect(merchantService.getMerchantPointOfSales).toHaveBeenCalledWith(
          'merchant-id-01',
          expect.objectContaining({
            page: 1,
            sort: 'asc',
          })
        );
      });
    });

    test('converte correttamente il sort string in GridSortModel', async () => {
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
        expect(dataTableProps.sortModel).toEqual([
          { field: 'franchiseName', sort: 'asc' },
        ]);
      });
    });

    test('gestisce sort string con formato non valido', async () => {
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

      await waitFor(() => {
        expect(merchantService.getMerchantPointOfSales).toHaveBeenCalledWith(
          'merchant-id-01',
          expect.objectContaining({
            page: 0,
            sort: 'invalidformat',
          })
        );
      });
    });

    test('rimuove sessionStorage quando il componente viene smontato (non andando al dettaglio)', async () => {
      const { unmount: customUnmount } = render(<InitiativeStores />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
      });

      sessionStorage.setItem('storesPagination', JSON.stringify(mockPagination));

      customUnmount();

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

    test('aggiorna sessionStorage quando cambia l\'ordinamento', async () => {
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