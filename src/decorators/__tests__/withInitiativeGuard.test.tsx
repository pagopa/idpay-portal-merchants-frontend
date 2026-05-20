import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import WithInitiativeGuard from '../withInitiativeGuard';

const mockUseSelector = jest.fn();
jest.mock('react-redux', () => ({
  useSelector: (selector: any) => mockUseSelector(selector),
}));

const mockUseCurrentInitiativeId = jest.fn();
jest.mock('../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => mockUseCurrentInitiativeId(),
}));

const mockRedirect = jest.fn();
jest.mock('react-router-dom', () => ({
  Redirect: (props: any) => {
    mockRedirect(props);
    return <div data-testid="redirect" />;
  },
}));

jest.mock('../../routes', () => ({
  __esModule: true,
  default: {
    HOME: '/home',
  },
}));

const mockUseInitiativeConfig = jest.fn();
jest.mock('../../hooks/useInitiativeConfig', () => ({
  useInitiativeConfig: () => mockUseInitiativeConfig(),
}));

const mockUseCurrentInitiative = jest.fn();
jest.mock('../../hooks/useCurrentInitiative', () => ({
  useCurrentInitiative: () => mockUseCurrentInitiative(),
}));

describe('WithInitiativeGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default safe mock to avoid destructuring undefined
    mockUseInitiativeConfig.mockReturnValue({
      initiativeConfig: [],
    });

    mockUseCurrentInitiative.mockReturnValue({
      initiativeName: '',
      startDate: '',
    });
  });

  it('renders loading state when list is not loaded', () => {
    mockUseSelector.mockReturnValue([{ id: '1' }]);
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: '1',
      isValid: true,
      isListLoaded: false,
    });

    render(
      <WithInitiativeGuard route="test-route">
        <div>Protected</div>
      </WithInitiativeGuard>
    );

    expect(screen.getByText('Caricamento iniziative...')).toBeInTheDocument();
  });

  it('redirects to HOME when initiatives list is empty', () => {
    mockUseSelector.mockReturnValue([]);
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: '1',
      isValid: true,
      isListLoaded: true,
    });

    render(
      <WithInitiativeGuard route="test-route">
        <div>Protected</div>
      </WithInitiativeGuard>
    );

    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ to: '/home' }));
  });

  it('redirects to HOME when initiativeId is missing', () => {
    mockUseSelector.mockReturnValue([{ id: '1' }]);
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: undefined,
      isValid: true,
      isListLoaded: true,
    });

    render(
      <WithInitiativeGuard route="test-route">
        <div>Protected</div>
      </WithInitiativeGuard>
    );

    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ to: '/home' }));
  });

  it('redirects to HOME when initiativeId is invalid', () => {
    mockUseSelector.mockReturnValue([{ id: '1' }]);
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: '1',
      isValid: false,
      isListLoaded: true,
    });

    render(
      <WithInitiativeGuard route="test-route">
        <div>Protected</div>
      </WithInitiativeGuard>
    );

    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ to: '/home' }));
  });

  it('renders children when state is OK', () => {
    mockUseSelector.mockReturnValue([{ id: '1' }]);
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: '1',
      isValid: true,
      isListLoaded: true,
    });
    mockUseCurrentInitiative.mockReturnValue({
      initiativeName: 'Test',
      startDate: '2024-01-01',
    });
    mockUseInitiativeConfig.mockReturnValue({
      initiativeConfig: ['allowed-route'],
    });

    render(
      <WithInitiativeGuard route="allowed-route">
        <div>Protected</div>
      </WithInitiativeGuard>
    );

    expect(screen.getByText('Protected')).toBeInTheDocument();
  });

  it('redirects when route is not included in initiativeConfig', () => {
    mockUseSelector.mockReturnValue([{ id: '1' }]);
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: '1',
      isValid: true,
      isListLoaded: true,
    });
    mockUseCurrentInitiative.mockReturnValue({
      initiativeName: 'Test',
      startDate: '2024-01-01',
    });
    mockUseInitiativeConfig.mockReturnValue({
      initiativeConfig: ['another-route'],
    });

    render(
      <WithInitiativeGuard route="forbidden-route">
        <div>Protected</div>
      </WithInitiativeGuard>
    );

    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ to: '/home' }));
  });
});
