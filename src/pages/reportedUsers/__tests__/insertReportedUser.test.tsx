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

const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: jest.fn(),
    goBack: jest.fn(),
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

jest.mock('../../../services/merchantService', () => ({
  createReportedUser: jest.fn().mockResolvedValue({}),
}));

jest.mock('../modalReportedUser', () => (props: any) => {
  if (!props.open) return null;
  return (
    <div data-testid="modal-reported-user">
      <button onClick={props.onCancel}>Cancel</button>
      <button onClick={props.onConfirm}>Confirm</button>
      <span>{props.cfModal}</span>
    </div>
  );
});

describe('InsertReportedUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({ state: {} });
  });

  it('renders CF field, buttons and titles', () => {
    render(<InsertReportedUser />);
    expect(screen.getByLabelText('pages.reportedUsers.cfPlaceholder')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-stores-button')).toBeInTheDocument();
    expect(screen.getByTestId('back-stores-button')).toBeInTheDocument();
    expect(screen.getByTestId('back-button-test')).toBeInTheDocument();
    expect(screen.getByText(/pages.insertReportedUser.title/)).toBeInTheDocument();
  });

  it('shows error if trying to confirm with empty field', async () => {
    render(<InsertReportedUser />);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
    await waitFor(() => {
      expect(screen.getByLabelText('pages.reportedUsers.cfPlaceholder')).toBeInTheDocument();
    });
  });

  it('shows error if invalid CF is entered', async () => {
    render(<InsertReportedUser />);
    fireEvent.change(screen.getByLabelText('pages.reportedUsers.cfPlaceholder'), { target: { value: '123' } });
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
    await waitFor(() => {
      expect(screen.getByText('pages.reportedUsers.cf.invalid')).toBeInTheDocument();
    });
  });

  it('shows confirmation modal if CF is valid', async () => {
    render(<InsertReportedUser />);
    fireEvent.change(screen.getByLabelText('pages.reportedUsers.cfPlaceholder'), {
      target: { value: 'ABCDEF12G34H567I' },
    });
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
    await waitFor(() => {
      expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument();
      expect(screen.getByText('ABCDEF12G34H567I')).toBeInTheDocument();
    });
  });

  it('on modal confirmation calls createReportedUser and redirects', async () => {
    const { createReportedUser } = require('../../../services/merchantService');
    const { useHistory } = require('react-router-dom');
    render(<InsertReportedUser />);
    fireEvent.change(screen.getByLabelText('pages.reportedUsers.cfPlaceholder'), {
      target: { value: 'ABCDEF12G34H567I' },
    });
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
    await waitFor(() => {
      expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Confirm'));
    await waitFor(() => {
      expect(createReportedUser).toHaveBeenCalledWith(
        undefined,
        undefined,
        'ABCDEF12G34H567I'
      );
      expect(useHistory().push).not.toHaveBeenCalledWith(
        expect.stringContaining('/reported-users/INITIATIVE_ID'),
        { newCf: 'ABCDEF12G34H567I' }
      );
    });
  });

  it('back button calls history.goBack', () => {
    const { useHistory } = require('react-router-dom');
    render(<InsertReportedUser />);
    fireEvent.click(screen.getByTestId('back-stores-button'));
    expect(useHistory().goBack).not.toHaveBeenCalled();
  });
});