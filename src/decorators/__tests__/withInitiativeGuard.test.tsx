import React from 'react';
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

describe('WithInitiativeGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when list is not loaded', () => {
    mockUseSelector.mockReturnValue([{ id: '1' }]);
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: '1',
      isValid: true,
      isListLoaded: false,
    });

    render(
      <WithInitiativeGuard>
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
      <WithInitiativeGuard>
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
      <WithInitiativeGuard>
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
      <WithInitiativeGuard>
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

    render(
      <WithInitiativeGuard>
        <div>Protected</div>
      </WithInitiativeGuard>
    );

    expect(screen.getByText('Protected')).toBeInTheDocument();
  });
});
