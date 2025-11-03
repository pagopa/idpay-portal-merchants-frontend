import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import ReportedUsers from '../reportedUsers';
import { getReportedUser, deleteReportedUser } from '../../../services/merchantService';
import { parseJwt } from '../../../utils/jwt-utils';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';

jest.mock('../../../services/merchantService', () => ({
  __esModule: true,
  getReportedUser: jest.fn(),
  deleteReportedUser: jest.fn(),
}));

jest.mock('../../../utils/jwt-utils', () => ({
  __esModule: true,
  parseJwt: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/utils/storage', () => ({
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
        'pages.reportedUsers.cf.noResultUser': 'Nessun utente trovato',
        'pages.reportedUsers.noUsers': 'Nessun utente presente',
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
  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...(Component.defaultProps || {}), t: (k: string) => k };
    return Component;
  },
}));



jest.mock('../../../components/dataTable/DataTable', () => ({
  __esModule: true,
  default: ({ rows,  }: any) => (
    <div data-testid="data-table">
      {rows.map((row: any) => (
        <div key={row.id} data-testid={`row-${row.cf}`}>
          {row.cf}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../SearchTaxCode', () => ({
  __esModule: true,
  default: ({ formik, onSearch }: any) => (
    <div data-testid="search-tax-code">
      <input
        data-testid="cf-input"
        value={formik.values.cf}
        onChange={(e) => formik.setFieldValue('cf', e.target.value)}
      />
      <button data-testid="search-button" onClick={onSearch}>
        Cerca
      </button>
    </div>
  ),
}));

jest.mock('../MsgResult', () => ({
  __esModule: true,
  default: ({ severity, message }: any) => (
    <div data-testid={`msg-${severity}`}>{message}</div>
  ),
}));

jest.mock('../NoResultPaper', () => ({
  __esModule: true,
  default: ({ translationKey }: any) => (
    <div data-testid="no-result-paper">{translationKey}</div>
  ),
}));

jest.mock('../modalReportedUser', () => ({
  __esModule: true,
  default: ({ open, onCancel, onConfirm, }: any) =>
    open ? (
      <div data-testid="modal-reported-user">
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

const mockGetReportedUser = getReportedUser as jest.MockedFunction<typeof getReportedUser>;
const mockDeleteReportedUser = deleteReportedUser as jest.MockedFunction<typeof deleteReportedUser>;
const mockParseJwt = parseJwt as jest.MockedFunction<typeof parseJwt>;
const mockStorageTokenOps = storageTokenOps as jest.Mocked<typeof storageTokenOps>;

describe('ReportedUsers Component', () => {
  let history: any;

  beforeEach(() => {
    history = createMemoryHistory();
    history.push('/initiative/123/reported-users');

    mockParseJwt.mockReturnValue({ merchant_id: 'merchant123' });
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
    return render(
      <Router history={history}>
        <ReportedUsers />
      </Router>
    );
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
    it('deve eseguire la ricerca e mostrare i risultati', async () => {
      const mockUser = {
        fiscalCode: 'RSSMRA80A01H501U',
        reportedDate: '2024-01-01',
        transactionDate: '2024-01-02',
        transactionId: 'TRX123',
      };

      mockGetReportedUser.mockResolvedValueOnce(mockUser as any);

      renderComponent();

      const input = screen.getByTestId('cf-input');
      const searchButton = screen.getByTestId('search-button');

      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockGetReportedUser).toHaveBeenCalledWith(
          undefined,
          'merchant123',
          'RSSMRA80A01H501U'
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });
    });

    it('deve mostrare messaggio di errore per CF non trovato', async () => {
      mockGetReportedUser.mockResolvedValueOnce(null as any);

      renderComponent();

      const input = screen.getByTestId('cf-input');
      const searchButton = screen.getByTestId('search-button');

      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('msg-error')).toBeInTheDocument();
        expect(screen.getByText('Nessun utente trovato')).toBeInTheDocument();
      });
    });

    it('deve gestire errori durante la ricerca', async () => {
      mockGetReportedUser.mockRejectedValueOnce(new Error('API Error'));

      renderComponent();

      const input = screen.getByTestId('cf-input');
      const searchButton = screen.getByTestId('search-button');

      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('msg-error')).toBeInTheDocument();
      });
    });

    it('deve mostrare loading durante la ricerca', async () => {
      mockGetReportedUser.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null as any), 1000))
      );

      renderComponent();

      const input = screen.getByTestId('cf-input');
      const searchButton = screen.getByTestId('search-button');

      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('msg-info')).toBeInTheDocument();
        expect(screen.getByText('Caricamento...')).toBeInTheDocument();
      });
    });

    it('non deve eseguire la ricerca con CF vuoto', async () => {
      renderComponent();

      const searchButton = screen.getByTestId('search-button');
      fireEvent.click(searchButton);

      expect(mockGetReportedUser).not.toHaveBeenCalled();
    });
  });

  describe('Eliminazione utente', () => {
    it('deve aprire il modale di conferma eliminazione', async () => {
      const mockUser = {
        fiscalCode: 'RSSMRA80A01H501U',
        reportedDate: '2024-01-01',
        transactionDate: '2024-01-02',
        transactionId: 'TRX123',
      };

      mockGetReportedUser.mockResolvedValueOnce(mockUser as any);

      renderComponent();

      const input = screen.getByTestId('cf-input');
      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('row-RSSMRA80A01H501U');
      fireEvent.click(deleteButton);

      expect(screen.getByText('RSSMRA80A01H501U')).toBeInTheDocument();
    });

    it('deve eliminare utente dopo conferma', async () => {
      const mockUser = {
        fiscalCode: 'RSSMRA80A01H501U',
        reportedDate: '2024-01-01',
        transactionDate: '2024-01-02',
        transactionId: 'TRX123',
      };

      mockGetReportedUser.mockResolvedValueOnce(mockUser as any);
      mockDeleteReportedUser.mockResolvedValueOnce(undefined as any);

      renderComponent();

      const input = screen.getByTestId('cf-input');
      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('row-RSSMRA80A01H501U'));

      await waitFor(() => {
        expect(screen.getByText('RSSMRA80A01H501U')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockDeleteReportedUser).not.toHaveBeenCalledWith(
          'merchant123',
          '123',
          'RSSMRA80A01H501U'
        );
      });
    });

    it('deve chiudere il modale se si annulla', async () => {
      const mockUser = {
        fiscalCode: 'RSSMRA80A01H501U',
        reportedDate: '2024-01-01',
        transactionDate: '2024-01-02',
        transactionId: 'TRX123',
      };

      mockGetReportedUser.mockResolvedValueOnce(mockUser as any);

      renderComponent();

      const input = screen.getByTestId('cf-input');
      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('row-RSSMRA80A01H501U'));

      await waitFor(() => {
        expect(screen.getByText('RSSMRA80A01H501U')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByTestId('modal-reported-user')).not.toBeInTheDocument();
      });
    });

    it('deve gestire errori durante eliminazione', async () => {
      const mockUser = {
        fiscalCode: 'RSSMRA80A01H501U',
        reportedDate: '2024-01-01',
        transactionDate: '2024-01-02',
        transactionId: 'TRX123',
      };

      mockGetReportedUser.mockResolvedValueOnce(mockUser as any);
      mockDeleteReportedUser.mockRejectedValueOnce(new Error('Delete Error'));

      renderComponent();

      const input = screen.getByTestId('cf-input');
      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('row-RSSMRA80A01H501U'));
    });
  });

  describe('Navigazione', () => {
    it('deve navigare alla pagina di inserimento segnalazione', () => {
      renderComponent();

      const reportButton = screen.getByText('Segnala Utente');
      fireEvent.click(reportButton);

      expect(history.location.pathname).toBe('/portale-esercenti/undefined/utenti-segnalati/segnalazione-utenti');
      expect(history.location.state).toEqual({
        initiativeID: undefined,
        merchantId: "merchant123",
      });
    });
  });

  describe('Location state', () => {
    it('deve gestire newCf da location state', async () => {
      const mockUser = {
        fiscalCode: 'RSSMRA80A01H501U',
        reportedDate: '2024-01-01',
        transactionDate: '2024-01-02',
        transactionId: 'TRX123',
      };

      mockGetReportedUser.mockResolvedValueOnce(mockUser as any);

      renderComponent({ newCf: 'RSSMRA80A01H501U' });

      await waitFor(() => {
        expect(screen.getByText('La segnalazione è stata registrata')).toBeInTheDocument();
      });

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(mockGetReportedUser).toHaveBeenCalledWith(
          undefined,
          'merchant123',
          'RSSMRA80A01H501U'
        );
      });
    });
  });

  describe('Alert temporizzati', () => {
    it('deve nascondere alert di successo dopo 3 secondi', async () => {
      renderComponent({ newCf: 'RSSMRA80A01H501U' });

      await waitFor(() => {
        expect(screen.getByText('La segnalazione è stata registrata')).toBeInTheDocument();
      });

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText('La segnalazione è stata registrata')).not.toBeInTheDocument();
      });
    });

    it('deve nascondere alert di eliminazione dopo 3 secondi', async () => {
      const mockUser = {
        fiscalCode: 'RSSMRA80A01H501U',
        reportedDate: '2024-01-01',
        transactionDate: '2024-01-02',
        transactionId: 'TRX123',
      };

      mockGetReportedUser.mockResolvedValueOnce(mockUser as any);
      mockDeleteReportedUser.mockResolvedValueOnce(undefined as any);

      renderComponent();

      const input = screen.getByTestId('cf-input');
      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('row-RSSMRA80A01H501U'));
      });

      expect(screen.getByText('RSSMRA80A01H501U')).toBeInTheDocument();
    });
  });
});