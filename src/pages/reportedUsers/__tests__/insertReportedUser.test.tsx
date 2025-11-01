import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InsertReportedUser from '../insertReportedUser';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
  }),
}));
jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: jest.fn(),
    goBack: jest.fn(),
  }),
  useParams: () => ({ id: 'INITIATIVE_ID' }),
  matchPath: () => ({ params: { id: 'INITIATIVE_ID' } }),
}));
jest.mock('../../redux/hooks', () => ({
  useAppSelector: () => ({
    partyId: 'PARTY_ID',
    externalId: 'EXT_ID',
    originId: 'ORIGIN_ID',
    description: 'DESC',
  }),
}));
jest.mock('../../utils/jwt-utils', () => ({
  parseJwt: () => ({ merchant_id: 'MERCHANT_ID' }),
}));
jest.mock('../../services/merchantService', () => ({
  createReportedUser: jest.fn().mockResolvedValue({}),
}));
jest.mock('../modalReportedUser', () => (props: any) => {
  if (!props.open) return null;
  return (
    <div data-testid="modal-reported-user">
      <button onClick={props.onCancel}>Annulla</button>
      <button onClick={props.onConfirm}>Conferma</button>
      <span>{props.cfModal}</span>
    </div>
  );
});

describe('InsertReportedUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderizza campo CF, bottoni e titoli', () => {
    render(<InsertReportedUser />);
    expect(screen.getByLabelText(/codice fiscale/i)).toBeInTheDocument();
    expect(screen.getByTestId('confirm-stores-button')).toBeInTheDocument();
    expect(screen.getByTestId('back-stores-button')).toBeInTheDocument();
    expect(screen.getByTestId('back-button-test')).toBeInTheDocument();
    expect(screen.getByText(/pages.insertReportedUser.title/)).toBeInTheDocument();
  });

  it('mostra errore se si tenta di confermare con campo vuoto', async () => {
    render(<InsertReportedUser />);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
    await waitFor(() => {
      expect(screen.getByText(/Campo obbligatorio/)).toBeInTheDocument();
    });
  });

  it('mostra errore se si inserisce un CF non valido', async () => {
    render(<InsertReportedUser />);
    fireEvent.change(screen.getByLabelText(/codice fiscale/i), { target: { value: '123' } });
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
    await waitFor(() => {
      expect(screen.getByText(/Codice fiscale non valido/)).toBeInTheDocument();
    });
  });

  it('mostra il modal di conferma se il CF è valido', async () => {
    render(<InsertReportedUser />);
    fireEvent.change(screen.getByLabelText(/codice fiscale/i), {
      target: { value: 'ABCDEF12G34H567I' },
    });
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
    await waitFor(() => {
      expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument();
      expect(screen.getByText('ABCDEF12G34H567I')).toBeInTheDocument();
    });
  });

  it('alla conferma del modal chiama createReportedUser e redirect', async () => {
    const { createReportedUser } = require('../../services/merchantService');
    const { useHistory } = require('react-router-dom');
    render(<InsertReportedUser />);
    fireEvent.change(screen.getByLabelText(/codice fiscale/i), {
      target: { value: 'ABCDEF12G34H567I' },
    });
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
    await waitFor(() => {
      expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Conferma'));
    await waitFor(() => {
      expect(createReportedUser).toHaveBeenCalledWith(
        'MERCHANT_ID',
        'INITIATIVE_ID',
        'ABCDEF12G34H567I'
      );
      expect(useHistory().push).toHaveBeenCalledWith(
        expect.stringContaining('/reported-users/INITIATIVE_ID'),
        { newCf: 'ABCDEF12G34H567I' }
      );
    });
  });

  it('il bottone indietro chiama history.goBack', () => {
    const { useHistory } = require('react-router-dom');
    render(<InsertReportedUser />);
    fireEvent.click(screen.getByTestId('back-stores-button'));
    expect(useHistory().goBack).toHaveBeenCalled();
  });
});
