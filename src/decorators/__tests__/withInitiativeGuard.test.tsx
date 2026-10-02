// @ts-nocheck
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  clearInitiativeAnalyticsProperties,
  syncInitiativeAnalyticsProperties,
  trackAnalyticsPageView,
} from '../../services/analyticsService';
import WithInitiativeGuard, { InitiativeAnalyticsGuard } from '../withInitiativeGuard';

const mockUseLocation = useLocation as jest.Mock;
const mockUseSelector = useSelector as jest.Mock;
const mockClearInitiativeAnalyticsProperties =
  clearInitiativeAnalyticsProperties as jest.Mock;
const mockSyncInitiativeAnalyticsProperties = syncInitiativeAnalyticsProperties as jest.Mock;
const mockTrackAnalyticsPageView = trackAnalyticsPageView as jest.Mock;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Redirect: ({ to }: { to: string }) =>
    require('react').createElement('div', { 'data-testid': 'redirect' }, to),
  useLocation: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('../../services/analyticsService', () => ({
  clearInitiativeAnalyticsProperties: jest.fn(),
  syncInitiativeAnalyticsProperties: jest.fn(),
  trackAnalyticsPageView: jest.fn(),
}));

jest.mock('../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: jest.fn(),
}));

jest.mock('../../hooks/useCurrentInitiative', () => ({
  useCurrentInitiative: jest.fn(),
}));

jest.mock('../../hooks/useInitiativeConfig', () => ({
  useInitiativeConfig: jest.fn(),
}));

const mockUseCurrentInitiativeId = require('../../hooks/useCurrentInitiativeId')
  .useCurrentInitiativeId as jest.Mock;
const mockUseCurrentInitiative = require('../../hooks/useCurrentInitiative')
  .useCurrentInitiative as jest.Mock;
const mockUseInitiativeConfig = require('../../hooks/useInitiativeConfig')
  .useInitiativeConfig as jest.Mock;
const mockGetConfig = jest.fn();

describe('InitiativeAnalyticsGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({
      pathname: '/portale-esercenti/initiative-1/punti-vendita',
    });
    mockUseSelector.mockReturnValue([
      {
        initiativeId: 'initiative-1',
        initiativeName: 'Test initiative',
      },
    ]);
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: 'initiative-1',
      isValid: true,
      isListLoaded: true,
    });
    mockUseCurrentInitiative.mockReturnValue({
      initiativeId: 'initiative-1',
    });
    mockUseInitiativeConfig.mockReturnValue({ getConfig: mockGetConfig });
    mockGetConfig.mockResolvedValue(['/punte-vendita']);
  });

  it('synchronizes initiative properties and tracks a page view for a known initiative route', () => {
    const { getByText } = render(
      <InitiativeAnalyticsGuard>
        <span>content</span>
      </InitiativeAnalyticsGuard>
    );

    expect(getByText('content')).toBeInTheDocument();
    expect(mockSyncInitiativeAnalyticsProperties).toHaveBeenCalledWith(
      'Test initiative',
      'initiative-1'
    );
    expect(mockTrackAnalyticsPageView).toHaveBeenCalledWith(
      '/portale-esercenti/initiative-1/punti-vendita'
    );
    expect(mockClearInitiativeAnalyticsProperties).not.toHaveBeenCalled();
  });

  it('tracks initiative detail pages without exposing dynamic alphanumeric route parameters', () => {
    mockUseLocation.mockReturnValue({
      pathname:
        '/portale-esercenti/69e0fa95e21efa516c7b8dec/richieste-di-rimborso/7b198efa-3071-48b7-acb0-d166afb1b522',
    });
    mockUseSelector.mockReturnValue([
      {
        initiativeId: '69e0fa95e21efa516c7b8dec',
        initiativeName: 'Test initiative',
      },
    ]);

    render(
      <InitiativeAnalyticsGuard>
        <span>content</span>
      </InitiativeAnalyticsGuard>
    );

    expect(mockTrackAnalyticsPageView).toHaveBeenCalledWith(
      '/portale-esercenti/69e0fa95e21efa516c7b8dec/richieste-di-rimborso'
    );
  });

  it('does not track a page view when the route initiative is not in the list', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/portale-esercenti/missing-initiative/punti-vendita',
    });

    render(
      <InitiativeAnalyticsGuard>
        <span>content</span>
      </InitiativeAnalyticsGuard>
    );

    expect(mockSyncInitiativeAnalyticsProperties).toHaveBeenCalledWith(
      undefined,
      'missing-initiative'
    );
    expect(mockTrackAnalyticsPageView).not.toHaveBeenCalled();
  });

  it('clears initiative properties and tracks global pages', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/portale-esercenti/panoramica',
    });

    render(
      <InitiativeAnalyticsGuard>
        <span>content</span>
      </InitiativeAnalyticsGuard>
    );

    expect(mockClearInitiativeAnalyticsProperties).toHaveBeenCalled();
    expect(mockTrackAnalyticsPageView).toHaveBeenCalledWith(
      '/portale-esercenti/panoramica'
    );
    expect(mockSyncInitiativeAnalyticsProperties).not.toHaveBeenCalled();
  });

  it('clears initiative properties when the guard unmounts', () => {
    const { unmount } = render(
      <InitiativeAnalyticsGuard>
        <span>content</span>
      </InitiativeAnalyticsGuard>
    );

    unmount();

    expect(mockClearInitiativeAnalyticsProperties).toHaveBeenCalledTimes(1);
  });
});

describe('WithInitiativeGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSelector.mockReturnValue([
      {
        initiativeId: 'initiative-1',
        initiativeName: 'Test initiative',
      },
    ]);
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: 'initiative-1',
      isValid: true,
      isListLoaded: true,
    });
    mockUseCurrentInitiative.mockReturnValue({
      initiativeId: 'initiative-1',
    });
    mockUseInitiativeConfig.mockReturnValue({ getConfig: mockGetConfig });
    mockGetConfig.mockResolvedValue(['/punte-vendita']);
  });

  it('shows a loading state while the initiatives list is loading', () => {
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: 'initiative-1',
      isValid: true,
      isListLoaded: false,
    });

    const { getByText } = render(
      <WithInitiativeGuard route="/punte-vendita">
        <span>content</span>
      </WithInitiativeGuard>
    );

    expect(getByText('Caricamento iniziative...')).toBeInTheDocument();
  });

  it('redirects when there are no initiatives', () => {
    mockUseSelector.mockReturnValue([]);
    mockUseCurrentInitiative.mockReturnValue(undefined);

    const { getByTestId } = render(
      <WithInitiativeGuard route="/punte-vendita">
        <span>content</span>
      </WithInitiativeGuard>
    );

    expect(getByTestId('redirect')).toBeInTheDocument();
  });

  it('redirects when the route has no initiative id', () => {
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: undefined,
      isValid: false,
      isListLoaded: true,
    });

    const { getByTestId } = render(
      <WithInitiativeGuard route="/punte-vendita">
        <span>content</span>
      </WithInitiativeGuard>
    );

    expect(getByTestId('redirect')).toBeInTheDocument();
  });

  it('redirects when the initiative id is invalid', () => {
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: 'initiative-1',
      isValid: false,
      isListLoaded: true,
    });

    const { getByTestId } = render(
      <WithInitiativeGuard route="/punte-vendita">
        <span>content</span>
      </WithInitiativeGuard>
    );

    expect(getByTestId('redirect')).toBeInTheDocument();
  });

  it('redirects when the route is not allowed by the initiative configuration', async () => {
    mockGetConfig.mockResolvedValue([]);

    const { getByTestId } = render(
      <WithInitiativeGuard route="/punte-vendita">
        <span>content</span>
      </WithInitiativeGuard>
    );

    await waitFor(() => expect(getByTestId('redirect')).toBeInTheDocument());
  });

  it('renders children when the route is valid and allowed', async () => {
    const { getByText } = render(
      <WithInitiativeGuard route="/punte-vendita">
        <span>content</span>
      </WithInitiativeGuard>
    );

    await waitFor(() => expect(getByText('content')).toBeInTheDocument());
    expect(mockGetConfig).toHaveBeenCalledWith('routes', {
      initiativeId: 'initiative-1',
    });
  });
});
