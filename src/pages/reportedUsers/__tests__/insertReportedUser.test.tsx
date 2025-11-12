import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InsertReportedUser from '../insertReportedUser';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
  }),
  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...(Component.defaultProps || {}), t: (k: string) => k };
    return Component;
  },
}));

const mockPush = jest.fn();
const mockGoBack = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: mockPush,
    goBack: mockGoBack,
  }),
  useParams: () => ({ id: 'INITIATIVE_ID' }),
  matchPath: () => ({ params: { id: 'INITIATIVE_ID' } }),
  useLocation: () => mockUseLocation(),
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: () => ({
    partyId: 'PARTY_ID',
    externalId: 'EXT_ID',
    originId: 'ORIGIN_ID',
    description: 'DESC',
  }),
}));

jest.mock('../../../utils/jwt-utils', () => ({
  parseJwt: () => ({ merchant_id: 'MERCHANT_ID' }),
}));

const mockCreateReportedUser = jest.fn().mockResolvedValue({});
jest.mock('../../../services/merchantService', () => ({
  createReportedUser: (...args: any[]) => mockCreateReportedUser(...args),
}));

const mockGetReportedUser = jest.fn();
jest.mock('../../../api/MerchantsApiClient', () => ({
  MerchantApi: {
    getReportedUser: (...args: any[]) => mockGetReportedUser(...args),
  },
}));

jest.mock('../modalReportedUser', () => (props: any) => {
  if (!props.open) return null;
  return (
    <div data-testid="modal-reported-user">
      <button data-testid="modal-cancel" onClick={props.onCancel}>
        Cancel
      </button>
      <button data-testid="modal-confirm" onClick={props.onConfirm}>
        Confirm
      </button>
      <span data-testid="cf-modal">{props.cfModal}</span>
    </div>
  );
});

jest.mock('../CfTextField', () => (props: any) => {
  const { name, formik } = props;
  return (
    <input
      aria-label="pages.reportedUsers.cfPlaceholder"
      data-testid="cf-input"
      value={formik.values[name]}
      onChange={(e) => formik.setFieldValue(name, e.target.value)}
    />
  );
});

describe('InsertReportedUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({
      state: { merchantId: 'MERCHANT123', initiativeID: 'INITIATIVE456' },
    });
  });

  it('renders CF field, buttons and titles', () => {
    render(<InsertReportedUser />);
    expect(screen.getByLabelText('pages.reportedUsers.cfPlaceholder')).toBeInTheDocument();
    expect(screen.getByText('Utenti segnalati')).toBeInTheDocument();
    expect(screen.getByText('Segnalazione utenti')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-reportedUsers-button')).toBeInTheDocument();
    expect(screen.getByTestId('back-reportedUsers-button')).toBeInTheDocument();
  });

  it('shows error when trying to confirm with empty CF', async () => {
    render(<InsertReportedUser />);
    fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));
    await waitFor(() => {
      expect(mockGetReportedUser).not.toHaveBeenCalled();
    });
  });

  it('shows error when CF is invalid', async () => {
    render(<InsertReportedUser />);
    const input = screen.getByTestId('cf-input');
    fireEvent.change(input, { target: { value: 'INVALID' } });
    fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));
    await waitFor(() => {
      expect(mockGetReportedUser).not.toHaveBeenCalled();
    });
  });

  it('shows confirmation modal when CF is valid and not already reported', async () => {
    mockGetReportedUser.mockResolvedValueOnce([]);
    render(<InsertReportedUser />);
    fireEvent.change(screen.getByTestId('cf-input'), {
      target: { value: 'RSSMRA80A01F205X' },
    });
    fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));

    await waitFor(() => {
      expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument();
      expect(screen.getByTestId('cf-modal')).toHaveTextContent('RSSMRA80A01F205X');
    });
  });

  it('does not open modal when CF already reported', async () => {
    mockGetReportedUser.mockResolvedValueOnce([{ cf: 'RSSMRA80A01F205X' }]);
    render(<InsertReportedUser />);
    fireEvent.change(screen.getByTestId('cf-input'), {
      target: { value: 'RSSMRA80A01F205X' },
    });
    fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));
    await waitFor(() => {
      expect(mockGetReportedUser).toHaveBeenCalled();
      expect(screen.queryByTestId('modal-reported-user')).not.toBeInTheDocument();
    });
  });

  it('calls createReportedUser and redirects when modal confirmed', async () => {
    mockGetReportedUser.mockResolvedValueOnce([]);
    render(<InsertReportedUser />);
    fireEvent.change(screen.getByTestId('cf-input'), {
      target: { value: 'RSSMRA80A01F205X' },
    });
    fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));

    await waitFor(() => screen.getByTestId('modal-reported-user'));
    fireEvent.click(screen.getByTestId('modal-confirm'));

    await waitFor(() => {
      expect(mockCreateReportedUser).toHaveBeenCalledWith('INITIATIVE456', 'RSSMRA80A01F205X');
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it('closes modal when canceled', async () => {
    mockGetReportedUser.mockResolvedValueOnce([]);
    render(<InsertReportedUser />);
    fireEvent.change(screen.getByTestId('cf-input'), {
      target: { value: 'RSSMRA80A01F205X' },
    });
    fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));
    await waitFor(() => screen.getByTestId('modal-reported-user'));
    fireEvent.click(screen.getByTestId('modal-cancel'));
    await waitFor(() => {
      expect(screen.queryByTestId('modal-reported-user')).not.toBeInTheDocument();
    });
  });

  it('goes back when pressing back button', () => {
    render(<InsertReportedUser />);
    fireEvent.click(screen.getByTestId('back-reportedUsers-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('handles API error gracefully when checking CF', async () => {
    mockGetReportedUser.mockRejectedValueOnce(new Error('network error'));
    render(<InsertReportedUser />);
    fireEvent.change(screen.getByTestId('cf-input'), {
      target: { value: 'RSSMRA80A01F205X' },
    });
    fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));
    await waitFor(() => {
      expect(mockGetReportedUser).toHaveBeenCalled();
    });
  });

  it('handles API error gracefully when creating reported user', async () => {
    mockGetReportedUser.mockResolvedValueOnce([]);
    mockCreateReportedUser.mockRejectedValueOnce(new Error('create failed'));
    render(<InsertReportedUser />);
    fireEvent.change(screen.getByTestId('cf-input'), {
      target: { value: 'RSSMRA80A01F205X' },
    });
    fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));
    await waitFor(() => screen.getByTestId('modal-reported-user'));
    fireEvent.click(screen.getByTestId('modal-confirm'));
    await waitFor(() => {
      expect(mockCreateReportedUser).toHaveBeenCalled();
    });
  });

  it('gestisce correttamente handleKOError per UserId not found', async () => {
    mockGetReportedUser.mockResolvedValueOnce([]);
    mockCreateReportedUser.mockResolvedValueOnce({ status: 'KO', errorKey: 'UserId not found' });

    render(<InsertReportedUser />);
    fireEvent.change(screen.getByTestId('cf-input'), {
      target: { value: 'RSSMRA80A01F205X' },
    });
    fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));

    await waitFor(() => screen.getByTestId('modal-reported-user'));
    fireEvent.click(screen.getByTestId('modal-confirm'));

    await waitFor(() => {
      expect(mockCreateReportedUser).toHaveBeenCalled();
      expect(screen.getByLabelText('pages.reportedUsers.cfPlaceholder')).toBeInTheDocument();
    });
  });

  it('gestisce correttamente handleKOError per CF già presente', async () => {
    mockGetReportedUser.mockResolvedValueOnce([]);
    mockCreateReportedUser.mockResolvedValueOnce({ status: 'KO', errorKey: "CF doesn't match initiative or merchant" });

    render(<InsertReportedUser />);
    fireEvent.change(screen.getByTestId('cf-input'), {
      target: { value: 'RSSMRA80A01F205X' },
    });
    fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));

    await waitFor(() => screen.getByTestId('modal-reported-user'));
    fireEvent.click(screen.getByTestId('modal-confirm'));

    await waitFor(() => {
      expect(mockCreateReportedUser).toHaveBeenCalled();
    });
  });

  it('gestisce correttamente handleKOError per Service unavailable', async () => {
    mockGetReportedUser.mockResolvedValueOnce([]);
    mockCreateReportedUser.mockResolvedValueOnce({ status: 'KO', errorKey: 'Service unavailable' });

    render(<InsertReportedUser />);
    fireEvent.change(screen.getByTestId('cf-input'), {
      target: { value: 'RSSMRA80A01F205X' },
    });
    fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));

    await waitFor(() => screen.getByTestId('modal-reported-user'));
    fireEvent.click(screen.getByTestId('modal-confirm'));

    await waitFor(() => {
      expect(mockCreateReportedUser).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalled(); // redireziona dopo errore "Service unavailable"
    });
  });

  it('gestisce correttamente handleKOError per Already reported', async () => {
    mockGetReportedUser.mockResolvedValueOnce([]);
    mockCreateReportedUser.mockResolvedValueOnce({ status: 'KO', errorKey: 'Already reported' });

    render(<InsertReportedUser />);
    fireEvent.change(screen.getByTestId('cf-input'), {
      target: { value: 'RSSMRA80A01F205X' },
    });
    fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));

    await waitFor(() => screen.getByTestId('modal-reported-user'));
    fireEvent.click(screen.getByTestId('modal-confirm'));

    await waitFor(() => {
      expect(mockCreateReportedUser).toHaveBeenCalled();
    });
  });

  it('gestisce correttamente handleKOError per errori sconosciuti', async () => {
    mockGetReportedUser.mockResolvedValueOnce([]);
    mockCreateReportedUser.mockResolvedValueOnce({ status: 'KO', errorKey: 'Some other error' });

    render(<InsertReportedUser />);
    fireEvent.change(screen.getByTestId('cf-input'), {
      target: { value: 'RSSMRA80A01F205X' },
    });
    fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));

    await waitFor(() => screen.getByTestId('modal-reported-user'));
    fireEvent.click(screen.getByTestId('modal-confirm'));

    await waitFor(() => {
      expect(mockCreateReportedUser).toHaveBeenCalled();
    });
  });

});
