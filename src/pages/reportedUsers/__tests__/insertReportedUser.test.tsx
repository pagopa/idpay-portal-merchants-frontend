/// <reference types="jest" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InsertReportedUser from '../insertReportedUser';
import { configureStore } from '@reduxjs/toolkit';
import { useAppSelector } from '../../../redux/hooks';
import { Provider } from 'react-redux';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
  }),
  Trans: ({ children }: any) => <span>{children}</span>,
  withTranslation: () => (Component: any) => {
    Component.defaultProps = {
      ...(Component.defaultProps || {}),
      t: (k: string) => k,
    };
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
  useParams: () => ({ initiative_id: 'INITIATIVE_ID' }),
  matchPath: () => ({ params: { initiative_id: 'INITIATIVE_ID' } }),
  useLocation: () => mockUseLocation(),
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../../utils/jwt-utils', () => ({
  parseJwt: () => ({ merchant_id: 'MERCHANT_ID' }),
}));

const mockCreateReportedUser = jest.fn().mockResolvedValue({});
const mockGetReportedUser = jest.fn();

jest.mock('../../../services/merchantService', () => ({
  createReportedUser: (...args: any[]) => mockCreateReportedUser(...args),
  getReportedUser: (...args: any[]) => mockGetReportedUser(...args),
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

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(),
}));

const createMockStore = (initialState?: any) =>
  configureStore({
    reducer: () => initialState,
  });

const store = createMockStore();

const renderComponent = () =>
  render(
    <Provider store={store}>
      <InsertReportedUser />
    </Provider>
  );

const typeValidCF = async (cf = 'RSSMRA80A01F205X') => {
  fireEvent.change(screen.getByTestId('cf-input'), {
    target: { value: cf },
  });
};

const submitForm = async () => {
  fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));
};

const openModalWithValidCF = async () => {
  await typeValidCF();
  await submitForm();
  await waitFor(() => expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument());
};

const confirmModal = async () => {
  fireEvent.click(screen.getByTestId('modal-confirm'));
};

describe('InsertReportedUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }]);

    mockUseLocation.mockReturnValue({
      state: { merchantId: 'MERCHANT123', initiativeID: 'INITIATIVE456' },
    });
  });

  it('renders CF field, buttons and titles', () => {
    renderComponent();

    expect(screen.getByLabelText('pages.reportedUsers.cfPlaceholder')).toBeInTheDocument();
    expect(screen.getByText('Utenti segnalati')).toBeInTheDocument();
    expect(screen.getByText('Segnalazione utenti')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-reportedUsers-button')).toBeInTheDocument();
    expect(screen.getByTestId('back-reportedUsers-button')).toBeInTheDocument();
  });

  it('shows error when trying to confirm with empty CF', async () => {
    renderComponent();
    await submitForm();

    await waitFor(() => {
      expect(mockGetReportedUser).not.toHaveBeenCalled();
    });
  });

  it('shows error when CF is invalid', async () => {
    renderComponent();
    fireEvent.change(screen.getByTestId('cf-input'), {
      target: { value: 'INVALID' },
    });
    await submitForm();

    await waitFor(() => {
      expect(mockGetReportedUser).not.toHaveBeenCalled();
    });
  });

  it('shows confirmation modal when CF is valid and not already reported', async () => {
    mockGetReportedUser.mockResolvedValueOnce([]);

    renderComponent();
    await openModalWithValidCF();

    expect(screen.getByTestId('cf-modal')).toHaveTextContent('RSSMRA80A01F205X');
  });

  it('does not open modal when CF already reported', async () => {
    mockGetReportedUser.mockResolvedValueOnce([{ cf: 'RSSMRA80A01F205X' }]);

    renderComponent();
    await typeValidCF();
    await submitForm();

    await waitFor(() => {
      expect(mockGetReportedUser).toHaveBeenCalled();
      expect(screen.queryByTestId('modal-reported-user')).not.toBeInTheDocument();
    });
  });

  it('calls createReportedUser and redirects when modal confirmed', async () => {
    mockGetReportedUser.mockResolvedValueOnce([]);

    renderComponent();
    await openModalWithValidCF();
    await confirmModal();

    await waitFor(() => {
      expect(mockCreateReportedUser).toHaveBeenCalledWith('INITIATIVE456', 'RSSMRA80A01F205X');
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it('closes modal when canceled', async () => {
    mockGetReportedUser.mockResolvedValueOnce([]);

    renderComponent();
    await openModalWithValidCF();

    fireEvent.click(screen.getByTestId('modal-cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('modal-reported-user')).not.toBeInTheDocument();
    });
  });

  it('goes back when pressing back button', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('back-reportedUsers-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('handles API error gracefully when checking CF', async () => {
    mockGetReportedUser.mockRejectedValueOnce(new Error('network error'));

    renderComponent();
    await typeValidCF();
    await submitForm();

    await waitFor(() => {
      expect(mockGetReportedUser).toHaveBeenCalled();
    });
  });

  it.each([
    'UserId not found',
    "CF doesn't match initiative or merchant",
    'Service unavailable',
    'Already reported',
    'Some other error',
  ])('handles KO error: %s', async (errorKey: string) => {
    mockGetReportedUser.mockResolvedValueOnce([]);
    mockCreateReportedUser.mockResolvedValueOnce({
      status: 'KO',
      errorKey,
    });

    renderComponent();
    await openModalWithValidCF();
    await confirmModal();

    await waitFor(() => {
      expect(mockCreateReportedUser).toHaveBeenCalled();
    });
  });
});
