import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ReportedUsers from '../reportedUsers';
import * as merchantService from '../../../services/merchantService';
import * as jwtUtils from '../../../utils/jwt-utils';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import { useLocation } from 'react-router-dom';

// const mockHistoryPush = jest.fn();
const mockAddError = jest.fn();
const mockId = 'initiative-123';
const mockHistory= {
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

jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher', () => () => mockAddError);

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

describe('<ReportedUsers />', () => {
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
    renderWithContext(<ReportedUsers />);
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
    renderWithContext(<ReportedUsers />);
    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.noStores')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('pages.initiativeStores.addStoreNoResults'));
    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/initiative-123/punti-vendita/censisci/`
    );
  });

  test('gestisce il fallimento della chiamata API iniziale', async () => {
    const error = new Error('API Failure');
    (merchantService.getMerchantPointOfSales as jest.Mock).mockRejectedValue(error);
    renderWithContext(<ReportedUsers />);
    await waitFor(() => {
      expect(mockAddError).toHaveBeenCalledWith(expect.objectContaining({ error }));
    });
  });

  test('gestisce un errore API durante il reset dei filtri', async () => {
    renderWithContext(<ReportedUsers />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const error = new Error('Reset failure');
    (merchantService.getMerchantPointOfSales as jest.Mock).mockRejectedValue(error);

    const resetButton = screen.getByTestId('reset-filters-test');
    fireEvent.click(resetButton);

    /*await waitFor(() => {
      expect(mockAddError).toHaveBeenCalledWith(expect.objectContaining({ error }));
    });*/
  });

  test("gestisce la rimozione dell'ordinamento", async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    renderWithContext(<ReportedUsers />);
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
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    renderWithContext(<ReportedUsers />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const error = new Error('External catch failure');
    (merchantService.getMerchantPointOfSales as jest.Mock).mockRejectedValue(error);

    const resetButton = screen.getByTestId('reset-filters-test');
    fireEvent.click(resetButton);

    /*await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching stores:', error);
    });*/
    consoleErrorSpy.mockRestore();
  });

  test("gestisce la rimozione dell'ordinamento", async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    renderWithContext(<ReportedUsers />);
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

  test('non effettua la chiamata API se manca il merchant_id nel token', async () => {
    mockParseJwt.mockReturnValue({ not_merchant_id: 'some-value' });
    renderWithContext(<ReportedUsers />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(merchantService.getMerchantPointOfSales).not.toHaveBeenCalled();
  });

  test("mostra e nasconde l'alert di successo", async () => {
    jest.useFakeTimers();
    (useLocation as jest.Mock).mockReturnValue({ state: { showSuccessAlert: true } });
    renderWithContext(<ReportedUsers />);
    expect(
      screen.getByText('pages.initiativeStores.pointOfSalesUploadSuccess')
    ).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    await waitFor(() => {
      expect(mockHistory.replace).toHaveBeenCalledWith({
        state: { showSuccessAlert: false } 
    });
    });
    jest.useRealTimers();
  });

  test('applica i filtri e ricarica i dati', async () => {
    renderWithContext(<ReportedUsers />);
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
    renderWithContext(<ReportedUsers />);
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
    renderWithContext(<ReportedUsers />);
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
      // expect(screen.queryByText('pages.initiativeStores.noStores')).not.toBeInTheDocument();
    });
  });

  test('naviga alla pagina di aggiunta punto vendita al click sul pulsante', async () => {
    renderWithContext(<ReportedUsers />);
    await waitFor(() => expect(screen.getByText('Store A')).toBeInTheDocument());
    const addButton = screen.getByText('pages.initiativeStores.addStoreList');
    fireEvent.click(addButton);
    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/initiative-123/punti-vendita/censisci/`
    );
  });

  test("gestisce l'ordinamento della tabella", async () => {
    renderWithContext(<ReportedUsers />);
    await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('sort-button'));
    /*await waitFor(() => {
      expect(merchantService.getMerchantPointOfSales).toHaveBeenCalledWith(
        'merchant-id-01',
        expect.objectContaining({ sort: 'city,desc' })
      );
    });*/
  });

  test('gestisce la paginazione della tabella', async () => {
    renderWithContext(<ReportedUsers />);
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
    renderWithContext(<ReportedUsers />);
    await waitFor(() => expect(screen.getByText('Store A')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Store A'));
    expect(mockHistory.push).toHaveBeenCalledWith(
      `/portale-esercenti/initiative-123/punti-vendita/1/`
    );
  });
});

describe('Column rendering logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (merchantService.getMerchantPointOfSales as jest.Mock).mockResolvedValue({
      content: mockStores,
      ...mockPagination,
    });
    (useLocation as jest.Mock).mockReturnValue({ state: {} });
  });

  test('il renderCell della colonna "type" formatta correttamente i valori', async () => {
    renderWithContext(<ReportedUsers />);
    //await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const typeColumn = dataTableProps.columns.find((c: any) => c.field === 'type');
    expect(typeColumn.renderCell({ value: 'PHYSICAL' })).toBe('Fisico');
    expect(typeColumn.renderCell({ value: 'ONLINE' })).toBe('Online');
    expect(typeColumn.renderCell({ value: 'UNKNOWN' })).toBe('-');
  });

  test.skip('il renderCell della colonna "referent" gestisce dati completi e mancanti', async () => {
    renderWithContext(<ReportedUsers />);
    //await waitFor(() => expect(screen.getByTestId('mock-datatable')).toBeInTheDocument());

    const referentColumn = dataTableProps.columns.find((c: any) => c.field === 'referent');
    const MISSING_DATA_PLACEHOLDER = '-';

    expect(
      referentColumn.renderCell({ row: { contactName: 'Mario', contactSurname: 'Rossi' } })
    ).toBe('Mario Rossi');
    expect(referentColumn.renderCell({ row: { contactName: 'Mario' } })).toBe(
      `Mario ${MISSING_DATA_PLACEHOLDER}`
    );
    expect(referentColumn.renderCell({ row: { contactSurname: 'Rossi' } })).toBe(
      `${MISSING_DATA_PLACEHOLDER} Rossi`
    );
    expect(referentColumn.renderCell({ row: {} })).toBe(
      `${MISSING_DATA_PLACEHOLDER} ${MISSING_DATA_PLACEHOLDER}`
    );
  });
});
