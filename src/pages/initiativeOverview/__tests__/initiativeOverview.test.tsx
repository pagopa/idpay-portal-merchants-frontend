import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import InitiativeOverview from '../initiativeOverview';
import * as merchantService from '../../../services/merchantService';
import * as helperFunctions from '../../../helpers';

const mockPush = jest.fn();
const mockSetAlert = jest.fn();
const mockEditEmailModal = jest.fn();
const mockEditIbanModal = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...Component.defaultProps, t: (key: string) => key };
    return Component;
  },
}));

jest.mock('../../../services/merchantService', () => ({
  getMerchantDetail: jest.fn(),
  updateMerchantData: jest.fn(),
}));
jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({ t: (key: string) => key }),
}));
jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => ({ initiativeId: 'initiative-123' }),
}));
jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({ setAlert: mockSetAlert }),
}));
jest.mock('../../components/initiativeOverviewCard', () => ({
  __esModule: true,
  default: ({ title, subtitle, children }: any) => (
    <div>
      <div>{title}</div>
      {subtitle ? <div>{subtitle}</div> : null}
      <div>{children}</div>
    </div>
  ),
}));
jest.mock('../initiativeOverviewInfo', () => ({
  InitiativeOverviewInfo: () => <div>initiative-overview-info</div>,
}));
jest.mock('../EditEmailModal', () => ({
  EditEmailModal: (props: any) => {
    mockEditEmailModal(props);
    return props.isOpen ? <div data-testid="edit-email-modal-open" /> : null;
  },
}));
jest.mock('../EditIbanModal', () => ({
  EditIbanModal: (props: any) => {
    mockEditIbanModal(props);
    return props.isOpen ? <div data-testid="edit-iban-modal-open" /> : null;
  },
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ push: mockPush }),
}));

const mockHistory = createMemoryHistory();

const renderComponent = () => {
  mockHistory.push('/overview/initiative-123');
  return render(
    <Router history={mockHistory}>
      <InitiativeOverview />
    </Router>
  );
};

const mockMerchantDetail = {
  iban: 'IT60X0542811101000000123456',
  ibanHolder: 'Mario Rossi',
  activationDate: '2023-01-15T10:00:00Z',
  operativeEmail: 'merchant@test.it',
};

const mockMerchantDetailNoIBAN = {
  ibanHolder: 'Mario Rossi',
  activationDate: '2023-01-15T10:00:00Z',
  operativeEmail: 'merchant@test.it',
};

const mockMerchantDetailNoEmail = {
  iban: 'IT60X0542811101000000123456',
  ibanHolder: 'Mario Rossi',
  activationDate: '2023-01-15T10:00:00Z',
};

describe('InitiativeOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(helperFunctions, 'formatDate').mockReturnValue('15/01/2023');
    jest.spyOn(helperFunctions, 'formatIban').mockImplementation((value?: string) => `formatted-${value ?? ''}`);
    jest.spyOn(merchantService, 'getMerchantDetail').mockResolvedValue(mockMerchantDetail as any);
    jest.spyOn(merchantService, 'updateMerchantData').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders main content and merchant details', async () => {
    renderComponent();

    expect(screen.getByText('pages.initiativeOverview.title')).toBeInTheDocument();
    expect(screen.getByText('pages.initiativeOverview.subtitle')).toBeInTheDocument();

    expect(await screen.findByText('15/01/2023')).toBeInTheDocument();
    expect(screen.getByText('merchant@test.it')).toBeInTheDocument();
    expect(screen.getByText('pages.initiativeOverview.stores')).toBeInTheDocument();
    expect(screen.getByText('initiative-overview-info')).toBeInTheDocument();
    expect(merchantService.getMerchantDetail).toHaveBeenCalledWith('initiative-123');
  });

  it('shows placeholder values when merchant details are missing', async () => {
    jest.spyOn(merchantService, 'getMerchantDetail').mockResolvedValue({} as any);

    renderComponent();

    expect(await screen.findAllByText('-')).not.toHaveLength(0);
  });

  it('shows an error alert when loading details fails', async () => {
    jest.spyOn(merchantService, 'getMerchantDetail').mockRejectedValue(new Error('API Error Detail'));

    renderComponent();

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        title: 'errors.genericTitle',
        text: 'errors.genericDescription',
        isOpen: true,
        severity: 'error',
      });
    });
  });

  it('should show InfoBanner if IBAN is missing', async () => {
    jest.spyOn(merchantService, 'getMerchantDetail').mockResolvedValue(mockMerchantDetailNoIBAN);
    renderComponent();

    const bannerBtn = await screen.findByText('pages.initiativeOverview.ibanBanner.action')
    expect(screen.getByText('pages.initiativeOverview.ibanBanner.description')).toBeInTheDocument();

    fireEvent.click(bannerBtn);
    expect(mockEditIbanModal.mock.calls.at(-1)[0].isOpen).toBe(true);
  })

  it('should show InfoBanner if email is missing', async () => {
    jest.spyOn(merchantService, 'getMerchantDetail').mockResolvedValue(mockMerchantDetailNoEmail);
    renderComponent();

    const bannerBtn = await screen.findByText('pages.initiativeOverview.emailBanner.action')
    expect(screen.getByText('pages.initiativeOverview.emailBanner.description')).toBeInTheDocument();

    fireEvent.click(bannerBtn);
    expect(mockEditEmailModal.mock.calls.at(-1)[0].isOpen).toBe(true);
  })

  it('toggles visibility of iban data and opens edit modals', async () => {
    renderComponent();

    await screen.findByText('merchant@test.it');

    expect(screen.getByText('•••••••••••')).toBeInTheDocument();
    expect(screen.getByText('•••••••••••••••••••••••••••')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');

    await act(async () => {
      fireEvent.click(buttons[0]);
    });
    expect(mockEditEmailModal.mock.calls.at(-1)[0].isOpen).toBe(true);

    await act(async () => {
      fireEvent.click(buttons[1]);
    });
    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    expect(screen.getByText('formatted-IT60X0542811101000000123456')).toBeInTheDocument();
    expect(helperFunctions.formatIban).toHaveBeenCalledWith('IT60X0542811101000000123456');

    await act(async () => {
      fireEvent.click(buttons[2]);
    });
    expect(mockEditIbanModal.mock.calls.at(-1)[0].isOpen).toBe(true);
  });

  it('navigates to stores upload page when clicking add stores button', async () => {
    renderComponent();

    fireEvent.click(await screen.findByTestId('add-stores-button'));

    expect(mockPush).toHaveBeenCalledWith('/portale-esercenti/initiative-123/punti-vendita/censisci');
  });

  it('updates merchant data successfully through modal callbacks', async () => {
    renderComponent();

    await screen.findByText('merchant@test.it');

    const onUpdate = mockEditEmailModal.mock.calls.at(-1)[0].onUpdate;
    await act(async () => {
      await onUpdate({ operativeEmail: 'updated@test.it' }, 'operativeEmail');
    });

    expect(merchantService.updateMerchantData).toHaveBeenCalledWith('initiative-123', {
      operativeEmail: 'updated@test.it',
    });
    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        text: 'pages.initiativeOverview.successAlert.operativeEmail.edit',
        isOpen: true,
        severity: 'success',
      });
    });
    expect(merchantService.getMerchantDetail).toHaveBeenCalledTimes(2);
  });

  it('shows an error alert when merchant data update fails', async () => {
    jest.spyOn(merchantService, 'updateMerchantData').mockRejectedValue(new Error('update failed'));

    renderComponent();

    await screen.findByText('merchant@test.it');

    const onUpdate = mockEditIbanModal.mock.calls.at(-1)[0].onUpdate;
    await act(async () => {
      await onUpdate({ iban: 'NEWIBAN' });
    });

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        title: 'errors.genericTitle',
        text: 'errors.genericDescription',
        isOpen: true,
        severity: 'error',
      });
    });
  });
});
