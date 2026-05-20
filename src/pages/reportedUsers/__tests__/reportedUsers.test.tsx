import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import ReportedUsers from '../reportedUsers';
import { getReportedUser, deleteReportedUser } from '../../../services/merchantService';
import { parseJwt } from '../../../utils/jwt-utils';
import { ApiError } from '../../../api/ApiError';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';

[
  '../../../decorators/withLogin',
  '../../../decorators/withInitiativeGuard',
  '../../../decorators/withParties',
  '../../../decorators/withSelectedParty',
  '../../../decorators/withSelectedPartyProducts',
].forEach((path) => {
  jest.mock(path, () => ({
    __esModule: true,
    default: (Component: any) => Component,
  }));
});

jest.mock('../../../services/merchantService', () => ({
  __esModule: true,
  getReportedUser: jest.fn(),
  deleteReportedUser: jest.fn(),
}));

jest.mock('../../../utils/jwt-utils', () => ({
  __esModule: true,
  parseJwt: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  __esModule: true,
  storageTokenOps: {
    read: jest.fn(),
    write: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'pages.reportedUsers.title': 'Utenti Segnalati',
        'pages.reportedUsers.subtitle': 'Sottotitolo',
        'pages.reportedUsers.reportUser': 'Segnala Utente',
        'pages.reportedUsers.loading': 'Caricamento...',
        'pages.reportedUsers.noResultUser': 'Nessun utente trovato',
        'pages.reportedUsers.noUsers': 'Nessun utente presente',
        'pages.reportedUsers.validCf': 'La segnalazione è stata registrata',
        'pages.reportedUsers.removedCf': 'Utente rimosso con successo',
        'pages.reportedUsers.ModalReportedUser.title': 'Conferma eliminazione',
        'pages.reportedUsers.ModalReportedUser.description': `Vuoi eliminare ${params?.cf}?`,
        'pages.reportedUsers.ModalReportedUser.descriptionTwo': 'Operazione irreversibile',
        'pages.reportedUsers.ModalReportedUser.cancelText': 'Annulla',
        'pages.reportedUsers.ModalReportedUser.confirmText': 'Conferma',
        'validation.cf.invalid': 'Codice fiscale non valido',
      };
      return translations[key] || key;
    },
  }),
  Trans: ({ children, values }: any) => <span>{children}</span>,
  initReactI18next: {},
  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...(Component.defaultProps || {}), t: (k: string) => k };
    return Component;
  },
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  __esModule: true,
  useCurrentInitiativeId: () => ({
    initiativeId: '123',
  }),
}));

jest.mock('../../../components/dataTable/DataTable', () => ({
  __esModule: true,
  default: ({ rows, columns }: any) => (
    <div data-testid="data-table">
      {rows.map((row: any) => (
        <div key={row.id} data-testid={`row-${row.cf}`}>
          {row.cf}
          {columns.map(
            (col: any, idx: number) =>
              col.renderCell && <div key={idx}>{col.renderCell({ row })}</div>
          )}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../SearchTaxCode', () => ({
  __esModule: true,
  default: ({ formik, onSearch, onReset }: any) => (
    <div data-testid="search-tax-code">
      <input
        data-testid="cf-input"
        value={formik.values.cf}
        onChange={(e) => formik.setFieldValue('cf', e.target.value)}
      />
      <button data-testid="search-button" onClick={onSearch}>
        Cerca
      </button>
      <button data-testid="reset-button" onClick={onReset}>
        Reset
      </button>
    </div>
  ),
}));

jest.mock('../../../components/Alert/AlertComponent', () => ({
  __esModule: true,
  default: ({ text, isOpen }: any) => isOpen && <div data-testid="msg-alert">{text}</div>,
}));

jest.mock('../NoResultPaper', () => ({
  __esModule: true,
  default: ({ translationKey }: any) => <div data-testid="no-result-paper">{translationKey}</div>,
}));

jest.mock('../modalReportedUser', () => ({
  __esModule: true,
  default: ({ open, onCancel, onConfirm, description }: any) =>
    open ? (
      <div data-testid="modal-reported-user">
        <div data-testid="modal-description">{description}</div>
        <button data-testid="modal-cancel" onClick={onCancel}>
          Annulla
        </button>
        <button data-testid="modal-confirm" onClick={onConfirm}>
          Conferma
        </button>
      </div>
    ) : null,
}));

jest.mock('../columnsReportedUser', () => ({
  getReportedUsersColumns: (handleDelete: any) => [
    {
      field: 'cf',
      headerName: 'CF',
      renderCell: (params: any) => (
        <div>
          {params.row.cf}
          <button
            data-testid={`delete-${params.row.cf}`}
            onClick={() => handleDelete(params.row.cf)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ],
}));

import type { MockedFunction, Mocked } from 'jest-mock';
import { configureStore } from '@reduxjs/toolkit';
import { useAppSelector } from '../../../redux/hooks';
import { Provider } from 'react-redux';

const mockGetReportedUser = getReportedUser as MockedFunction<typeof getReportedUser>;
const mockDeleteReportedUser = deleteReportedUser as MockedFunction<typeof deleteReportedUser>;
const mockParseJwt = parseJwt as MockedFunction<typeof parseJwt>;
const mockStorageTokenOps = storageTokenOps as Mocked<typeof storageTokenOps>;

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(),
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));


const createMockStore = (initialState?: any) => {
  return configureStore({
    reducer: () => initialState
  });
};

const store = createMockStore();

describe('ReportedUsers Component', () => {
  (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }])
  let history: any;

  beforeEach(() => {
    history = createMemoryHistory();
    history.push('/initiative/123/reported-users');

    mockParseJwt.mockReturnValue({ merchant_id: 'MERCHANT123' });
    mockStorageTokenOps.read.mockReturnValue('mock-token');

    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const renderComponent = (locationState?: any) => {
    if (locationState) {
      history.push('/initiative/123/reported-users', locationState);
    }

    const localStore = configureStore({
      reducer: () => ({})
    });

    return render(
      <Provider store={store}>
        <Router history={history}>
          <Route path="/initiative/:initiative_id/reported-users">
            <ReportedUsers />
          </Route>
        </Router>
      </Provider>
    );
  };

  const searchByCF = async (cf: string) => {
    const input = screen.getByTestId('cf-input');
    fireEvent.change(input, { target: { value: cf } });
    fireEvent.click(screen.getByTestId('search-button'));
  };

  const openDeleteModal = async (cf: string) => {
    await searchByCF(cf);
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId(`delete-${cf}`));
    await waitFor(() => {
      expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument();
    });
  };

  const confirmDelete = async () => {
    fireEvent.click(screen.getByTestId('modal-confirm'));
  };

  describe('Rendering iniziale', () => {
    it('deve renderizzare il componente correttamente', () => {
      renderComponent();

      expect(screen.getByText('Utenti Segnalati')).toBeInTheDocument();
      expect(screen.getByText('Segnala Utente')).toBeInTheDocument();
      expect(screen.getByTestId('search-tax-code')).toBeInTheDocument();
    });

    it('deve mostrare NoResultPaper quando non ci sono utenti', () => {
      renderComponent();

      expect(screen.getByTestId('no-result-paper')).toBeInTheDocument();
    });
  });

  describe('Ricerca utente', () => {
    it('deve eseguire la ricerca e mostrare i risultati con array valido', async () => {
      const mockUsersData = [
        {
          fiscalCode: 'RSSMRA80A01H501U',
          reportedDate: '2024-01-01',
          trxChargeDate: '2024-01-02',
          transactionId: 'TRX123',
        },
      ];

      mockGetReportedUser.mockResolvedValueOnce(mockUsersData as any);

      renderComponent();

      const input = screen.getByTestId('cf-input');
      const searchButton = screen.getByTestId('search-button');

      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockGetReportedUser).toHaveBeenCalledWith('123', 'RSSMRA80A01H501U');
      });

      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
        expect(screen.getByTestId('row-RSSMRA80A01H501U')).toBeInTheDocument();
      });
    });

    it.each([
      { response: [] },
      { response: null },
      { response: new ApiError(404, 'Not Found'), isError: true },
      { response: new Error('API Error'), isError: true },
    ])('handles empty or error responses', async ({ response, isError }) => {
      if (isError) {
        mockGetReportedUser.mockRejectedValueOnce(response as any);
      } else {
        mockGetReportedUser.mockResolvedValueOnce(response as any);
      }

      renderComponent();
      await searchByCF('RSSMRA80A01H501U');

      await waitFor(() => {
        expect(screen.getByTestId('no-result-paper')).toBeInTheDocument();
      });
    });

    it('non deve eseguire la ricerca con CF vuoto', async () => {
      renderComponent();

      const searchButton = screen.getByTestId('search-button');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockGetReportedUser).not.toHaveBeenCalled();
      });
    });

    it('deve validare CF invalido', async () => {
      renderComponent();

      const input = screen.getByTestId('cf-input');
      const searchButton = screen.getByTestId('search-button');

      fireEvent.change(input, { target: { value: 'INVALID' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockGetReportedUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('Eliminazione utente', () => {
    it('deve aprire il modale di conferma eliminazione', async () => {
      const mockUsers = [
        {
          fiscalCode: 'RSSMRA80A01H501U',
          reportedDate: '2024-01-01',
          trxChargeDate: '2024-01-02',
          transactionId: 'TRX123',
        },
      ];

      mockGetReportedUser.mockResolvedValueOnce(mockUsers as any);

      renderComponent();

      await openDeleteModal('RSSMRA80A01H501U');
    });

    it('deve eliminare utente dopo conferma', async () => {
      const mockUsers = [
        {
          fiscalCode: 'RSSMRA80A01H501U',
          reportedDate: '2024-01-01',
          trxChargeDate: '2024-01-02',
          transactionId: 'TRX123',
        },
      ];

      mockGetReportedUser.mockResolvedValueOnce(mockUsers as any);
      mockDeleteReportedUser.mockResolvedValueOnce(undefined as any);

      renderComponent();

      const input = screen.getByTestId('cf-input');
      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-RSSMRA80A01H501U');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument();
      });

      await confirmDelete();

      await waitFor(() => {
        expect(mockDeleteReportedUser).toHaveBeenCalledWith(
          '123',
          'RSSMRA80A01H501U'
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Utenti Segnalati')).toBeInTheDocument();
      });
    });

    it('deve chiudere il modale se si annulla', async () => {
      const mockUsers = [
        {
          fiscalCode: 'RSSMRA80A01H501U',
          reportedDate: '2024-01-01',
          trxChargeDate: '2024-01-02',
          transactionId: 'TRX123',
        },
      ];

      mockGetReportedUser.mockResolvedValueOnce(mockUsers as any);

      renderComponent();

      const input = screen.getByTestId('cf-input');
      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-RSSMRA80A01H501U');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument();
      });

      const cancelButton = screen.getByTestId('modal-cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('modal-reported-user')).not.toBeInTheDocument();
      });

      expect(mockDeleteReportedUser).not.toHaveBeenCalled();
    });

    it('deve gestire errori durante eliminazione', async () => {
      const mockUsers = [
        {
          fiscalCode: 'RSSMRA80A01H501U',
          reportedDate: '2024-01-01',
          trxChargeDate: '2024-01-02',
          transactionId: 'TRX123',
        },
      ];

      mockGetReportedUser.mockResolvedValueOnce(mockUsers as any);
      mockDeleteReportedUser.mockRejectedValueOnce(new Error('Delete Error'));

      renderComponent();

      const input = screen.getByTestId('cf-input');
      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-RSSMRA80A01H501U');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('modal-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteReportedUser).toHaveBeenCalledWith('123', 'RSSMRA80A01H501U');
      });
    });

    it('non deve eliminare se merchantId non è presente', async () => {
      mockParseJwt.mockReturnValue({});

      const mockUsers = [
        {
          fiscalCode: 'RSSMRA80A01H501U',
          reportedDate: '2024-01-01',
          trxChargeDate: '2024-01-02',
          transactionId: 'TRX123',
        },
      ];

      mockGetReportedUser.mockResolvedValueOnce(mockUsers as any);

      renderComponent();

      const input = screen.getByTestId('cf-input');
      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-RSSMRA80A01H501U');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('modal-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteReportedUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('Reset funzionalità', () => {
    it('deve resettare la ricerca', async () => {
      const mockUsers = [
        {
          fiscalCode: 'RSSMRA80A01H501U',
          reportedDate: '2024-01-01',
          trxChargeDate: '2024-01-02',
          transactionId: 'TRX123',
        },
      ];

      mockGetReportedUser.mockResolvedValueOnce(mockUsers as any);

      renderComponent();

      const input = screen.getByTestId('cf-input');
      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      const resetButton = screen.getByTestId('reset-button');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();
        expect(screen.getByTestId('no-result-paper')).toBeInTheDocument();
      });
    });
  });

  describe('Navigazione', () => {
    it('deve navigare alla pagina di inserimento segnalazione', () => {
      renderComponent();

      const reportButton = screen.getByText('Segnala Utente');
      fireEvent.click(reportButton);

      expect(history.location.pathname).toBe(
        '/portale-esercenti/123/utenti-segnalati/segnalazione-utenti'
      );
      expect(history.location.state).toEqual({
        initiativeID: '123',
        merchantId: 'MERCHANT123',
      });
    });
  });

  describe('Location state', () => {
    it('deve mostrare alert di successo quando newCf è presente in location state', async () => {
      renderComponent({ newCf: 'RSSMRA80A01H501U' });

      await waitFor(() => {
        expect(screen.getByText('La segnalazione è stata registrata')).toBeInTheDocument();
      });
    });
  });

  describe('Alert temporizzati', () => {
    it('deve mostrare e poi nascondere alert di successo dopo 3 secondi', async () => {
      renderComponent({ newCf: 'RSSMRA80A01H501U' });

      // Deve comparire subito
      await waitFor(() => {
        expect(screen.getByText('La segnalazione è stata registrata')).toBeInTheDocument();
      });

      // Avanziamo il timer
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Deve sparire
      await waitFor(() => {
        expect(screen.queryByText('La segnalazione è stata registrata')).not.toBeInTheDocument();
      });
    });

    it('deve nascondere alert di eliminazione dopo 3 secondi', async () => {
      const mockUsers = [
        {
          fiscalCode: 'RSSMRA80A01H501U',
          reportedDate: '2024-01-01',
          trxChargeDate: '2024-01-02',
          transactionId: 'TRX123',
        },
      ];

      mockGetReportedUser.mockResolvedValueOnce(mockUsers as any);
      mockDeleteReportedUser.mockResolvedValueOnce(undefined as any);

      renderComponent();

      const input = screen.getByTestId('cf-input');
      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-RSSMRA80A01H501U');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('modal-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Utenti Segnalati')).toBeInTheDocument();
      });

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.queryByText('Utente rimosso con successo')).not.toBeInTheDocument();
      });
    });
  });

  describe('ShowEmptyAlert logic', () => {
    it('deve mostrare empty alert quando lastSearchedCF è valido ma user è vuoto', async () => {
      mockGetReportedUser.mockResolvedValueOnce([] as any);

      renderComponent();

      const input = screen.getByTestId('cf-input');
      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(screen.getByText('Nessun utente trovato')).toBeInTheDocument();
      });
    });

    it('non deve mostrare empty alert quando location.state.newCf è presente', async () => {
      mockGetReportedUser.mockResolvedValueOnce([] as any);

      renderComponent({ newCf: 'RSSMRA80A01H501U' });

      await waitFor(() => {
        expect(screen.queryByText('Nessun utente trovato')).not.toBeInTheDocument();
      });
    });
  });
});
